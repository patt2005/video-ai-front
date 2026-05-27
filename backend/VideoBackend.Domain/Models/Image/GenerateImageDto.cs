using VideoBackend.Domain.Enums;

namespace VideoBackend.Domain.Models.Image;

public class GenerateImageDto
{
    public Guid UserId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string Size { get; set; } = "1:1";
    public string Resolution { get; set; } = "1K";
    public ImageModel Model { get; set; } = ImageModel.NanoBanana2;
}
