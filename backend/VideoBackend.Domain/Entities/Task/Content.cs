using VideoBackend.Domain.Enums;

namespace VideoBackend.Domain.Entities.Task;

public class Content
{
    public Guid Id { get; set; }
    public ContentType ContentType { get; set; }
    public string? Url { get; set; }
}