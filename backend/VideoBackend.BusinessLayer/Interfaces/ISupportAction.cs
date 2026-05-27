using VideoBackend.Domain.Dtos.Support;
using VideoBackend.Domain.Entities.Support;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface ISupportAction
{
    Task<SupportTicketDto> CreateSupportTicketActionExecution(CreateSupportTicketDto dto, Guid? userId);
    Task<SupportTicketWithMessagesDto> GetOrCreateOpenTicketForUserActionExecution(Guid userId, string email);
    Task<SupportMessageDto> AddMessageToTicketActionExecution(Guid ticketId, SupportMessageSender sender, Guid? senderUserId, string text);
    Task<SupportTicketWithMessagesDto?> GetTicketWithMessagesActionExecution(Guid ticketId);
    Task<List<SupportTicketWithMessagesDto>> GetAllTicketsWithMessagesActionExecution();
    Task<bool> MarkMessagesReadActionExecution(Guid ticketId, SupportMessageSender forSender);
}
