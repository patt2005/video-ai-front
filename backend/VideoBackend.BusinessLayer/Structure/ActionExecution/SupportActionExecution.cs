using VideoBackend.BusinessLayer.Core.Action;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Support;
using VideoBackend.Domain.Entities.Support;

namespace VideoBackend.BusinessLayer.Structure.ActionExecution;

public class SupportActionExecution : SupportAction, ISupportAction
{
    public SupportActionExecution(UserContext context) : base(context) { }

    public Task<SupportTicketDto> CreateSupportTicketActionExecution(CreateSupportTicketDto dto, Guid? userId)
        => CreateSupportTicketAction(dto, userId);

    public Task<SupportTicketWithMessagesDto> GetOrCreateOpenTicketForUserActionExecution(Guid userId, string email)
        => GetOrCreateOpenTicketForUserAction(userId, email);

    public Task<SupportMessageDto> AddMessageToTicketActionExecution(Guid ticketId, SupportMessageSender sender, Guid? senderUserId, string text)
        => AddMessageToTicketAction(ticketId, sender, senderUserId, text);

    public Task<SupportTicketWithMessagesDto?> GetTicketWithMessagesActionExecution(Guid ticketId)
        => GetTicketWithMessagesAction(ticketId);

    public Task<List<SupportTicketWithMessagesDto>> GetAllTicketsWithMessagesActionExecution()
        => GetAllTicketsWithMessagesAction();

    public Task<bool> MarkMessagesReadActionExecution(Guid ticketId, SupportMessageSender forSender)
        => MarkMessagesReadAction(ticketId, forSender);
}
