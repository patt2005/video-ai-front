using VideoBackend.Domain.Dtos.File;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IFileAction
{
    Task<PrepareUploadResponse> PrepareUpload(PrepareUploadRequest request);
    Task<string> GetPresignedUrl(string key);
}
