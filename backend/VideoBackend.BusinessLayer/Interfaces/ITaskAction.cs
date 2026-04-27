using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface ITaskAction
{
    IEnumerable<EntityTask> GetAllTasks();
    EntityTask? GetTaskById(Guid id);
    EntityTask CreateTask(EntityTask task);
    EntityTask? UpdateTask(Guid id, EntityTask request);
    bool DeleteTask(Guid id);
}
