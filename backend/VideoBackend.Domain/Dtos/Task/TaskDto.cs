using VideoBackend.Domain.Enums;

namespace VideoBackend.Domain.Dtos.Task;

public class TaskDto
{
    public Guid Id { get; set; }
    public string? Prompt { get; set; }
    public DateTime? CreationDate { get; set; }
    public Guid UserId { get; set; }
    public Guid ContentId { get; set; }
    public GenerationStatus Status { get; set; }
    public ContentDto? Content { get; set; }
}
