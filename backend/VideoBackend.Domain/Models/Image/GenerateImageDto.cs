namespace VideoBackend.Domain.Models.Image;

public class GenerateImageDto
{
    public string Prompt { get; set; } = string.Empty;
    public string Size { get; set; } = "1:1";
    public string Resolution { get; set; } = "1K";
    public List<string>? ImageUrls { get; set; }
}
