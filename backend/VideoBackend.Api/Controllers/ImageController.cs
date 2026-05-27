using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Models.Image;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageController : ControllerBase
{
    internal IImageAction _imageAction;

    public ImageController(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        SubscriptionContext subscriptionContext,
        IConfiguration configuration)
    {
        var bl = new BusinessLogic(userContext, taskContext, videoContext, subscriptionContext, configuration);
        _imageAction = bl.ImageAction();
    }

    [HttpPost("generate")]
    public IActionResult Generate([FromBody] GenerateImageDto dto)
    {
        var result = _imageAction.GenerateImage(dto);
        return Ok(result);
    }

    [HttpGet("status/{taskId:guid}")]
    public IActionResult GetStatus(Guid taskId)
    {
        try
        {
            var result = _imageAction.GetImageTaskStatus(taskId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
