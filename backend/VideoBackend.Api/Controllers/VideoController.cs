using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Models.Video;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideoController : ControllerBase
{
    internal IVideoAction _videoAction;

    public VideoController()
    {
        var bl = new BusinessLogic();
        _videoAction = bl.VideoAction();
    }

    [HttpPost("generate")]
    public IActionResult Generate([FromBody] GenerateVideoDto dto)
    {
        var result = _videoAction.GenerateVideo(dto);
        return Ok(result);
    }
}
