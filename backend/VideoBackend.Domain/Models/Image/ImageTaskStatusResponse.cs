namespace VideoBackend.Domain.Models.Image;

public class ImageTaskStatusResponse
{
    public Guid TaskId { get; set; }
    public string PoyoTaskId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Progress { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public string? ErrorMessage { get; set; }
}
