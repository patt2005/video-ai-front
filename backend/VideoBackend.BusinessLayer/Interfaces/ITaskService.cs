using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface ITaskService
{
    Task<IEnumerable<EntityTask>> GetAllAsync();
    Task<EntityTask?> GetByIdAsync(Guid id);
    Task<EntityTask> CreateAsync(EntityTask task);
    Task<EntityTask?> UpdateAsync(Guid id, EntityTask request);
    Task<bool> DeleteAsync(Guid id);
}
