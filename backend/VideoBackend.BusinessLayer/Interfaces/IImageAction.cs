using VideoBackend.Domain.Models.Image;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IImageAction
{
    GenerateImageResponse GenerateImage(GenerateImageDto dto);
    ImageTaskStatusResponse GetImageTaskStatus(Guid taskId);
}
