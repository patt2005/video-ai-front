using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using VideoBackend.DataAccessLayer;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Entities.Task;
using VideoBackend.Domain.Enums;
using VideoBackend.Domain.Models.Image;
using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.BusinessLayer.Core;

public class ImageActions
{
    private static readonly HttpClient _http = new();

    protected GenerateImageResponse GenerateImageActionExecution(GenerateImageDto dto, Guid userId)
    {
        var hasImages = dto.ImageUrls != null && dto.ImageUrls.Count > 0;
        var model = hasImages ? "nano-banana-2-new-edit" : "nano-banana-2-new";

        object requestBody;
        if (hasImages)
        {
            requestBody = new
            {
                model,
                input = new
                {
                    prompt = dto.Prompt,
                    size = dto.Size,
                    resolution = dto.Resolution,
                    image_urls = dto.ImageUrls
                }
            };
        }
        else
        {
            requestBody = new
            {
                model,
                input = new
                {
                    prompt = dto.Prompt,
                    size = dto.Size,
                    resolution = dto.Resolution
                }
            };
        }

        var json = JsonSerializer.Serialize(requestBody);
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.poyo.ai/api/generate/submit")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", PoyoSession.ApiKey);

        var httpResponse = _http.Send(request);
        var responseBody = httpResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();

        var poyoResponse = JsonNode.Parse(responseBody);
        var poyoTaskId = poyoResponse?["data"]?["task_id"]?.GetValue<string>()
            ?? throw new Exception($"Poyo API error: {responseBody}");
        var poyoStatus = poyoResponse?["data"]?["status"]?.GetValue<string>() ?? "not_started";

        using var db = new TaskContext();

        var content = new Content
        {
            Id = Guid.NewGuid(),
            ContentType = ContentType.Image,
            Url = null,
        };

        var task = new EntityTask
        {
            Id = Guid.NewGuid(),
            Prompt = dto.Prompt,
            CreationDate = DateTime.UtcNow,
            UserId = userId,
            ContentId = content.Id,
            Status = GenerationStatus.Pending,
            PoyoTaskId = poyoTaskId,
        };

        db.Contents.Add(content);
        db.Tasks.Add(task);
        db.SaveChanges();

        return new GenerateImageResponse
        {
            TaskId = task.Id,
            PoyoTaskId = poyoTaskId,
            Status = poyoStatus,
        };
    }

    protected ImageTaskStatusResponse GetImageTaskStatusActionExecution(Guid taskId)
    {
        using var db = new TaskContext();

        var task = db.Tasks.Find(taskId)
            ?? throw new KeyNotFoundException($"Task {taskId} not found");

        if (string.IsNullOrEmpty(task.PoyoTaskId))
            throw new InvalidOperationException("Task has no associated Poyo task ID");

        // Poll Poyo for current status
        var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"https://api.poyo.ai/api/generate/status/{task.PoyoTaskId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", PoyoSession.ApiKey);

        var httpResponse = _http.Send(request);
        var responseBody = httpResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();

        var poyoResponse = JsonNode.Parse(responseBody);
        var data = poyoResponse?["data"];

        var status = data?["status"]?.GetValue<string>() ?? "unknown";
        var progress = (int)(data?["progress"]?.GetValue<double>() ?? 0);
        var errorMessage = data?["error_message"]?.GetValue<string>();

        var imageUrls = new List<string>();
        var files = data?["files"]?.AsArray();
        if (files != null)
        {
            foreach (var file in files)
            {
                var fileType = file?["file_type"]?.GetValue<string>();
                var fileUrl = file?["file_url"]?.GetValue<string>();
                if (fileType == "image" && fileUrl != null)
                    imageUrls.Add(fileUrl);
            }
        }

        // Update DB if finished or failed
        if (status == "finished")
        {
            task.Status = GenerationStatus.Success;
            if (imageUrls.Count > 0)
            {
                var content = db.Contents.Find(task.ContentId);
                if (content != null)
                    content.Url = imageUrls[0];
            }
            db.SaveChanges();
        }
        else if (status == "failed")
        {
            task.Status = GenerationStatus.Failed;
            db.SaveChanges();
        }

        return new ImageTaskStatusResponse
        {
            TaskId = task.Id,
            PoyoTaskId = task.PoyoTaskId!,
            Status = status,
            Progress = progress,
            ImageUrls = imageUrls,
            ErrorMessage = errorMessage,
        };
    }
}
