using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Task;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{
    private readonly ITaskAction _task;

    public TaskController(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        SubscriptionContext subscriptionContext,
        IConfiguration configuration)
    {
        var bl = new BusinessLogic(userContext, taskContext, videoContext, subscriptionContext, configuration);
        _task = bl.TaskAction();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tasks = await _task.GetAllTaskActionExecution();
        return Ok(tasks);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetByUserId(Guid userId)
    {
        var tasks = await _task.GetTasksByUserIdActionExecution(userId);
        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var task = await _task.GetTaskByIdActionExecution(id);
        if (task is null) return NotFound();
        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TaskDto dto)
    {
        var created = await _task.CreateTaskActionExecution(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] TaskDto dto)
    {
        var updated = await _task.UpdateTaskActionExecution(id, dto);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _task.DeleteTaskActionExecution(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
