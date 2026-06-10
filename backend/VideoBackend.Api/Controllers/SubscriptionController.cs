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
    private readonly IConfiguration _configuration;

    public SubscriptionController(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        SubscriptionContext subscriptionContext,
        IConfiguration configuration)
    {
        var bl = new BusinessLogic(userContext, taskContext, videoContext, subscriptionContext, configuration);
        _subscription = bl.SubscriptionAction();
        _configuration = configuration;
    }

    [HttpGet("config")]
    [AllowAnonymous]
    public IActionResult GetPaddleConfig()
    {
        return Ok(new PaddleConfigDto
        {
            Environment = Environment.GetEnvironmentVariable("PADDLE_ENVIRONMENT") ?? "sandbox",
            ClientToken = Environment.GetEnvironmentVariable("PADDLE_CLIENT_TOKEN") ?? string.Empty,
            PriceProId = Environment.GetEnvironmentVariable("PADDLE_PRICE_PRO") ?? string.Empty,
            PriceUltraId = Environment.GetEnvironmentVariable("PADDLE_PRICE_ULTRA") ?? string.Empty
        });
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

        if (dto.Plan != VideoBackend.Domain.Enums.SubscriptionPlan.Starter)
            return BadRequest(new { error = "Paid plans must be activated via Paddle checkout" });

        var sub = await _subscription.SubscribeActionExecution(userId.Value, dto.Plan);
        if (sub is null)
            return BadRequest(new { error = "Cancel your active paid plan before switching to Starter" });
        return Ok(sub);
    }

    [HttpPost("sync")]
    public async Task<IActionResult> Sync([FromBody] SyncSubscriptionDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(dto.PaddleSubscriptionId) && string.IsNullOrWhiteSpace(dto.PaddleCustomerId))
            return BadRequest(new { error = "paddleSubscriptionId or paddleCustomerId is required" });

        var sub = await _subscription.SyncFromPaddleActionExecution(userId.Value, dto.PaddleSubscriptionId, dto.PaddleCustomerId);
        if (sub is null) return BadRequest(new { error = "Could not sync subscription from Paddle" });
        return Ok(sub);
    }

    [HttpPatch("me/change-plan")]
    public async Task<IActionResult> ChangeMyPlan([FromBody] SubscribeDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var sub = await _subscription.ChangeMyPlanActionExecution(userId.Value, dto.Plan);
        if (sub is null) return BadRequest(new { error = "Could not change plan. Make sure you have an active paid subscription and the target plan is different." });
        return Ok(sub);
    }

    [HttpPatch("me/cancel")]
    public async Task<IActionResult> CancelMine()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var ok = await _subscription.CancelMyActionExecution(userId.Value);
        if (!ok) return BadRequest(new { error = "No active subscription to cancel" });
        return Ok(new { cancelled = true });
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
