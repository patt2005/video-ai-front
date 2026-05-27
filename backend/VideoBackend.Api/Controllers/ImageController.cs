using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Models.Image;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageController : ControllerBase
{
    internal IImageAction _imageAction;

    public ImageController()
    {
        var bl = new BusinessLogic();
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
