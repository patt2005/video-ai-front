using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Entities.Video;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExploreVideoController : ControllerBase
{
    private readonly ExploreVideoContext _context;

    public ExploreVideoController(ExploreVideoContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExploreVideo>>> GetAll()
    {
        var videos = await _context.ExploreVideos.ToListAsync();
        return Ok(videos);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExploreVideo>> GetById(Guid id)
    {
        var video = await _context.ExploreVideos.FindAsync(id);
        if (video is null)
        {
            return NotFound();
        }

        return Ok(video);
    }

    [HttpPost]
    public async Task<ActionResult<ExploreVideo>> Create([FromBody] ExploreVideo exploreVideo)
    {
        if (exploreVideo.Id == Guid.Empty)
        {
            exploreVideo.Id = Guid.NewGuid();
        }

        _context.ExploreVideos.Add(exploreVideo);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = exploreVideo.Id }, exploreVideo);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ExploreVideo>> Update(Guid id, [FromBody] ExploreVideo request)
    {
        var existingVideo = await _context.ExploreVideos.FindAsync(id);
        if (existingVideo is null)
        {
            return NotFound();
        }

        existingVideo.Title = request.Title;
        existingVideo.Description = request.Description;
        existingVideo.VideoUrl = request.VideoUrl;

        await _context.SaveChangesAsync();
        return Ok(existingVideo);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existingVideo = await _context.ExploreVideos.FindAsync(id);
        if (existingVideo is null)
        {
            return NotFound();
        }

        _context.ExploreVideos.Remove(existingVideo);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}