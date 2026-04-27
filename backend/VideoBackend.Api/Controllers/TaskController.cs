using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{
    internal ITaskAction _taskAction;

    public TaskController()
    {
        var bl = new BusinessLogic();
        _taskAction = bl.TaskAction();
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var tasks = _taskAction.GetAllTasks();
        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id)
    {
        var task = _taskAction.GetTaskById(id);
        if (task is null)
            return NotFound();

        return Ok(task);
    }

    [HttpPost]
    public IActionResult Create([FromBody] EntityTask task)
    {
        var created = _taskAction.CreateTask(task);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public IActionResult Update(Guid id, [FromBody] EntityTask request)
    {
        var updated = _taskAction.UpdateTask(id, request);
        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id)
    {
        var deleted = _taskAction.DeleteTask(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
