using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Entities.Video;
using VideoBackend.Domain.Models.Video;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExploreVideoController : ControllerBase
{
    internal IExploreVideoAction _exploreVideoAction;

    public ExploreVideoController()
    {
        var bl = new BusinessLogic();
        _exploreVideoAction = bl.ExploreVideoAction();
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var videos = _exploreVideoAction.GetAllVideos();
        return Ok(videos);
    }

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id)
    {
        var video = _exploreVideoAction.GetVideoById(id);
        if (video is null)
            return NotFound();

        return Ok(video);
    }

    [HttpPost]
    public IActionResult Create([FromBody] ExploreVideoDto dto)
    {
        var created = _exploreVideoAction.CreateVideo(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public IActionResult Update(Guid id, [FromBody] ExploreVideo request)
    {
        var updated = _exploreVideoAction.UpdateVideo(id, request);
        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id)
    {
        var deleted = _exploreVideoAction.DeleteVideo(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
