using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.File;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/file")]
public class FileController : ControllerBase
{
    private readonly IFileAction _fileAction;

    public FileController(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        SubscriptionContext subscriptionContext,
        IConfiguration configuration)
    {
        var bl = new BusinessLogic(userContext, taskContext, videoContext, subscriptionContext, configuration);
        _fileAction = bl.FileAction();
    }

    [HttpPost("prepare-upload")]
    public async Task<IActionResult> PrepareUpload([FromBody] PrepareUploadRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request?.FileName))
            return BadRequest("fileName is required");

        var result = await _fileAction.PrepareUpload(request);
        return Ok(result);
    }

    [HttpGet("preview")]
    public async Task<IActionResult> Preview([FromQuery] string key, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(key))
            return BadRequest("key is required");

        var url = await _fileAction.GetPresignedUrl(key);

        using var http = new HttpClient();
        var response = await http.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, "Failed to fetch file from storage");

        var contentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
        var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return File(stream, contentType);
    }
}
