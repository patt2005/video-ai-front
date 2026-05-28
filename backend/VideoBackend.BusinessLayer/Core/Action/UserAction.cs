using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.User;
using VideoBackend.Domain.Entities.User;
using VideoBackend.Domain.Enums;

namespace VideoBackend.BusinessLayer.Core.Action;

public class UserAction
{
    protected readonly UserContext _context;
    protected readonly IConfiguration _configuration;
    protected readonly IEmailSender _emailSender;

    public UserAction(UserContext context, IConfiguration configuration, IEmailSender emailSender)
    {
        _context = context;
        _configuration = configuration;
        _emailSender = emailSender;
    }

    protected async Task<List<UserDto>> GetAllUserAction()
    {
        return await _context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                RegisterDate = u.RegisterDate,
                IsBlocked = u.IsBlocked,
                IsEmailVerified = u.IsEmailVerified,
                AvatarUrl = u.AvatarUrl
            })
            .ToListAsync();
    }

    protected async Task<UserDto?> GetUserByIdAction(Guid id)
    {
        var u = await _context.Users.FindAsync(id);
        if (u is null) return null;
        return new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Role = u.Role,
            RegisterDate = u.RegisterDate,
            IsBlocked = u.IsBlocked,
            IsEmailVerified = u.IsEmailVerified,
            AvatarUrl = u.AvatarUrl
        };
    }

    protected async Task<UserDto?> UpdateUserAction(Guid id, UserDto dto, string? newPassword)
    {
        var u = await _context.Users.FindAsync(id);
        if (u is null) return null;

        u.Username = dto.Username;
        u.Email = dto.Email;
        u.Role = dto.Role;
        if (!string.IsNullOrEmpty(newPassword))
        {
            u.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
        }
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Role = u.Role,
            RegisterDate = u.RegisterDate,
            IsBlocked = u.IsBlocked,
            IsEmailVerified = u.IsEmailVerified,
            AvatarUrl = u.AvatarUrl
        };
    }

    protected async Task<UserDto?> UpdateUserRoleAction(Guid id, UserRole newRole)
    {
        var u = await _context.Users.FindAsync(id);
        if (u is null) return null;

        u.Role = newRole;
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Role = u.Role,
            RegisterDate = u.RegisterDate,
            IsBlocked = u.IsBlocked,
            IsEmailVerified = u.IsEmailVerified,
            AvatarUrl = u.AvatarUrl
        };
    }

    protected async Task<UserDto?> BlockUserAction(Guid id)
        => await SetUserBlockedStatusAsync(id, true);

    protected async Task<UserDto?> UnblockUserAction(Guid id)
        => await SetUserBlockedStatusAsync(id, false);

    private async Task<UserDto?> SetUserBlockedStatusAsync(Guid id, bool isBlocked)
    {
        var u = await _context.Users.FindAsync(id);
        if (u is null) return null;

        u.IsBlocked = isBlocked;
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Role = u.Role,
            RegisterDate = u.RegisterDate,
            IsBlocked = u.IsBlocked,
            IsEmailVerified = u.IsEmailVerified,
            AvatarUrl = u.AvatarUrl
        };
    }

    protected async Task<bool> DeleteUserAction(Guid id)
    {
        var u = await _context.Users.FindAsync(id);
        if (u is null) return false;
        _context.Users.Remove(u);
        await _context.SaveChangesAsync();
        return true;
    }

    protected async Task<LoginActionResult> LoginAction(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
        {
            return LoginActionResult.Fail(LoginFailureReason.InvalidCredentials);
        }

        if (user.IsBlocked) return LoginActionResult.Fail(LoginFailureReason.Blocked);

        var response = await CreateLoginResponseAsync(user);
        return LoginActionResult.Success(response);
    }

    protected async Task<LoginResponseDto?> RefreshAction(string refreshToken)
    {
        var stored = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken);
        if (stored is null || stored.RevokedAt is not null || stored.ExpiresAt < DateTime.UtcNow)
        {
            return null;
        }

        var user = await _context.Users.FindAsync(stored.UserId);
        if (user is null || user.IsBlocked) return null;

        stored.RevokedAt = DateTime.UtcNow;
        return await CreateLoginResponseAsync(user);
    }

    private async Task<LoginResponseDto> CreateLoginResponseAsync(User user)
    {
        var accessToken = GenerateAccessToken(user);
        var refreshTokenStr = GenerateRefreshTokenString();

        _context.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        return new LoginResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshTokenStr,
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role
        };
    }

    private string GenerateAccessToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"]!;
        var jwtIssuer = _configuration["Jwt:Issuer"]!;
        var jwtAudience = _configuration["Jwt:Audience"]!;
        var expiresInHours = int.Parse(_configuration["Jwt:ExpiresInHours"]!);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiresInHours),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    protected async Task<bool> ResendVerificationEmailAction(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user is null || user.IsEmailVerified) return false;

        var existing = _context.EmailVerificationTokens
            .Where(t => t.UserId == userId && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow);
        foreach (var t in existing) t.UsedAt = DateTime.UtcNow;

        var token = GenerateRefreshTokenString();
        _context.EmailVerificationTokens.Add(new EmailVerificationToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        try
        {
            await _emailSender.SendVerificationEmailAsync(user.Email, token);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL ERROR] Resend failed: {ex.Message}");
        }
        return true;
    }

    protected async Task<UserDto?> UploadAvatarAction(Guid userId, string avatarUrl)
    {
        var u = await _context.Users.FindAsync(userId);
        if (u is null) return null;

        u.AvatarUrl = avatarUrl;
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Role = u.Role,
            RegisterDate = u.RegisterDate,
            IsBlocked = u.IsBlocked,
            IsEmailVerified = u.IsEmailVerified,
            AvatarUrl = u.AvatarUrl
        };
    }

    protected async Task<bool> VerifyEmailAction(string token)
    {
        var stored = await _context.EmailVerificationTokens.FirstOrDefaultAsync(t => t.Token == token);
        if (stored is null || stored.UsedAt is not null || stored.ExpiresAt < DateTime.UtcNow)
        {
            return false;
        }

        var user = await _context.Users.FindAsync(stored.UserId);
        if (user is null) return false;

        user.IsEmailVerified = true;
        stored.UsedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private static string GenerateRefreshTokenString()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }

    protected async Task RequestPasswordResetAction(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || user.IsBlocked) return;

        var existing = _context.PasswordResetTokens
            .Where(t => t.UserId == user.Id && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow);
        foreach (var t in existing) t.UsedAt = DateTime.UtcNow;

        var token = GenerateRefreshTokenString();
        _context.PasswordResetTokens.Add(new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        try
        {
            await _emailSender.SendPasswordResetEmailAsync(user.Email, token);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL ERROR] Password reset send failed: {ex.Message}");
        }
    }

    protected async Task<bool> ResetPasswordAction(string token, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrEmpty(newPassword) || newPassword.Length < 8)
            return false;

        var stored = await _context.PasswordResetTokens.FirstOrDefaultAsync(t => t.Token == token);
        if (stored is null || stored.UsedAt is not null || stored.ExpiresAt < DateTime.UtcNow)
            return false;

        var user = await _context.Users.FindAsync(stored.UserId);
        if (user is null || user.IsBlocked) return false;

        user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
        stored.UsedAt = DateTime.UtcNow;

        var activeRefresh = _context.RefreshTokens
            .Where(r => r.UserId == user.Id && r.RevokedAt == null);
        foreach (var r in activeRefresh) r.RevokedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    protected async Task SendVerificationCodeAction(string email)
    {
        // Invalidate any previous unused codes for this email
        var existing = _context.EmailVerificationCodes
            .Where(c => c.Email == email && !c.Used && c.ExpiresAt > DateTime.UtcNow);
        foreach (var c in existing) c.Used = true;

        var code = Random.Shared.Next(100000, 999999).ToString();
        _context.EmailVerificationCodes.Add(new EmailVerificationCode
        {
            Id = Guid.NewGuid(),
            Email = email,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            CreatedAt = DateTime.UtcNow,
            Used = false
        });
        await _context.SaveChangesAsync();
        await _emailSender.SendVerificationCodeAsync(email, code);
    }

    protected async Task<bool> VerifyCodeAction(string email, string code)
    {
        var stored = await _context.EmailVerificationCodes
            .Where(c => c.Email == email && c.Code == code && !c.Used && c.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync();

        if (stored is null) return false;

        stored.Used = true;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is not null && !user.IsEmailVerified)
        {
            user.IsEmailVerified = true;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    protected async Task<UserDto?> RegisterAction(RegisterDto dto)
    {
        var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existing is not null) return null;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = dto.Username,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.User,
            RegisterDate = DateTime.UtcNow,
            IsEmailVerified = false
        };
        _context.Users.Add(user);

        var verificationToken = GenerateRefreshTokenString();
        _context.EmailVerificationTokens.Add(new EmailVerificationToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = verificationToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        try
        {
            await _emailSender.SendVerificationEmailAsync(user.Email, verificationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL ERROR] Failed to send verification: {ex.Message}");
        }

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            RegisterDate = user.RegisterDate,
            IsBlocked = user.IsBlocked,
            IsEmailVerified = user.IsEmailVerified,
            AvatarUrl = user.AvatarUrl
        };
    }
}
