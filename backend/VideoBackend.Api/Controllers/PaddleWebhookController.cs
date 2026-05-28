using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class PaddleWebhookController : ControllerBase
{
    private readonly ISubscriptionAction _subscription;
    private readonly IPaddleService _paddle;

    public PaddleWebhookController(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        SubscriptionContext subscriptionContext,
        IConfiguration configuration)
    {
        var bl = new BusinessLogic(userContext, taskContext, videoContext, subscriptionContext, configuration);
        _subscription = bl.SubscriptionAction();
        _paddle = bl.PaddleService();
    }

    [HttpPost]
    public async Task<IActionResult> Handle()
    {
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, leaveOpen: true);
        var rawBody = await reader.ReadToEndAsync();
        Request.Body.Position = 0;

        var signature = Request.Headers["Paddle-Signature"].ToString();
        if (!_paddle.VerifyWebhookSignature(signature, rawBody))
        {
            Console.WriteLine("[PADDLE WEBHOOK] Invalid signature, rejecting");
            return Unauthorized();
        }

        using var doc = JsonDocument.Parse(rawBody);
        var root = doc.RootElement;
        var eventType = root.TryGetProperty("event_type", out var et) ? et.GetString() ?? "" : "";

        if (!eventType.StartsWith("subscription.", StringComparison.OrdinalIgnoreCase))
            return Ok();

        if (!root.TryGetProperty("data", out var data))
            return Ok();

        var snapshot = new PaddleSubscriptionSnapshot
        {
            Id = ReadString(data, "id"),
            CustomerId = ReadString(data, "customer_id"),
            Status = ReadString(data, "status"),
            StartedAt = ReadDate(data, "started_at"),
            NextBilledAt = ReadDate(data, "next_billed_at"),
            CanceledAt = ReadDate(data, "canceled_at")
        };

        if (data.TryGetProperty("items", out var items) && items.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in items.EnumerateArray())
            {
                if (item.TryGetProperty("price", out var price) &&
                    price.TryGetProperty("id", out var pid))
                {
                    snapshot.PriceId = pid.GetString() ?? string.Empty;
                    break;
                }
            }
        }

        Guid? userIdHint = null;
        if (data.TryGetProperty("custom_data", out var customData) &&
            customData.ValueKind == JsonValueKind.Object &&
            customData.TryGetProperty("userId", out var uid) &&
            uid.ValueKind == JsonValueKind.String &&
            Guid.TryParse(uid.GetString(), out var parsed))
        {
            userIdHint = parsed;
        }

        await _subscription.ApplyPaddleWebhookActionExecution(eventType, snapshot, userIdHint);
        return Ok();
    }

    private static string ReadString(JsonElement parent, string name)
        => parent.TryGetProperty(name, out var p) && p.ValueKind == JsonValueKind.String
            ? p.GetString() ?? string.Empty
            : string.Empty;

    private static DateTime? ReadDate(JsonElement parent, string name)
    {
        if (!parent.TryGetProperty(name, out var prop) || prop.ValueKind != JsonValueKind.String) return null;
        return DateTime.TryParse(prop.GetString(), out var dt) ? dt.ToUniversalTime() : null;
    }
}
