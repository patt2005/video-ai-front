using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.DataAccessLayer.Repositories.Interfaces;

public interface ITaskRepository
{
    Task<IEnumerable<EntityTask>> GetAllAsync();
    Task<EntityTask?> GetByIdAsync(Guid id);
    Task<EntityTask> CreateAsync(EntityTask task);
    Task<EntityTask> UpdateAsync(EntityTask task);
    Task DeleteAsync(EntityTask task);
}
