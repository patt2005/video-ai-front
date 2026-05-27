namespace VideoBackend.Domain.Dtos.Video;

public class ExploreVideoDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public string? Prompt { get; set; }
    public string? Model { get; set; }
    public string ContentType { get; set; } = "video";
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserAvatar { get; set; }
}
