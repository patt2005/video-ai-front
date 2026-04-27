using VideoBackend.BusinessLayer.Core;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Entities.User;

namespace VideoBackend.BusinessLayer.Structure;

public class UserActionExecution : UserActions, IUserAction
{
    public IEnumerable<User> GetAllUsers() => GetAllUsersActionExecution();

    public User? GetUserById(Guid id) => GetUserByIdActionExecution(id);

    public User CreateUser(User user) => CreateUserActionExecution(user);

    public User? UpdateUser(Guid id, User request) => UpdateUserActionExecution(id, request);

    public bool DeleteUser(Guid id) => DeleteUserActionExecution(id);
}
