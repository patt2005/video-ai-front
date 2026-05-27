using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.User;
using VideoBackend.Domain.Enums;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
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
    public async Task<IActionResult> GetAll()
    {
        var users = await _user.GetAllUserActionExecution();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _user.GetUserByIdActionExecution(id);
        if (user is null) return NotFound();
        return Ok(user);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var updated = await _user.UpdateUserActionExecution(id, request.User, request.NewPassword);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
    {
        var updated = await _user.UpdateUserRoleActionExecution(id, request.Role);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/block")]
    public async Task<IActionResult> Block(Guid id)
    {
        var updated = await _user.BlockUserActionExecution(id);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/unblock")]
    public async Task<IActionResult> Unblock(Guid id)
    {
        var updated = await _user.UnblockUserActionExecution(id);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
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
        var response = await _user.LoginActionExecution(dto);
        if (response is null) return Unauthorized("Invalid email or password");
        return Ok(response);
    }

    [HttpPost("Register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var created = await _user.RegisterActionExecution(dto);
        if (created is null) return Conflict("Email already is taken");
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
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
