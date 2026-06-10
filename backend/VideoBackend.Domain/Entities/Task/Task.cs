using VideoBackend.Domain.Enums;

namespace VideoBackend.Domain.Entities.Task;

public class Task
{
    public Guid Id { get; set; }
    public string? Prompt { get; set; }
    public DateTime? CreationDate { get; set; }
    public Guid UserId { get; set; }
    public User.User? User { get; set; }
    public Guid ContentId { get; set; }
    public Content? Content { get; set; }
    public GenerationStatus Status { get; set; }
    public string? PoyoTaskId { get; set; }
    public int CreditsSpent { get; set; }
}
