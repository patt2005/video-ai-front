namespace VideoBackend.BusinessLayer.Interfaces;

public class PaddleSubscriptionSnapshot
{
    public string Id { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string PriceId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? StartedAt { get; set; }
    public DateTime? NextBilledAt { get; set; }
    public DateTime? CanceledAt { get; set; }
}

public interface IPaddleService
{
    Task<PaddleSubscriptionSnapshot?> GetSubscriptionAsync(string paddleSubscriptionId);
    Task<PaddleSubscriptionSnapshot?> GetLatestSubscriptionForCustomerAsync(string customerId);
    Task<bool> CancelSubscriptionAsync(string paddleSubscriptionId);
    Task<PaddleSubscriptionSnapshot?> UpdateSubscriptionPriceAsync(string paddleSubscriptionId, string newPriceId);
    bool VerifyWebhookSignature(string signatureHeader, string rawBody);
}
