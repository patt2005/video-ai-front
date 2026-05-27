using VideoBackend.BusinessLayer.Core.Action;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Subscription;
using VideoBackend.Domain.Enums;

namespace VideoBackend.BusinessLayer.Structure.ActionExecution;

public class SubscriptionActionExecution : SubscriptionAction, ISubscriptionAction
{
    public SubscriptionActionExecution(SubscriptionContext context) : base(context) { }

    public Task<List<SubscriptionDto>> GetAllSubscriptionActionExecution()
        => GetAllSubscriptionAction();

    public Task<SubscriptionDto?> GetSubscriptionByUserIdActionExecution(Guid userId)
        => GetSubscriptionByUserIdAction(userId);

    public Task<SubscriptionDto> SubscribeActionExecution(Guid userId, SubscriptionPlan plan)
        => SubscribeAction(userId, plan);

    public Task<SubscriptionDto?> SetUserPlanActionExecution(Guid userId, SubscriptionPlan plan)
        => SetUserPlanAction(userId, plan);

    public Task<SubscriptionDto?> CancelSubscriptionActionExecution(Guid id)
        => CancelSubscriptionAction(id);
}
