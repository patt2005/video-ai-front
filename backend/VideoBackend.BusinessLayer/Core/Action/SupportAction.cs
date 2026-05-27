using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Support;
using VideoBackend.Domain.Entities.Support;

namespace VideoBackend.BusinessLayer.Core.Action;

public class SupportAction
{
    protected readonly UserContext _context;

    public SupportAction(UserContext context)
    {
        _context = context;
    }

    protected async Task<SupportTicketDto> CreateSupportTicketAction(CreateSupportTicketDto dto, Guid? userId)
    {
        var ticket = new SupportTicket
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Email = dto.Email,
            Subject = dto.Subject,
            Message = dto.Message,
            CreatedAt = DateTime.UtcNow,
            IsResolved = false
        };
        _context.SupportTickets.Add(ticket);

        _context.SupportMessages.Add(new SupportMessage
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            Sender = SupportMessageSender.User,
            SenderUserId = userId,
            Text = dto.Message,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        });

        await _context.SaveChangesAsync();

        return new SupportTicketDto
        {
            Id = ticket.Id,
            UserId = ticket.UserId,
            Email = ticket.Email,
            Subject = ticket.Subject,
            Message = ticket.Message,
            CreatedAt = ticket.CreatedAt,
            IsResolved = ticket.IsResolved
        };
    }

    protected async Task<SupportTicketWithMessagesDto> GetOrCreateOpenTicketForUserAction(Guid userId, string email)
    {
        var ticket = await _context.SupportTickets
            .Where(t => t.UserId == userId && !t.IsResolved)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();

        if (ticket is null)
        {
            ticket = new SupportTicket
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Email = email,
                Subject = "Live chat",
                Message = string.Empty,
                CreatedAt = DateTime.UtcNow,
                IsResolved = false
            };
            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();
        }

        var messages = await _context.SupportMessages
            .Where(m => m.TicketId == ticket.Id)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new SupportMessageDto
            {
                Id = m.Id,
                TicketId = m.TicketId,
                Sender = m.Sender,
                Text = m.Text,
                CreatedAt = m.CreatedAt,
                IsRead = m.IsRead
            })
            .ToListAsync();

        return new SupportTicketWithMessagesDto
        {
            Id = ticket.Id,
            UserId = ticket.UserId,
            Email = ticket.Email,
            Subject = ticket.Subject,
            CreatedAt = ticket.CreatedAt,
            IsResolved = ticket.IsResolved,
            Messages = messages
        };
    }

    protected async Task<SupportMessageDto> AddMessageToTicketAction(Guid ticketId, SupportMessageSender sender, Guid? senderUserId, string text)
    {
        var message = new SupportMessage
        {
            Id = Guid.NewGuid(),
            TicketId = ticketId,
            Sender = sender,
            SenderUserId = senderUserId,
            Text = text,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };
        _context.SupportMessages.Add(message);
        await _context.SaveChangesAsync();

        return new SupportMessageDto
        {
            Id = message.Id,
            TicketId = message.TicketId,
            Sender = message.Sender,
            Text = message.Text,
            CreatedAt = message.CreatedAt,
            IsRead = message.IsRead
        };
    }

    protected async Task<SupportTicketWithMessagesDto?> GetTicketWithMessagesAction(Guid ticketId)
    {
        var ticket = await _context.SupportTickets.FindAsync(ticketId);
        if (ticket is null) return null;

        var messages = await _context.SupportMessages
            .Where(m => m.TicketId == ticketId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new SupportMessageDto
            {
                Id = m.Id,
                TicketId = m.TicketId,
                Sender = m.Sender,
                Text = m.Text,
                CreatedAt = m.CreatedAt,
                IsRead = m.IsRead
            })
            .ToListAsync();

        return new SupportTicketWithMessagesDto
        {
            Id = ticket.Id,
            UserId = ticket.UserId,
            Email = ticket.Email,
            Subject = ticket.Subject,
            CreatedAt = ticket.CreatedAt,
            IsResolved = ticket.IsResolved,
            Messages = messages
        };
    }

    protected async Task<List<SupportTicketWithMessagesDto>> GetAllTicketsWithMessagesAction()
    {
        var tickets = await _context.SupportTickets
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var ids = tickets.Select(t => t.Id).ToList();
        var allMessages = await _context.SupportMessages
            .Where(m => ids.Contains(m.TicketId))
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

        return tickets.Select(t => new SupportTicketWithMessagesDto
        {
            Id = t.Id,
            UserId = t.UserId,
            Email = t.Email,
            Subject = t.Subject,
            CreatedAt = t.CreatedAt,
            IsResolved = t.IsResolved,
            Messages = allMessages.Where(m => m.TicketId == t.Id).Select(m => new SupportMessageDto
            {
                Id = m.Id,
                TicketId = m.TicketId,
                Sender = m.Sender,
                Text = m.Text,
                CreatedAt = m.CreatedAt,
                IsRead = m.IsRead
            }).ToList()
        }).ToList();
    }

    protected async Task<bool> MarkMessagesReadAction(Guid ticketId, SupportMessageSender forSender)
    {
        var unread = await _context.SupportMessages
            .Where(m => m.TicketId == ticketId && m.Sender != forSender && !m.IsRead)
            .ToListAsync();
        foreach (var m in unread) m.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }
}
