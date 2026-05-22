using Microsoft.Extensions.Configuration;
using VideoBackend.BusinessLayer.Core.Action;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.User;

namespace VideoBackend.BusinessLayer.Structure.ActionExecution;

public class UserActionExecution : UserAction, IUserAction
{
    public UserActionExecution(UserContext context, IConfiguration configuration)
        : base(context, configuration) { }

    public Task<List<UserDto>> GetAllUserActionExecution()
        => GetAllUserAction();

    public Task<UserDto?> GetUserByIdActionExecution(Guid id)
        => GetUserByIdAction(id);

    public Task<UserDto?> UpdateUserActionExecution(Guid id, UserDto dto, string? newPassword)
        => UpdateUserAction(id, dto, newPassword);

    public Task<bool> DeleteUserActionExecution(Guid id)
        => DeleteUserAction(id);

    public Task<LoginResponseDto?> LoginActionExecution(LoginDto dto)
        => LoginAction(dto);

    public Task<UserDto?> RegisterActionExecution(RegisterDto dto)
        => RegisterAction(dto);
}
