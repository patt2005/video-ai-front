using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Entities.User;

namespace VideoBackend.BusinessLayer.Core;

public class UserActions
{
    protected IEnumerable<User> GetAllUsersActionExecution()
    {
        using var db = new UserContext();
        return db.Users.ToList();
    }

    protected User? GetUserByIdActionExecution(Guid id)
    {
        using var db = new UserContext();
        return db.Users.Find(id);
    }

    protected User CreateUserActionExecution(User user)
    {
        using var db = new UserContext();
        if (user.Id == Guid.Empty)
            user.Id = Guid.NewGuid();

        db.Users.Add(user);
        db.SaveChanges();
        return user;
    }

    protected User? UpdateUserActionExecution(Guid id, User request)
    {
        using var db = new UserContext();
        var existing = db.Users.Find(id);
        if (existing is null)
            return null;

        existing.Username = request.Username;
        existing.Role = request.Role;
        existing.Email = request.Email;
        existing.Password = request.Password;
        existing.RegisterDate = request.RegisterDate;

        db.SaveChanges();
        return existing;
    }

    protected bool DeleteUserActionExecution(Guid id)
    {
        using var db = new UserContext();
        var existing = db.Users.Find(id);
        if (existing is null)
            return false;

        db.Users.Remove(existing);
        db.SaveChanges();
        return true;
    }
}
