namespace VideoBackend.Domain.Models.Image;

public class GenerateImageResponse
{
    public Guid TaskId { get; set; }
    public string PoyoTaskId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
