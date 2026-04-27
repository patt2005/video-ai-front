using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Repositories.Interfaces;
using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.BusinessLayer.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;

    public TaskService(ITaskRepository taskRepository)
    {
        _taskRepository = taskRepository;
    }

    public async Task<IEnumerable<EntityTask>> GetAllAsync()
    {
        return await _taskRepository.GetAllAsync();
    }

    public async Task<EntityTask?> GetByIdAsync(Guid id)
    {
        return await _taskRepository.GetByIdAsync(id);
    }

    public async Task<EntityTask> CreateAsync(EntityTask task)
    {
        return await _taskRepository.CreateAsync(task);
    }

    public async Task<EntityTask?> UpdateAsync(Guid id, EntityTask request)
    {
        var existing = await _taskRepository.GetByIdAsync(id);
        if (existing is null)
            return null;

        existing.Prompt = request.Prompt;
        existing.CreationDate = request.CreationDate;
        existing.UserId = request.UserId;
        existing.ContentId = request.ContentId;
        existing.Status = request.Status;

        return await _taskRepository.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _taskRepository.GetByIdAsync(id);
        if (existing is null)
            return false;

        await _taskRepository.DeleteAsync(existing);
        return true;
    }
}
