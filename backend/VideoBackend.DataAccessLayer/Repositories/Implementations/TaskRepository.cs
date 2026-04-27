using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.DataAccessLayer.Repositories.Interfaces;
using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.DataAccessLayer.Repositories.Implementations;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EntityTask>> GetAllAsync()
    {
        return await _context.Tasks
            .Include(x => x.User)
            .Include(x => x.Content)
            .ToListAsync();
    }

    public async Task<EntityTask?> GetByIdAsync(Guid id)
    {
        return await _context.Tasks
            .Include(x => x.User)
            .Include(x => x.Content)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<EntityTask> CreateAsync(EntityTask task)
    {
        if (task.Id == Guid.Empty)
            task.Id = Guid.NewGuid();

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<EntityTask> UpdateAsync(EntityTask task)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task DeleteAsync(EntityTask task)
    {
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
    }
}
