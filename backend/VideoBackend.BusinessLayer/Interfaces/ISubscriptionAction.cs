using VideoBackend.Domain.Dtos.Subscription;
using VideoBackend.Domain.Enums;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface ISubscriptionAction
{
    Task<List<SubscriptionDto>> GetAllSubscriptionActionExecution();
    Task<SubscriptionDto?> GetSubscriptionByUserIdActionExecution(Guid userId);
    Task<SubscriptionDto> SubscribeActionExecution(Guid userId, SubscriptionPlan plan);
    Task<SubscriptionDto?> SetUserPlanActionExecution(Guid userId, SubscriptionPlan plan);
    Task<SubscriptionDto?> CancelSubscriptionActionExecution(Guid id);
}
