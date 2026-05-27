using Microsoft.Extensions.Configuration;
using VideoBackend.BusinessLayer.Core.Action;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Dtos.File;

namespace VideoBackend.BusinessLayer.Structure.ActionExecution;

public class FileActionExecution : FileAction, IFileAction
{
    public FileActionExecution(IConfiguration configuration) : base(configuration) { }

    public Task<PrepareUploadResponse> PrepareUpload(PrepareUploadRequest request)
        => PrepareUploadAction(request);

    public Task<string> GetPresignedUrl(string key)
        => GetPresignedUrlAction(key);
}
