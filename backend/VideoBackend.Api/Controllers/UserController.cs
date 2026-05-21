using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Entities.User;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims; 
using System.Text;
using Microsoft.IdentityModel.Tokens;
using VideoBackend.Api.Dtos;
using BCrypt.Net;
using VideoBackend.Domain.Enums;
using Microsoft.AspNetCore.Authorization;


namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly UserContext _context;
    private readonly IConfiguration _configuration;

    public UserController(UserContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<User>> GetById(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<User>> Create([FromBody] User user)
    {
        if (user.Id == Guid.Empty)
        {
            user.Id = Guid.NewGuid();
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<User>> Update(Guid id, [FromBody] User request)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser is null)
        {
            return NotFound();
        }

        existingUser.Username = request.Username;
        existingUser.Role = request.Role;
        existingUser.Email = request.Email;
        existingUser.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
        existingUser.RegisterDate = request.RegisterDate;

        await _context.SaveChangesAsync();
        return Ok(existingUser);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser is null)
        {
            return NotFound();
        }

        _context.Users.Remove(existingUser);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("Login")]
    [AllowAnonymous] public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
        {
            return Unauthorized("Invalid email or password");
        }

        var jwtKey = _configuration["JWT:Key"]!;
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
            signingCredentials: credentials
        );
        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        var response = new LoginResponse
        {
            Token = tokenString,
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role
        };

        return Ok(response);
    }

    [HttpPost("Register")]
    [AllowAnonymous]
    public async Task<ActionResult<User>> Register([FromBody] RegisterRequest request)
    {
        var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existing is not null)
        {
            return Conflict("Email already is taken");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.User,
            RegisterDate = DateTime.UtcNow

        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);    

    }
}