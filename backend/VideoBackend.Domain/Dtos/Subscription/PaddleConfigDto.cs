namespace VideoBackend.Domain.Dtos.Subscription;

public class PaddleConfigDto
{
    public string Environment { get; set; } = string.Empty;
    public string ClientToken { get; set; } = string.Empty;
    public string PriceProId { get; set; } = string.Empty;
    public string PriceUltraId { get; set; } = string.Empty;
}
