using VideoBackend.BusinessLayer.Core;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Models.Image;

namespace VideoBackend.BusinessLayer.Structure;

public class ImageActionExecution : ImageActions, IImageAction
{
    public GenerateImageResponse GenerateImage(GenerateImageDto dto) => GenerateImageActionExecution(dto);
    public ImageTaskStatusResponse GetImageTaskStatus(Guid taskId) => GetImageTaskStatusActionExecution(taskId);
}
