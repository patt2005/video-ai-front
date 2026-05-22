using VideoBackend.Domain.Dtos.User;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IUserAction
{
    Task<List<UserDto>> GetAllUserActionExecution();
    Task<UserDto?> GetUserByIdActionExecution(Guid id);
    Task<UserDto?> UpdateUserActionExecution(Guid id, UserDto dto, string? newPassword);
    Task<bool> DeleteUserActionExecution(Guid id);
    Task<LoginResponseDto?> LoginActionExecution(LoginDto dto);
    Task<UserDto?> RegisterActionExecution(RegisterDto dto);
}
