namespace VideoBackend.Domain.Models.Video;

public class VideoTaskStatusResponse
{
    public Guid TaskId { get; set; }
    public string PoyoTaskId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Progress { get; set; }
    public List<string> VideoUrls { get; set; } = new();
    public string? ErrorMessage { get; set; }
}
