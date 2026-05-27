using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Models.Video;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideoController : ControllerBase
{
    internal IVideoAction _videoAction;

    public VideoController(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        SubscriptionContext subscriptionContext,
        IConfiguration configuration)
    {
        var bl = new BusinessLogic(userContext, taskContext, videoContext, subscriptionContext, configuration);
        _videoAction = bl.VideoAction();
    }

    [HttpPost("generate")]
    public IActionResult Generate([FromBody] GenerateVideoDto dto)
    {
        var result = _videoAction.GenerateVideo(dto);
        return Ok(result);
    }

    [HttpGet("status/{taskId:guid}")]
    public IActionResult GetStatus(Guid taskId)
    {
        try
        {
            var result = _videoAction.GetVideoTaskStatus(taskId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
