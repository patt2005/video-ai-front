using VideoBackend.Domain.Enums;
using TaskStatus = VideoBackend.Domain.Enums.TaskStatus;

namespace VideoBackend.Domain.Dtos.Task;

public class TaskDto
{
    public Guid Id { get; set; }
    public string? Prompt { get; set; }
    public DateTime? CreationDate { get; set; }
    public Guid UserId { get; set; }
    public Guid ContentId { get; set; }
    public TaskStatus Status { get; set; }
    public ContentDto? Content { get; set; }
}
