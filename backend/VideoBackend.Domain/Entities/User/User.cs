using VideoBackend.Domain.Enums;

namespace VideoBackend.Domain.Entities.User;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public DateTime? RegisterDate { get; set; }
    public bool IsBlocked { get; set; }
    public bool IsEmailVerified { get; set; }
    public string? AvatarUrl { get; set; }
    public int Credits { get; set; }
}