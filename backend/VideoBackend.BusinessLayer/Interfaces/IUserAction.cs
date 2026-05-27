using VideoBackend.Domain.Dtos.User;
using VideoBackend.Domain.Enums;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IUserAction
{
    Task<List<UserDto>> GetAllUserActionExecution();
    Task<UserDto?> GetUserByIdActionExecution(Guid id);
    Task<UserDto?> UpdateUserActionExecution(Guid id, UserDto dto, string? newPassword);
    Task<UserDto?> UpdateUserRoleActionExecution(Guid id, UserRole newRole);
    Task<UserDto?> BlockUserActionExecution(Guid id);
    Task<UserDto?> UnblockUserActionExecution(Guid id);
    Task<bool> DeleteUserActionExecution(Guid id);
    Task<LoginActionResult> LoginActionExecution(LoginDto dto);
    Task<LoginResponseDto?> RefreshActionExecution(string refreshToken);
    Task<UserDto?> RegisterActionExecution(RegisterDto dto);
    Task<bool> VerifyEmailActionExecution(string token);
    Task SendVerificationCodeActionExecution(string email);
    Task<bool> VerifyCodeActionExecution(string email, string code);
    Task<UserDto?> UploadAvatarActionExecution(Guid userId, string avatarUrl);
    Task<bool> ResendVerificationEmailActionExecution(Guid userId);
}
