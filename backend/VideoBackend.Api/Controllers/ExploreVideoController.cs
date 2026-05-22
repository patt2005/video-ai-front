using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Video;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExploreVideoController : ControllerBase
{
    private readonly IExploreVideoAction _video;

    public ExploreVideoController(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        IConfiguration configuration)
    {
        var bl = new BusinessLogic(userContext, taskContext, videoContext, configuration);
        _video = bl.ExploreVideoAction();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var videos = await _video.GetAllExploreVideoActionExecution();
        return Ok(videos);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var video = await _video.GetExploreVideoByIdActionExecution(id);
        if (video is null) return NotFound();
        return Ok(video);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ExploreVideoDto dto)
    {
        var created = await _video.CreateExploreVideoActionExecution(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ExploreVideoDto dto)
    {
        var updated = await _video.UpdateExploreVideoActionExecution(id, dto);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _video.DeleteExploreVideoActionExecution(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
