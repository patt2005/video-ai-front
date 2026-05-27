using VideoBackend.Domain.Enums;

namespace VideoBackend.Domain.Dtos.Task;

public class ContentDto
{
    public Guid Id { get; set; }
    public ContentType ContentType { get; set; }
    public string? Url { get; set; }
}
