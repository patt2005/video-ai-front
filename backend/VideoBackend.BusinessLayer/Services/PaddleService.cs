using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using VideoBackend.BusinessLayer.Interfaces;

namespace VideoBackend.BusinessLayer.Services;

public class PaddleService : IPaddleService
{
    private static readonly HttpClient _http = new();
    private readonly string _apiBase;
    private readonly string? _apiKey;
    private readonly string? _webhookSecret;

    public PaddleService(IConfiguration configuration)
    {
        var env = (configuration["Paddle:Environment"] ?? "sandbox").ToLowerInvariant();
        _apiBase = env == "production"
            ? "https://api.paddle.com"
            : "https://sandbox-api.paddle.com";
        _apiKey = configuration["Paddle:ApiKey"];
        _webhookSecret = configuration["Paddle:WebhookSecret"];
    }

    public async Task<PaddleSubscriptionSnapshot?> GetSubscriptionAsync(string paddleSubscriptionId)
    {
        if (string.IsNullOrEmpty(_apiKey) || string.IsNullOrWhiteSpace(paddleSubscriptionId))
            return null;

        var req = new HttpRequestMessage(HttpMethod.Get, $"{_apiBase}/subscriptions/{paddleSubscriptionId}");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var resp = await _http.SendAsync(req);
        if (!resp.IsSuccessStatusCode)
        {
            var err = await resp.Content.ReadAsStringAsync();
            Console.WriteLine($"[PADDLE] GetSubscription {paddleSubscriptionId} failed {resp.StatusCode}: {err}");
            return null;
        }

        using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync());
        var data = doc.RootElement.GetProperty("data");

        var snapshot = new PaddleSubscriptionSnapshot
        {
            Id = data.GetProperty("id").GetString() ?? string.Empty,
            CustomerId = data.GetProperty("customer_id").GetString() ?? string.Empty,
            Status = data.GetProperty("status").GetString() ?? string.Empty,
            StartedAt = TryReadDate(data, "started_at"),
            NextBilledAt = TryReadDate(data, "next_billed_at"),
            CanceledAt = TryReadDate(data, "canceled_at")
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

        return snapshot;
    }

    public async Task<bool> CancelSubscriptionAsync(string paddleSubscriptionId)
    {
        if (string.IsNullOrEmpty(_apiKey) || string.IsNullOrWhiteSpace(paddleSubscriptionId))
            return false;

        var req = new HttpRequestMessage(HttpMethod.Post, $"{_apiBase}/subscriptions/{paddleSubscriptionId}/cancel");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        req.Content = new StringContent("{\"effective_from\":\"next_billing_period\"}", Encoding.UTF8, "application/json");

        var resp = await _http.SendAsync(req);
        if (!resp.IsSuccessStatusCode)
        {
            var err = await resp.Content.ReadAsStringAsync();
            Console.WriteLine($"[PADDLE] Cancel {paddleSubscriptionId} failed {resp.StatusCode}: {err}");
            return false;
        }
        return true;
    }

    public bool VerifyWebhookSignature(string signatureHeader, string rawBody)
    {
        if (string.IsNullOrEmpty(_webhookSecret) || string.IsNullOrWhiteSpace(signatureHeader))
            return false;

        string? ts = null;
        string? h1 = null;
        foreach (var part in signatureHeader.Split(';'))
        {
            var kv = part.Split('=', 2);
            if (kv.Length != 2) continue;
            if (kv[0] == "ts") ts = kv[1];
            else if (kv[0] == "h1") h1 = kv[1];
        }
        if (ts is null || h1 is null) return false;

        var payload = $"{ts}:{rawBody}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_webhookSecret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var expected = Convert.ToHexString(hash).ToLowerInvariant();
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expected),
            Encoding.UTF8.GetBytes(h1));
    }

    private static DateTime? TryReadDate(JsonElement parent, string name)
    {
        if (!parent.TryGetProperty(name, out var prop)) return null;
        if (prop.ValueKind != JsonValueKind.String) return null;
        return DateTime.TryParse(prop.GetString(), out var dt) ? dt.ToUniversalTime() : null;
    }
}
