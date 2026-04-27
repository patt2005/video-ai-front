using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Repositories.Interfaces;
using VideoBackend.Domain.Entities.User;

namespace VideoBackend.BusinessLayer.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _userRepository.GetAllAsync();
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public async Task<User> CreateAsync(User user)
    {
        return await _userRepository.CreateAsync(user);
    }

    public async Task<User?> UpdateAsync(Guid id, User request)
    {
        var existing = await _userRepository.GetByIdAsync(id);
        if (existing is null)
            return null;

        existing.Username = request.Username;
        existing.Role = request.Role;
        existing.Email = request.Email;
        existing.Password = request.Password;
        existing.RegisterDate = request.RegisterDate;

        return await _userRepository.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _userRepository.GetByIdAsync(id);
        if (existing is null)
            return false;

        await _userRepository.DeleteAsync(existing);
        return true;
    }
}
