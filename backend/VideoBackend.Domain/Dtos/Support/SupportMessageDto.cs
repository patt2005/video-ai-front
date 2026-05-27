using VideoBackend.Domain.Entities.Support;

namespace VideoBackend.Domain.Dtos.Support;

public class SupportMessageDto
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public SupportMessageSender Sender { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}

public class SendSupportMessageDto
{
    public string Text { get; set; } = string.Empty;
}

public class SupportTicketWithMessagesDto
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsResolved { get; set; }
    public List<SupportMessageDto> Messages { get; set; } = new();
}
