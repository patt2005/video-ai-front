using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Subscription;
using VideoBackend.Domain.Entities.Subscription;
using VideoBackend.Domain.Enums;

namespace VideoBackend.BusinessLayer.Core.Action;

public class SubscriptionAction
{
    protected readonly SubscriptionContext _context;
    protected readonly IPaddleService _paddle;
    protected readonly IConfiguration _configuration;

    public SubscriptionAction(SubscriptionContext context, IPaddleService paddle, IConfiguration configuration)
    {
        _context = context;
        _paddle = paddle;
        _configuration = configuration;
    }

    protected async Task<List<SubscriptionDto>> GetAllSubscriptionAction()
    {
        return await _context.Subscriptions
            .Select(s => ToDto(s))
            .ToListAsync();
    }

    protected async Task<SubscriptionDto?> GetSubscriptionByUserIdAction(Guid userId)
    {
        var s = await _context.Subscriptions
            .Where(x => x.UserId == userId && x.Status == SubscriptionStatus.Active)
            .OrderByDescending(x => x.StartDate)
            .FirstOrDefaultAsync();

        return s is null ? null : ToDto(s);
    }

    protected async Task<SubscriptionDto?> SubscribeAction(Guid userId, SubscriptionPlan plan)
    {
        var existing = await _context.Subscriptions
            .Where(x => x.UserId == userId && x.Status == SubscriptionStatus.Active)
            .FirstOrDefaultAsync();

        if (existing is not null)
        {
            if (plan == SubscriptionPlan.Starter && existing.Plan != SubscriptionPlan.Starter)
                return null;

            existing.Plan = plan;
            await _context.SaveChangesAsync();
            return ToDto(existing);
        }

        var entity = new Subscription
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Plan = plan,
            Status = SubscriptionStatus.Active,
            StartDate = DateTime.UtcNow
        };
        _context.Subscriptions.Add(entity);
        await _context.SaveChangesAsync();

        GrantCreditsForPlan(userId, null, plan);

        return ToDto(entity);
    }

    protected async Task<SubscriptionDto?> SetUserPlanAction(Guid userId, SubscriptionPlan plan)
    {
        var existing = await _context.Subscriptions
            .Where(x => x.UserId == userId && x.Status == SubscriptionStatus.Active)
            .FirstOrDefaultAsync();

        if (plan == SubscriptionPlan.Starter)
        {
            if (existing is null) return null;
            existing.Status = SubscriptionStatus.Cancelled;
            existing.CancelledAt = DateTime.UtcNow;
            existing.EndDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return ToDto(existing);
        }

        return await SubscribeAction(userId, plan);
    }

    protected async Task<SubscriptionDto?> CancelSubscriptionAction(Guid id)
    {
        var s = await _context.Subscriptions.FindAsync(id);
        if (s is null) return null;

        s.Status = SubscriptionStatus.Cancelled;
        s.CancelledAt = DateTime.UtcNow;
        s.EndDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return ToDto(s);
    }

    protected async Task<SubscriptionDto?> SyncFromPaddleAction(Guid userId, string? paddleSubscriptionId, string? paddleCustomerId)
    {
        PaddleSubscriptionSnapshot? snapshot = null;

        if (!string.IsNullOrWhiteSpace(paddleSubscriptionId))
            snapshot = await _paddle.GetSubscriptionAsync(paddleSubscriptionId);

        if (snapshot is null && !string.IsNullOrWhiteSpace(paddleCustomerId))
        {
            for (var attempt = 0; attempt < 5 && snapshot is null; attempt++)
            {
                snapshot = await _paddle.GetLatestSubscriptionForCustomerAsync(paddleCustomerId);
                if (snapshot is null) await Task.Delay(1000);
            }
        }

        if (snapshot is null) return null;

        var plan = MapPriceToPlan(snapshot.PriceId);
        if (plan is null)
        {
            Console.WriteLine($"[PADDLE] Unknown price id {snapshot.PriceId}");
            return null;
        }

        return await UpsertFromPaddleAsync(userId, snapshot, plan.Value);
    }

    protected async Task<SubscriptionDto?> ChangeMyPlanAction(Guid userId, SubscriptionPlan newPlan)
    {
        if (newPlan == SubscriptionPlan.Starter) return null;

        var s = await _context.Subscriptions
            .Where(x => x.UserId == userId && x.Status == SubscriptionStatus.Active)
            .OrderByDescending(x => x.StartDate)
            .FirstOrDefaultAsync();

        if (s is null || s.Plan == newPlan) return null;
        if (string.IsNullOrEmpty(s.PaddleSubscriptionId)) return null;

        var newPriceId = newPlan == SubscriptionPlan.Pro
            ? _configuration["Paddle:PricePro"]
            : _configuration["Paddle:PriceUltra"];
        if (string.IsNullOrEmpty(newPriceId)) return null;

        var snapshot = await _paddle.UpdateSubscriptionPriceAsync(s.PaddleSubscriptionId, newPriceId);
        if (snapshot is null) return null;

        var mapped = MapPriceToPlan(snapshot.PriceId);
        if (mapped is null) return null;

        return await UpsertFromPaddleAsync(userId, snapshot, mapped.Value);
    }

    protected async Task<bool> CancelMyAction(Guid userId)
    {
        var s = await _context.Subscriptions
            .Where(x => x.UserId == userId && x.Status == SubscriptionStatus.Active)
            .OrderByDescending(x => x.StartDate)
            .FirstOrDefaultAsync();

        if (s is null) return false;

        if (!string.IsNullOrEmpty(s.PaddleSubscriptionId))
        {
            var ok = await _paddle.CancelSubscriptionAsync(s.PaddleSubscriptionId);
            if (!ok) return false;
            s.Status = SubscriptionStatus.Cancelled;
            s.CancelledAt = DateTime.UtcNow;
            s.EndDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        s.Status = SubscriptionStatus.Cancelled;
        s.CancelledAt = DateTime.UtcNow;
        s.EndDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    protected async Task ApplyPaddleWebhookAction(string eventType, PaddleSubscriptionSnapshot snapshot, Guid? userIdHint)
    {
        var existing = await _context.Subscriptions
            .FirstOrDefaultAsync(x => x.PaddleSubscriptionId == snapshot.Id);

        var userId = existing?.UserId ?? userIdHint;
        if (userId is null) return;

        var plan = MapPriceToPlan(snapshot.PriceId);

        if (eventType.StartsWith("subscription.canceled", StringComparison.OrdinalIgnoreCase) && existing is not null)
        {
            existing.Status = SubscriptionStatus.Cancelled;
            existing.CancelledAt = snapshot.CanceledAt ?? DateTime.UtcNow;
            existing.EndDate = snapshot.CanceledAt ?? DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return;
        }

        if (plan is null) return;
        await UpsertFromPaddleAsync(userId.Value, snapshot, plan.Value);
    }

    private static int GetPlanCredits(SubscriptionPlan plan) => plan switch
    {
        SubscriptionPlan.Starter => 10,
        SubscriptionPlan.Pro => 500,
        SubscriptionPlan.Ultra => 2000,
        _ => 0
    };

    private static void GrantCreditsForPlan(Guid userId, SubscriptionPlan? oldPlan, SubscriptionPlan newPlan)
    {
        var newCredits = GetPlanCredits(newPlan);
        if (newCredits <= 0) return;

        var toGrant = oldPlan is null
            ? newCredits
            : Math.Max(0, newCredits - GetPlanCredits(oldPlan.Value));

        if (toGrant == 0) return;

        using var users = new UserContext();
        var u = users.Users.Find(userId);
        if (u is null) return;
        u.Credits += toGrant;
        users.SaveChanges();
    }

    private async Task<SubscriptionDto> UpsertFromPaddleAsync(Guid userId, PaddleSubscriptionSnapshot snapshot, SubscriptionPlan plan)
    {
        var others = _context.Subscriptions
            .Where(x => x.UserId == userId && x.Status == SubscriptionStatus.Active && x.PaddleSubscriptionId != snapshot.Id);
        foreach (var o in others)
        {
            o.Status = SubscriptionStatus.Cancelled;
            o.CancelledAt = DateTime.UtcNow;
            o.EndDate = DateTime.UtcNow;
        }

        var existing = await _context.Subscriptions
            .FirstOrDefaultAsync(x => x.PaddleSubscriptionId == snapshot.Id);

        var oldPlan = existing?.Plan;
        var wasActive = existing?.Status == SubscriptionStatus.Active;

        if (existing is null)
        {
            existing = new Subscription
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                StartDate = snapshot.StartedAt ?? DateTime.UtcNow,
                PaddleSubscriptionId = snapshot.Id
            };
            _context.Subscriptions.Add(existing);
        }

        existing.Plan = plan;
        existing.PaddleCustomerId = snapshot.CustomerId;
        existing.NextBillDate = snapshot.NextBilledAt;
        existing.Status = snapshot.Status switch
        {
            "canceled" => SubscriptionStatus.Cancelled,
            "expired" => SubscriptionStatus.Expired,
            _ => SubscriptionStatus.Active
        };
        if (existing.Status == SubscriptionStatus.Cancelled)
        {
            existing.CancelledAt = snapshot.CanceledAt ?? DateTime.UtcNow;
            existing.EndDate = snapshot.CanceledAt ?? DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        if (existing.Status == SubscriptionStatus.Active)
        {
            GrantCreditsForPlan(userId, wasActive ? oldPlan : null, plan);
        }

        return ToDto(existing);
    }

    private SubscriptionPlan? MapPriceToPlan(string priceId)
    {
        if (string.IsNullOrEmpty(priceId)) return null;
        if (string.Equals(priceId, _configuration["Paddle:PricePro"], StringComparison.Ordinal))
            return SubscriptionPlan.Pro;
        if (string.Equals(priceId, _configuration["Paddle:PriceUltra"], StringComparison.Ordinal))
            return SubscriptionPlan.Ultra;
        return null;
    }

    private static SubscriptionDto ToDto(Subscription s) => new()
    {
        Id = s.Id,
        UserId = s.UserId,
        Plan = s.Plan,
        Status = s.Status,
        StartDate = s.StartDate,
        EndDate = s.EndDate,
        CancelledAt = s.CancelledAt,
        PaddleSubscriptionId = s.PaddleSubscriptionId,
        NextBillDate = s.NextBillDate
    };
}
