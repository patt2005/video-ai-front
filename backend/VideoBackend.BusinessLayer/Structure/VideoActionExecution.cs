using VideoBackend.BusinessLayer.Core;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Models.Video;

namespace VideoBackend.BusinessLayer.Structure;

public class VideoActionExecution : VideoActions, IVideoAction
{
    public GenerateVideoResponse GenerateVideo(GenerateVideoDto dto) => GenerateVideoActionExecution(dto);
}
