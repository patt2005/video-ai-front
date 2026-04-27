using VideoBackend.Domain.Entities.Video;
using VideoBackend.Domain.Models.Video;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IExploreVideoAction
{
    IEnumerable<ExploreVideo> GetAllVideos();
    ExploreVideo? GetVideoById(Guid id);
    ExploreVideo CreateVideo(ExploreVideoDto dto);
    ExploreVideo? UpdateVideo(Guid id, ExploreVideo request);
    bool DeleteVideo(Guid id);
}
