using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.User;
using VideoBackend.Domain.Entities.User;
using VideoBackend.Domain.Enums;

namespace VideoBackend.BusinessLayer.Core.Action;

public class UserAction
{
    protected readonly UserContext _context;
    protected readonly IConfiguration _configuration;

    public UserAction(UserContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
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
                RegisterDate = u.RegisterDate
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
            RegisterDate = u.RegisterDate
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
            RegisterDate = u.RegisterDate
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

    protected async Task<LoginResponseDto?> LoginAction(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
        {
            return null;
        }

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

        return new LoginResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role
        };
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
            RegisterDate = DateTime.UtcNow
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            RegisterDate = user.RegisterDate
        };
    }
}
