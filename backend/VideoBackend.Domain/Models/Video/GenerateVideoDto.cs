using VideoBackend.Domain.Enums;

namespace VideoBackend.Domain.Models.Video;

public class GenerateVideoDto
{
    public Guid UserId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public VideoModel Model { get; set; } = VideoModel.GoogleVeo31;
}
