using VideoBackend.Domain.Entities.User;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IUserService
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User?> GetByIdAsync(Guid id);
    Task<User> CreateAsync(User user);
    Task<User?> UpdateAsync(Guid id, User request);
    Task<bool> DeleteAsync(Guid id);
}
