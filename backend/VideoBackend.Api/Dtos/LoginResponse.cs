using VideoBackend.Domain.Enums;
namespace VideoBackend.Api.Dtos;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    
}