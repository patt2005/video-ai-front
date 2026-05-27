using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Task;
using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.BusinessLayer.Core.Action;

public class TaskAction
{
    protected readonly TaskContext _context;

    public TaskAction(TaskContext context)
    {
        _context = context;
    }

    protected async Task<List<TaskDto>> GetAllTaskAction()
    {
        return await _context.Tasks
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Prompt = t.Prompt,
                CreationDate = t.CreationDate,
                UserId = t.UserId,
                ContentId = t.ContentId,
                Status = t.Status,
                Content = t.Content == null ? null : new ContentDto
                {
                    Id = t.Content.Id,
                    ContentType = t.Content.ContentType,
                    Url = t.Content.Url
                }
            })
            .ToListAsync();
    }

    protected async Task<TaskDto?> GetTaskByIdAction(Guid id)
    {
        var t = await _context.Tasks.FirstOrDefaultAsync(x => x.Id == id);
        if (t is null) return null;
        return new TaskDto
        {
            Id = t.Id,
            Prompt = t.Prompt,
            CreationDate = t.CreationDate,
            UserId = t.UserId,
            ContentId = t.ContentId,
            Status = t.Status
        };
    }

    protected async Task<TaskDto> CreateTaskAction(TaskDto dto)
    {
        var entity = new EntityTask
        {
            Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
            Prompt = dto.Prompt,
            CreationDate = dto.CreationDate,
            UserId = dto.UserId,
            ContentId = dto.ContentId,
            Status = dto.Status
        };
        _context.Tasks.Add(entity);
        await _context.SaveChangesAsync();

        dto.Id = entity.Id;
        return dto;
    }

    protected async Task<TaskDto?> UpdateTaskAction(Guid id, TaskDto dto)
    {
        var t = await _context.Tasks.FindAsync(id);
        if (t is null) return null;

        t.Prompt = dto.Prompt;
        t.CreationDate = dto.CreationDate;
        t.UserId = dto.UserId;
        t.ContentId = dto.ContentId;
        t.Status = dto.Status;
        await _context.SaveChangesAsync();

        return new TaskDto
        {
            Id = t.Id,
            Prompt = t.Prompt,
            CreationDate = t.CreationDate,
            UserId = t.UserId,
            ContentId = t.ContentId,
            Status = t.Status
        };
    }

    protected async Task<bool> DeleteTaskAction(Guid id)
    {
        var t = await _context.Tasks.FindAsync(id);
        if (t is null) return false;
        _context.Tasks.Remove(t);
        await _context.SaveChangesAsync();
        return true;
    }
}
