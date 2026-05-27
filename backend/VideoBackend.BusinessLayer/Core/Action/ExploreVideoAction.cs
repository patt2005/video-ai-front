using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Video;
using VideoBackend.Domain.Entities.Video;

namespace VideoBackend.BusinessLayer.Core.Action;

public class ExploreVideoAction
{
    protected readonly ExploreVideoContext _context;

    public ExploreVideoAction(ExploreVideoContext context)
    {
        _context = context;
    }

    protected async Task<List<ExploreVideoDto>> GetAllExploreVideoAction()
    {
        return await _context.ExploreVideos
            .Select(v => new ExploreVideoDto
            {
                Id = v.Id,
                Title = v.Title,
                Description = v.Description,
                VideoUrl = v.VideoUrl
            })
            .ToListAsync();
    }

    protected async Task<ExploreVideoDto?> GetExploreVideoByIdAction(Guid id)
    {
        var v = await _context.ExploreVideos.FindAsync(id);
        if (v is null) return null;
        return new ExploreVideoDto
        {
            Id = v.Id,
            Title = v.Title,
            Description = v.Description,
            VideoUrl = v.VideoUrl
        };
    }

    protected async Task<ExploreVideoDto> CreateExploreVideoAction(ExploreVideoDto dto)
    {
        var entity = new ExploreVideo
        {
            Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
            Title = dto.Title,
            Description = dto.Description,
            VideoUrl = dto.VideoUrl
        };
        _context.ExploreVideos.Add(entity);
        await _context.SaveChangesAsync();

        return new ExploreVideoDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            VideoUrl = entity.VideoUrl
        };
    }

    protected async Task<ExploreVideoDto?> UpdateExploreVideoAction(Guid id, ExploreVideoDto dto)
    {
        var v = await _context.ExploreVideos.FindAsync(id);
        if (v is null) return null;

        v.Title = dto.Title;
        v.Description = dto.Description;
        v.VideoUrl = dto.VideoUrl;
        await _context.SaveChangesAsync();

        return new ExploreVideoDto
        {
            Id = v.Id,
            Title = v.Title,
            Description = v.Description,
            VideoUrl = v.VideoUrl
        };
    }

    protected async Task<bool> DeleteExploreVideoAction(Guid id)
    {
        var v = await _context.ExploreVideos.FindAsync(id);
        if (v is null) return false;
        _context.ExploreVideos.Remove(v);
        await _context.SaveChangesAsync();
        return true;
    }
}
