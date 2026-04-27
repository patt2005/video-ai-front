using VideoBackend.BusinessLayer.Core;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Entities.Video;
using VideoBackend.Domain.Models.Video;

namespace VideoBackend.BusinessLayer.Structure;

public class ExploreVideoActionExecution : ExploreVideoActions, IExploreVideoAction
{
    public IEnumerable<ExploreVideo> GetAllVideos() => GetAllVideosActionExecution();

    public ExploreVideo? GetVideoById(Guid id) => GetVideoByIdActionExecution(id);

    public ExploreVideo CreateVideo(ExploreVideoDto dto) => CreateVideoActionExecution(dto);

    public ExploreVideo? UpdateVideo(Guid id, ExploreVideo request) => UpdateVideoActionExecution(id, request);

    public bool DeleteVideo(Guid id) => DeleteVideoActionExecution(id);
}
