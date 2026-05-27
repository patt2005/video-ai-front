using VideoBackend.Domain.Models.Video;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IVideoAction
{
    GenerateVideoResponse GenerateVideo(GenerateVideoDto dto, Guid userId);
    VideoTaskStatusResponse GetVideoTaskStatus(Guid taskId);
}
