using VideoBackend.BusinessLayer.Core;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Models.Image;

namespace VideoBackend.BusinessLayer.Structure;

public class ImageActionExecution : ImageActions, IImageAction
{
    public GenerateImageResponse GenerateImage(GenerateImageDto dto, Guid userId) => GenerateImageActionExecution(dto, userId);
    public ImageTaskStatusResponse GetImageTaskStatus(Guid taskId) => GetImageTaskStatusActionExecution(taskId);
}
