using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.DataAccessLayer.Repositories.Interfaces;
using VideoBackend.Domain.Entities.Video;

namespace VideoBackend.DataAccessLayer.Repositories.Implementations;

public class ExploreVideoRepository : IExploreVideoRepository
{
    private readonly AppDbContext _context;

    public ExploreVideoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ExploreVideo>> GetAllAsync()
    {
        return await _context.ExploreVideos.ToListAsync();
    }

    public async Task<ExploreVideo?> GetByIdAsync(Guid id)
    {
        return await _context.ExploreVideos.FindAsync(id);
    }

    public async Task<ExploreVideo> CreateAsync(ExploreVideo video)
    {
        if (video.Id == Guid.Empty)
            video.Id = Guid.NewGuid();

        _context.ExploreVideos.Add(video);
        await _context.SaveChangesAsync();
        return video;
    }

    public async Task<ExploreVideo> UpdateAsync(ExploreVideo video)
    {
        _context.ExploreVideos.Update(video);
        await _context.SaveChangesAsync();
        return video;
    }

    public async Task DeleteAsync(ExploreVideo video)
    {
        _context.ExploreVideos.Remove(video);
        await _context.SaveChangesAsync();
    }
}
