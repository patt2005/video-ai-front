using Microsoft.Extensions.Configuration;
using VideoBackend.BusinessLayer.Core.Action;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Subscription;
using VideoBackend.Domain.Enums;

namespace VideoBackend.BusinessLayer.Structure.ActionExecution;

public class SubscriptionActionExecution : SubscriptionAction, ISubscriptionAction
{
    public SubscriptionActionExecution(SubscriptionContext context, IPaddleService paddle, IConfiguration configuration)
        : base(context, paddle, configuration) { }

    public Task<List<SubscriptionDto>> GetAllSubscriptionActionExecution()
        => GetAllSubscriptionAction();

    
    
    public Task<SubscriptionDto?> GetSubscriptionByUserIdActionExecution(Guid userId)
        => GetSubscriptionByUserIdAction(userId);

    public Task<SubscriptionDto?> SubscribeActionExecution(Guid userId, SubscriptionPlan plan)
        => SubscribeAction(userId, plan);

    public Task<SubscriptionDto?> SetUserPlanActionExecution(Guid userId, SubscriptionPlan plan)
        => SetUserPlanAction(userId, plan);

    public Task<SubscriptionDto?> CancelSubscriptionActionExecution(Guid id)
        => CancelSubscriptionAction(id);

    public Task<SubscriptionDto?> SyncFromPaddleActionExecution(Guid userId, string? paddleSubscriptionId, string? paddleCustomerId)
        => SyncFromPaddleAction(userId, paddleSubscriptionId, paddleCustomerId);

    public Task<bool> CancelMyActionExecution(Guid userId)
        => CancelMyAction(userId);

    public Task<SubscriptionDto?> ChangeMyPlanActionExecution(Guid userId, SubscriptionPlan newPlan)
        => ChangeMyPlanAction(userId, newPlan);

    public Task ApplyPaddleWebhookActionExecution(string eventType, PaddleSubscriptionSnapshot snapshot, Guid? userIdHint)
        => ApplyPaddleWebhookAction(eventType, snapshot, userIdHint);
}
