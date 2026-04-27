using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Entities.Task;
using VideoBackend.Domain.Enums;
using VideoBackend.Domain.Models.Video;
using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.BusinessLayer.Core;

public class VideoActions
{
    protected GenerateVideoResponse GenerateVideoActionExecution(GenerateVideoDto dto)
    {
        using var db = new TaskContext();

        var content = new Content
        {
            Id = Guid.NewGuid(),
            ContentType = ContentType.Video,
            Url = null,
        };

        var task = new EntityTask
        {
            Id = Guid.NewGuid(),
            Prompt = dto.Prompt,
            CreationDate = DateTime.UtcNow,
            UserId = dto.UserId,
            ContentId = content.Id,
            Status = GenerationStatus.Pending,
        };

        db.Contents.Add(content);
        db.Tasks.Add(task);
        db.SaveChanges();

        return new GenerateVideoResponse { TaskId = task.Id };
    }
}
