using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Entities.Video;
using VideoBackend.Domain.Models.Video;

namespace VideoBackend.BusinessLayer.Core;

public class ExploreVideoActions
{
    protected IEnumerable<ExploreVideo> GetAllVideosActionExecution()
    {
        using var db = new ExploreVideoContext();
        return db.ExploreVideos.ToList();
    }

    protected ExploreVideo? GetVideoByIdActionExecution(Guid id)
    {
        using var db = new ExploreVideoContext();
        return db.ExploreVideos.Find(id);
    }

    protected ExploreVideo CreateVideoActionExecution(ExploreVideoDto dto)
    {
        using var db = new ExploreVideoContext();
        var video = new ExploreVideo
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            VideoUrl = dto.VideoUrl,
        };

        db.ExploreVideos.Add(video);
        db.SaveChanges();
        return video;
    }

    protected ExploreVideo? UpdateVideoActionExecution(Guid id, ExploreVideo request)
    {
        using var db = new ExploreVideoContext();
        var existing = db.ExploreVideos.Find(id);
        if (existing is null)
            return null;

        existing.Title = request.Title;
        existing.Description = request.Description;
        existing.VideoUrl = request.VideoUrl;

        db.SaveChanges();
        return existing;
    }

    protected bool DeleteVideoActionExecution(Guid id)
    {
        using var db = new ExploreVideoContext();
        var existing = db.ExploreVideos.Find(id);
        if (existing is null)
            return false;

        db.ExploreVideos.Remove(existing);
        db.SaveChanges();
        return true;
    }
}
