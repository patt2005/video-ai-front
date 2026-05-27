using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Subscription;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionAction _subscription;

    public SubscriptionController(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        SubscriptionContext subscriptionContext,
        IConfiguration configuration)
    {
        var bl = new BusinessLogic(userContext, taskContext, videoContext, subscriptionContext, configuration);
        _subscription = bl.SubscriptionAction();
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var subs = await _subscription.GetAllSubscriptionActionExecution();
        return Ok(subs);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMine()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var sub = await _subscription.GetSubscriptionByUserIdActionExecution(userId.Value);
        return Ok(sub);
    }

    [HttpGet("user/{userId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByUserId(Guid userId)
    {
        var sub = await _subscription.GetSubscriptionByUserIdActionExecution(userId);
        return Ok(sub);
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var sub = await _subscription.SubscribeActionExecution(userId.Value, dto.Plan);
        return Ok(sub);
    }

    [HttpPatch("{id:guid}/cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var sub = await _subscription.CancelSubscriptionActionExecution(id);
        if (sub is null) return NotFound();
        return Ok(sub);
    }

    [HttpPatch("user/{userId:guid}/plan")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetUserPlan(Guid userId, [FromBody] SubscribeDto dto)
    {
        var sub = await _subscription.SetUserPlanActionExecution(userId, dto.Plan);
        return Ok(sub);
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)
                    ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim is null) return null;
        return Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
