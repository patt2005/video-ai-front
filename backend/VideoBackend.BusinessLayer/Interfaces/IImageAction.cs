using VideoBackend.Domain.Models.Image;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IImageAction
{
    GenerateImageResponse GenerateImage(GenerateImageDto dto, Guid userId);
    ImageTaskStatusResponse GetImageTaskStatus(Guid taskId);
}
