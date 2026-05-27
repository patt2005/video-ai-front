using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using VideoBackend.BusinessLayer.Interfaces;

namespace VideoBackend.BusinessLayer.Services;

public class ResendEmailSender : IEmailSender
{
    private static readonly HttpClient _http = new();
    private readonly string? _apiKey;
    private readonly string _fromEmail;
    private readonly string _appBaseUrl;

    public ResendEmailSender(IConfiguration configuration)
    {
        _apiKey = configuration["Resend:ApiKey"];
        _fromEmail = configuration["Resend:FromEmail"] ?? "onboarding@resend.dev";
        _appBaseUrl = configuration["App:BaseUrl"] ?? "http://localhost:5173";
    }

    public async Task SendVerificationEmailAsync(string toEmail, string token)
    {
        var link = $"{_appBaseUrl}/verify-email?token={Uri.EscapeDataString(token)}";

        if (string.IsNullOrEmpty(_apiKey))
        {
            Console.WriteLine($"[EMAIL FALLBACK] Resend not configured. Verification link for {toEmail}: {link}");
            return;
        }

        var html = $"<p>Welcome to MovyAI!</p><p>Click <a href=\"{link}\">here</a> to verify your email. This link expires in 7 days.</p>";

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(new
        {
            from = _fromEmail,
            to = new[] { toEmail },
            subject = "Verify your MovyAI email",
            html
        }), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"[EMAIL ERROR] Resend returned {response.StatusCode}: {body}");
            Console.WriteLine($"[EMAIL FALLBACK] Verification link for {toEmail}: {link}");
        }
    }
}
