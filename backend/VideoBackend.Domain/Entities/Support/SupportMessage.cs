namespace VideoBackend.Domain.Entities.Support;

public enum SupportMessageSender
{
    User,
    Admin
}

public class SupportMessage
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public SupportMessageSender Sender { get; set; }
    public Guid? SenderUserId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}
