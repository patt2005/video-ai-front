using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Subscription;
using VideoBackend.Domain.Entities.Subscription;
using VideoBackend.Domain.Enums;

namespace VideoBackend.BusinessLayer.Core.Action;

public class SubscriptionAction
{
    protected readonly SubscriptionContext _context;

    public SubscriptionAction(SubscriptionContext context)
    {
        _context = context;
    }

    protected async Task<List<SubscriptionDto>> GetAllSubscriptionAction()
    {
        return await _context.Subscriptions
            .Select(s => new SubscriptionDto
            {
                Id = s.Id,
                UserId = s.UserId,
                Plan = s.Plan,
                Status = s.Status,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                CancelledAt = s.CancelledAt
            })
            .ToListAsync();
    }

    protected async Task<SubscriptionDto?> GetSubscriptionByUserIdAction(Guid userId)
    {
        var s = await _context.Subscriptions
            .Where(x => x.UserId == userId && x.Status == SubscriptionStatus.Active)
            .OrderByDescending(x => x.StartDate)
            .FirstOrDefaultAsync();

        if (s is null) return null;
        return new SubscriptionDto
        {
            Id = s.Id,
            UserId = s.UserId,
            Plan = s.Plan,
            Status = s.Status,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            CancelledAt = s.CancelledAt
        };
    }

    protected async Task<SubscriptionDto> SubscribeAction(Guid userId, SubscriptionPlan plan)
    {
        var existing = await _context.Subscriptions
            .Where(x => x.UserId == userId && x.Status == SubscriptionStatus.Active)
            .FirstOrDefaultAsync();

        if (existing is not null)
        {
            existing.Plan = plan;
            await _context.SaveChangesAsync();
            return new SubscriptionDto
            {
                Id = existing.Id,
                UserId = existing.UserId,
                Plan = existing.Plan,
                Status = existing.Status,
                StartDate = existing.StartDate,
                EndDate = existing.EndDate,
                CancelledAt = existing.CancelledAt
            };
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

        return new SubscriptionDto
        {
            Id = entity.Id,
            UserId = entity.UserId,
            Plan = entity.Plan,
            Status = entity.Status,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            CancelledAt = entity.CancelledAt
        };
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
            return new SubscriptionDto
            {
                Id = existing.Id,
                UserId = existing.UserId,
                Plan = existing.Plan,
                Status = existing.Status,
                StartDate = existing.StartDate,
                EndDate = existing.EndDate,
                CancelledAt = existing.CancelledAt
            };
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

        return new SubscriptionDto
        {
            Id = s.Id,
            UserId = s.UserId,
            Plan = s.Plan,
            Status = s.Status,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            CancelledAt = s.CancelledAt
        };
    }
}
