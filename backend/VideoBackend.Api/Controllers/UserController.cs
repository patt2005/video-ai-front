using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.User;
using System.ComponentModel.DataAnnotations;
using VideoBackend.Domain.Enums;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserAction _user;

    public UserController(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        SubscriptionContext subscriptionContext,
        IConfiguration configuration)
    {
        var bl = new BusinessLogic(userContext, taskContext, videoContext, subscriptionContext, configuration);
        _user = bl.UserAction();
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _user.GetAllUserActionExecution();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _user.GetUserByIdActionExecution(id);
        if (user is null) return NotFound();
        return Ok(user);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();
        var u = await _user.GetUserByIdActionExecution(userId.Value);
        if (u is null) return NotFound();
        return Ok(u);
    }

    [HttpGet("{id:guid}/public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicProfile(Guid id)
    {
        var user = await _user.GetUserByIdActionExecution(id);
        if (user is null) return NotFound();
        return Ok(new { id = user.Id, userName = user.Username, userAvatar = (string?)null });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var updated = await _user.UpdateUserActionExecution(id, request.User, request.NewPassword);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/credits")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddCredits(Guid id, [FromBody] AddCreditsRequest request)
    {
        using var ctx = new UserContext();
        var u = await ctx.Users.FindAsync(id);
        if (u is null) return NotFound();
        u.Credits += request.Delta;
        await ctx.SaveChangesAsync();
        return Ok(new { id = u.Id, credits = u.Credits });
    }

    [HttpPatch("{id:guid}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
    {
        var updated = await _user.UpdateUserRoleActionExecution(id, request.Role);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/block")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Block(Guid id)
    {
        var updated = await _user.BlockUserActionExecution(id);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/unblock")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Unblock(Guid id)
    {
        var updated = await _user.UnblockUserActionExecution(id);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _user.DeleteUserActionExecution(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPost("Login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _user.LoginActionExecution(dto);
        return result.FailureReason switch
        {
            LoginFailureReason.None         => Ok(result.Response),
            LoginFailureReason.Blocked      => StatusCode(403, new { error = "Account is blocked" }),
            _                               => Unauthorized(new { error = "Invalid email or password" })
        };
    }

    [HttpPost("Register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var created = await _user.RegisterActionExecution(dto);
        if (created is null) return Conflict("Email already is taken");
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("Refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto dto)
    {
        var response = await _user.RefreshActionExecution(dto.RefreshToken);
        if (response is null) return Unauthorized(new { error = "Invalid or expired refresh token" });
        return Ok(response);
    }

    [HttpPost("VerifyEmail")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
    {
        var ok = await _user.VerifyEmailActionExecution(dto.Token);
        if (!ok) return BadRequest(new { error = "Invalid or expired verification token" });
        return Ok(new { verified = true });
    }

    [HttpPost("SendCode")]
    [AllowAnonymous]
    public async Task<IActionResult> SendCode([FromBody] SendVerificationCodeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { error = "Email is required" });

        await _user.SendVerificationCodeActionExecution(dto.Email);
        return Ok(new { sent = true });
    }

    [HttpPost("VerifyCode")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyCode([FromBody] VerifyCodeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Code))
            return BadRequest(new { error = "Email and code are required" });

        var ok = await _user.VerifyCodeActionExecution(dto.Email, dto.Code);
        if (!ok) return BadRequest(new { error = "Invalid or expired code" });
        return Ok(new { verified = true });
    }

    [HttpPost("ForgotPassword")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { error = "Email is required" });

        await _user.RequestPasswordResetActionExecution(dto.Email);
        return Ok(new { sent = true });
    }

    [HttpPost("ResetPassword")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrEmpty(dto.NewPassword))
            return BadRequest(new { error = "Token and new password are required" });

        if (dto.NewPassword.Length < 8)
            return BadRequest(new { error = "Password must be at least 8 characters" });

        var ok = await _user.ResetPasswordActionExecution(dto.Token, dto.NewPassword);
        if (!ok) return BadRequest(new { error = "Invalid or expired reset token" });
        return Ok(new { reset = true });
    }

    [HttpPost("me/ResendVerification")]
    public async Task<IActionResult> ResendVerificationEmail()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var ok = await _user.ResendVerificationEmailActionExecution(userId.Value);
        if (!ok) return BadRequest(new { error = "Email already verified or user not found" });
        return Ok(new { sent = true });
    }

    [HttpPost("me/avatar")]
    [RequestSizeLimit(3 * 1024 * 1024)]
    public async Task<IActionResult> UploadMyAvatar([FromForm] IFormFile file, [FromServices] IWebHostEnvironment env)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        if (file is null || file.Length == 0) return BadRequest(new { error = "File is required" });
        if (file.Length > 2 * 1024 * 1024) return BadRequest(new { error = "File too large (max 2MB)" });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowed.Contains(file.ContentType)) return BadRequest(new { error = "Only JPEG, PNG, WEBP allowed" });

        var ext = file.ContentType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => ".bin"
        };

        var avatarsDir = Path.Combine(env.ContentRootPath, "wwwroot", "avatars");
        Directory.CreateDirectory(avatarsDir);

        var fileName = $"{userId.Value}_{DateTime.UtcNow.Ticks}{ext}";
        var filePath = Path.Combine(avatarsDir, fileName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var relativeUrl = $"/avatars/{fileName}";
        var updated = await _user.UploadAvatarActionExecution(userId.Value, relativeUrl);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(JwtRegisteredClaimNames.Sub) ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim is null) return null;
        return Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}

public class UpdateUserRequest
{
    public UserDto User { get; set; } = new();
    public string? NewPassword { get; set; }
}

public class UpdateRoleRequest
{
    public UserRole Role { get; set; }
}

public class AddCreditsRequest
{
    public int Delta { get; set; }
}
