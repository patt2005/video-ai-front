using VideoBackend.BusinessLayer.Core;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Models.Video;

namespace VideoBackend.BusinessLayer.Structure;

public class VideoActionExecution : VideoActions, IVideoAction
{
    public GenerateVideoResponse GenerateVideo(GenerateVideoDto dto, Guid userId) => GenerateVideoActionExecution(dto, userId);
    public VideoTaskStatusResponse GetVideoTaskStatus(Guid taskId) => GetVideoTaskStatusActionExecution(taskId);
}
