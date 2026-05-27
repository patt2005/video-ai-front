using VideoBackend.Domain.Dtos.Task;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface ITaskAction
{
    Task<List<TaskDto>> GetAllTaskActionExecution();
    Task<List<TaskDto>> GetTasksByUserIdActionExecution(Guid userId);
    Task<TaskDto?> GetTaskByIdActionExecution(Guid id);
    Task<TaskDto> CreateTaskActionExecution(TaskDto dto);
    Task<TaskDto?> UpdateTaskActionExecution(Guid id, TaskDto dto);
    Task<bool> DeleteTaskActionExecution(Guid id);
}
