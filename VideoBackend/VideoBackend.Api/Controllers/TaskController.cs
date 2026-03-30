using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{
    private readonly TaskContext _context;

    public TaskController(TaskContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EntityTask>>> GetAll()
    {
        var tasks = await _context.Tasks
            .Include(x => x.User)
            .Include(x => x.Content)
            .ToListAsync();
        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EntityTask>> GetById(Guid id)
    {
        var task = await _context.Tasks
            .Include(x => x.User)
            .Include(x => x.Content)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (task is null)
        {
            return NotFound();
        }

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<EntityTask>> Create([FromBody] EntityTask task)
    {
        if (task.Id == Guid.Empty)
        {
            task.Id = Guid.NewGuid();
        }

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EntityTask>> Update(Guid id, [FromBody] EntityTask request)
    {
        var existingTask = await _context.Tasks.FindAsync(id);
        if (existingTask is null)
        {
            return NotFound();
        }

        existingTask.Prompt = request.Prompt;
        existingTask.CreationDate = request.CreationDate;
        existingTask.UserId = request.UserId;
        existingTask.ContentId = request.ContentId;
        existingTask.Status = request.Status;

        await _context.SaveChangesAsync();
        return Ok(existingTask);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existingTask = await _context.Tasks.FindAsync(id);
        if (existingTask is null)
        {
            return NotFound();
        }

        _context.Tasks.Remove(existingTask);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}