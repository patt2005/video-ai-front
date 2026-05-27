using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Support;
using VideoBackend.Domain.Entities.Support;
using VideoBackend.Domain.Enums;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupportController : ControllerBase
{
    private readonly ISupportAction _support;
    private readonly SubscriptionContext _subscriptionContext;
    private readonly UserContext _userContext;

    public SupportController(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        SubscriptionContext subscriptionContext,
        IConfiguration configuration)
    {
        var bl = new BusinessLogic(userContext, taskContext, videoContext, subscriptionContext, configuration);
        _support = bl.SupportAction();
        _subscriptionContext = subscriptionContext;
        _userContext = userContext;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSupportTicketDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest(new { error = "Email and message are required" });

        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var plan = await GetActivePlanAsync(userId.Value);
        if (plan != SubscriptionPlan.Pro && plan != SubscriptionPlan.Ultra)
            return StatusCode(403, new { error = "Support is available only for Pro and Ultra subscribers" });

        var ticket = await _support.CreateSupportTicketActionExecution(dto, userId);
        return Ok(ticket);
    }

    // Ultra live chat — get or create own conversation
    [HttpGet("me")]
    public async Task<IActionResult> GetMyConversation()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var plan = await GetActivePlanAsync(userId.Value);
        if (plan != SubscriptionPlan.Ultra) return StatusCode(403, new { error = "Live chat is only for Ultra subscribers" });

        var user = await _userContext.Users.FindAsync(userId.Value);
        if (user is null) return NotFound();

        var ticket = await _support.GetOrCreateOpenTicketForUserActionExecution(userId.Value, user.Email);
        await _support.MarkMessagesReadActionExecution(ticket.Id, SupportMessageSender.User);
        return Ok(ticket);
    }

    [HttpPost("me/messages")]
    public async Task<IActionResult> SendMyMessage([FromBody] SendSupportMessageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Text)) return BadRequest(new { error = "Message text is required" });

        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var plan = await GetActivePlanAsync(userId.Value);
        if (plan != SubscriptionPlan.Ultra) return StatusCode(403, new { error = "Live chat is only for Ultra subscribers" });

        var user = await _userContext.Users.FindAsync(userId.Value);
        if (user is null) return NotFound();

        var ticket = await _support.GetOrCreateOpenTicketForUserActionExecution(userId.Value, user.Email);
        var message = await _support.AddMessageToTicketActionExecution(ticket.Id, SupportMessageSender.User, userId.Value, dto.Text);
        return Ok(message);
    }

    // Admin — manage all conversations
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var tickets = await _support.GetAllTicketsWithMessagesActionExecution();
        return Ok(tickets);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var ticket = await _support.GetTicketWithMessagesActionExecution(id);
        if (ticket is null) return NotFound();
        await _support.MarkMessagesReadActionExecution(id, SupportMessageSender.Admin);
        return Ok(ticket);
    }

    [HttpPost("{id:guid}/messages")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminReply(Guid id, [FromBody] SendSupportMessageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Text)) return BadRequest(new { error = "Message text is required" });
        var adminId = GetCurrentUserId();

        var ticket = await _support.GetTicketWithMessagesActionExecution(id);
        if (ticket is null) return NotFound();

        var message = await _support.AddMessageToTicketActionExecution(id, SupportMessageSender.Admin, adminId, dto.Text);
        return Ok(message);
    }

    private async Task<SubscriptionPlan?> GetActivePlanAsync(Guid userId)
    {
        var sub = await _subscriptionContext.Subscriptions
            .Where(s => s.UserId == userId && s.Status == SubscriptionStatus.Active)
            .FirstOrDefaultAsync();
        return sub?.Plan;
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(JwtRegisteredClaimNames.Sub) ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim is null) return null;
        return Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
