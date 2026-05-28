using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using VideoBackend.DataAccessLayer;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Entities.Task;
using VideoBackend.Domain.Enums;
using VideoBackend.Domain.Models.Video;
using EntityTask = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.BusinessLayer.Core;

public class VideoActions
{
    private const int VideoCost = 8;
    private static readonly HttpClient _http = new();

    private static string MapModel(VideoModel model) => model switch
    {
        VideoModel.Veo31Fast => "veo3.1-fast",
        VideoModel.Veo31Lite => "veo3.1-lite",
        VideoModel.Veo31Quality => "veo3.1-quality",
        _ => "veo3.1-fast"
    };

    protected GenerateVideoResponse GenerateVideoActionExecution(GenerateVideoDto dto, Guid userId)
    {
        using (var users = new UserContext())
        {
            var u = users.Users.Find(userId)
                ?? throw new KeyNotFoundException("User not found");
            if (u.Credits < VideoCost)
                throw new InsufficientCreditsException(VideoCost, u.Credits);
            u.Credits -= VideoCost;
            users.SaveChanges();
        }

        // Build input object — image_urls only for fast/quality models
        var model = MapModel(dto.Model);
        object input;

        if (dto.ImageUrls != null && dto.ImageUrls.Count > 0 && dto.Model != VideoModel.Veo31Lite)
        {
            input = new
            {
                prompt = dto.Prompt,
                duration = 8,
                aspect_ratio = dto.AspectRatio,
                image_urls = dto.ImageUrls
            };
        }
        else
        {
            input = new
            {
                prompt = dto.Prompt,
                duration = 8,
                aspect_ratio = dto.AspectRatio
            };
        }

        var requestBody = new { model, input };
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
            ContentType = ContentType.Video,
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
            CreditsSpent = VideoCost,
        };

        db.Contents.Add(content);
        db.Tasks.Add(task);
        db.SaveChanges();

        return new GenerateVideoResponse
        {
            TaskId = task.Id,
            PoyoTaskId = poyoTaskId,
            Status = poyoStatus,
        };
    }

    protected VideoTaskStatusResponse GetVideoTaskStatusActionExecution(Guid taskId)
    {
        using var db = new TaskContext();

        var task = db.Tasks.Find(taskId)
            ?? throw new KeyNotFoundException($"Task {taskId} not found");

        if (string.IsNullOrEmpty(task.PoyoTaskId))
            throw new InvalidOperationException("Task has no associated Poyo task ID");

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

        var videoUrls = new List<string>();
        var files = data?["files"]?.AsArray();
        if (files != null)
        {
            foreach (var file in files)
            {
                var fileType = file?["file_type"]?.GetValue<string>();
                var fileUrl = file?["file_url"]?.GetValue<string>();
                if (fileType == "video" && fileUrl != null)
                    videoUrls.Add(fileUrl);
            }
        }

        if (status == "finished")
        {
            task.Status = GenerationStatus.Success;
            if (videoUrls.Count > 0)
            {
                var content = db.Contents.Find(task.ContentId);
                if (content != null)
                    content.Url = videoUrls[0];
            }
            db.SaveChanges();
        }
        else if (status == "failed")
        {
            task.Status = GenerationStatus.Failed;
            if (task.CreditsSpent > 0)
            {
                using var users = new UserContext();
                var u = users.Users.Find(task.UserId);
                if (u != null)
                {
                    u.Credits += task.CreditsSpent;
                    users.SaveChanges();
                }
                task.CreditsSpent = 0;
            }
            db.SaveChanges();
        }

        return new VideoTaskStatusResponse
        {
            TaskId = task.Id,
            PoyoTaskId = task.PoyoTaskId!,
            Status = status,
            Progress = progress,
            VideoUrls = videoUrls,
            ErrorMessage = errorMessage,
        };
    }
}
