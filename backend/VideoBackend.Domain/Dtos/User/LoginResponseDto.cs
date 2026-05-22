using VideoBackend.Domain.Enums;

namespace VideoBackend.Domain.Dtos.User;

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}
