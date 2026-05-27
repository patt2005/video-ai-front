namespace VideoBackend.Domain.Dtos.File;

public class PrepareUploadRequest
{
    public string FileName { get; set; } = "";
    public string? ContentType { get; set; }
    public string? UploadPrefix { get; set; }
}
