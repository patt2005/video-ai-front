using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using VideoBackend.Domain.Dtos.File;

namespace VideoBackend.BusinessLayer.Core.Action;

public class FileAction
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;
    private const string DefaultUploadPrefix = "uploads/";
    private const int PresignedUrlExpirySeconds = 3600;

    public FileAction(IConfiguration configuration)
    {
        _bucketName = configuration["S3:Bucket"] ?? "";

        var accessKey = configuration["S3:AccessKey"];
        var secretKey = configuration["S3:SecretKey"];
        var endpoint = configuration["S3:Endpoint"] ?? "https://storage.railway.app";

        var config = new AmazonS3Config
        {
            ServiceURL = endpoint,
            ForcePathStyle = true
        };

        _s3 = !string.IsNullOrEmpty(accessKey) && !string.IsNullOrEmpty(secretKey)
            ? new AmazonS3Client(accessKey, secretKey, config)
            : new AmazonS3Client(config);
    }

    protected async Task<PrepareUploadResponse> PrepareUploadAction(PrepareUploadRequest request)
    {
        var prefix = request.UploadPrefix ?? DefaultUploadPrefix;
        var key = $"{prefix}{Guid.NewGuid():N}{Path.GetExtension(request.FileName).ToLowerInvariant()}";

        var presignedRequest = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddSeconds(PresignedUrlExpirySeconds),
            ContentType = request.ContentType ?? GetContentType(request.FileName)
        };

        var url = await _s3.GetPreSignedURLAsync(presignedRequest);
        return new PrepareUploadResponse { Url = url, Key = key };
    }

    protected async Task<string> GetPresignedUrlAction(string key)
    {
        var presignedRequest = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddSeconds(PresignedUrlExpirySeconds)
        };

        return await _s3.GetPreSignedURLAsync(presignedRequest);
    }

    protected string BucketName => _bucketName;

    protected static string GetContentType(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".mp4" => "video/mp4",
            ".mov" => "video/quicktime",
            ".avi" => "video/x-msvideo",
            ".mkv" => "video/x-matroska",
            ".webm" => "video/webm",
            ".wmv" => "video/x-ms-wmv",
            ".flv" => "video/x-flv",
            ".m4v" => "video/x-m4v",
            _ => "application/octet-stream"
        };
    }
}
