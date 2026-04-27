using VideoBackend.Domain.Entities.User;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IUserAction
{
    IEnumerable<User> GetAllUsers();
    User? GetUserById(Guid id);
    User CreateUser(User user);
    User? UpdateUser(Guid id, User request);
    bool DeleteUser(Guid id);
}
