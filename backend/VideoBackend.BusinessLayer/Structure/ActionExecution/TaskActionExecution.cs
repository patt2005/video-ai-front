using VideoBackend.BusinessLayer.Core.Action;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Task;

namespace VideoBackend.BusinessLayer.Structure.ActionExecution;

public class TaskActionExecution : TaskAction, ITaskAction
{
    public TaskActionExecution(TaskContext context) : base(context) { }

    public Task<List<TaskDto>> GetAllTaskActionExecution()
        => GetAllTaskAction();

    public Task<List<TaskDto>> GetTasksByUserIdActionExecution(Guid userId)
        => GetTasksByUserIdAction(userId);

    public Task<TaskDto?> GetTaskByIdActionExecution(Guid id)
        => GetTaskByIdAction(id);

    public Task<TaskDto> CreateTaskActionExecution(TaskDto dto)
        => CreateTaskAction(dto);

    public Task<TaskDto?> UpdateTaskActionExecution(Guid id, TaskDto dto)
        => UpdateTaskAction(id, dto);

    public Task<bool> DeleteTaskActionExecution(Guid id)
        => DeleteTaskAction(id);
}
