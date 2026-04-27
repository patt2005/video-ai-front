using VideoBackend.BusinessLayer.Core;
using VideoBackend.BusinessLayer.Interfaces;
using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.BusinessLayer.Structure;

public class TaskActionExecution : TaskActions, ITaskAction
{
    public IEnumerable<EntityTask> GetAllTasks() => GetAllTasksActionExecution();

    public EntityTask? GetTaskById(Guid id) => GetTaskByIdActionExecution(id);

    public EntityTask CreateTask(EntityTask task) => CreateTaskActionExecution(task);

    public EntityTask? UpdateTask(Guid id, EntityTask request) => UpdateTaskActionExecution(id, request);

    public bool DeleteTask(Guid id) => DeleteTaskActionExecution(id);
}
