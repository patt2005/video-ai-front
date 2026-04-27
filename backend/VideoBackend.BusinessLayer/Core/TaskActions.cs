using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.BusinessLayer.Core;

public class TaskActions
{
    protected IEnumerable<EntityTask> GetAllTasksActionExecution()
    {
        using var db = new TaskContext();
        return db.Tasks
            .Include(x => x.User)
            .Include(x => x.Content)
            .ToList();
    }

    protected EntityTask? GetTaskByIdActionExecution(Guid id)
    {
        using var db = new TaskContext();
        return db.Tasks
            .Include(x => x.User)
            .Include(x => x.Content)
            .FirstOrDefault(x => x.Id == id);
    }

    protected EntityTask CreateTaskActionExecution(EntityTask task)
    {
        using var db = new TaskContext();
        if (task.Id == Guid.Empty)
            task.Id = Guid.NewGuid();

        db.Tasks.Add(task);
        db.SaveChanges();
        return task;
    }

    protected EntityTask? UpdateTaskActionExecution(Guid id, EntityTask request)
    {
        using var db = new TaskContext();
        var existing = db.Tasks.Find(id);
        if (existing is null)
            return null;

        existing.Prompt = request.Prompt;
        existing.CreationDate = request.CreationDate;
        existing.UserId = request.UserId;
        existing.ContentId = request.ContentId;
        existing.Status = request.Status;

        db.SaveChanges();
        return existing;
    }

    protected bool DeleteTaskActionExecution(Guid id)
    {
        using var db = new TaskContext();
        var existing = db.Tasks.Find(id);
        if (existing is null)
            return false;

        db.Tasks.Remove(existing);
        db.SaveChanges();
        return true;
    }
}
