using VideoBackend.Domain.Enums;

namespace VideoBackend.Domain.Models.Video;

public class GenerateVideoDto
{
    public string Prompt { get; set; } = string.Empty;
    public string AspectRatio { get; set; } = "16:9";
    public List<string>? ImageUrls { get; set; }
    public VideoModel Model { get; set; } = VideoModel.Veo31Fast;
}
