using Microsoft.Extensions.Configuration;
using VideoBackend.BusinessLayer.Core.Action;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.User;
using VideoBackend.Domain.Enums;

namespace VideoBackend.BusinessLayer.Structure.ActionExecution;

public class UserActionExecution : UserAction, IUserAction
{
    public UserActionExecution(UserContext context, IConfiguration configuration, IEmailSender emailSender)
        : base(context, configuration, emailSender) { }

    public Task<List<UserDto>> GetAllUserActionExecution()
        => GetAllUserAction();

    public Task<UserDto?> GetUserByIdActionExecution(Guid id)
        => GetUserByIdAction(id);

    public Task<UserDto?> UpdateUserActionExecution(Guid id, UserDto dto, string? newPassword)
        => UpdateUserAction(id, dto, newPassword);

    public Task<UserDto?> UpdateUserRoleActionExecution(Guid id, UserRole newRole)
        => UpdateUserRoleAction(id, newRole);

    public Task<UserDto?> BlockUserActionExecution(Guid id)
        => BlockUserAction(id);

    public Task<UserDto?> UnblockUserActionExecution(Guid id)
        => UnblockUserAction(id);

    public Task<bool> DeleteUserActionExecution(Guid id)
        => DeleteUserAction(id);

    public Task<LoginActionResult> LoginActionExecution(LoginDto dto)
        => LoginAction(dto);

    public Task<LoginResponseDto?> RefreshActionExecution(string refreshToken)
        => RefreshAction(refreshToken);

    public Task<UserDto?> RegisterActionExecution(RegisterDto dto)
        => RegisterAction(dto);

    public Task<bool> VerifyEmailActionExecution(string token)
        => VerifyEmailAction(token);

    public Task SendVerificationCodeActionExecution(string email)
        => SendVerificationCodeAction(email);

    public Task<bool> VerifyCodeActionExecution(string email, string code)
        => VerifyCodeAction(email, code);

    public Task<UserDto?> UploadAvatarActionExecution(Guid userId, string avatarUrl)
        => UploadAvatarAction(userId, avatarUrl);

    public Task<bool> ResendVerificationEmailActionExecution(Guid userId)
        => ResendVerificationEmailAction(userId);
}
