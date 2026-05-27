using Microsoft.Extensions.Configuration;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.BusinessLayer.Services;
using VideoBackend.BusinessLayer.Structure;
using VideoBackend.BusinessLayer.Structure.ActionExecution;
using VideoBackend.DataAccessLayer.Context;

namespace VideoBackend.BusinessLayer;

public class BusinessLogic
{
    private readonly UserContext _userContext;
    private readonly TaskContext _taskContext;
    private readonly ExploreVideoContext _videoContext;
    private readonly SubscriptionContext _subscriptionContext;
    private readonly IConfiguration _configuration;

    public BusinessLogic(
        UserContext userContext,
        TaskContext taskContext,
        ExploreVideoContext videoContext,
        SubscriptionContext subscriptionContext,
        IConfiguration configuration)
    {
        _userContext = userContext;
        _taskContext = taskContext;
        _videoContext = videoContext;
        _subscriptionContext = subscriptionContext;
        _configuration = configuration;
    }

    public IUserAction UserAction()
        => new UserActionExecution(_userContext, _configuration, new ResendEmailSender(_configuration));

    public ITaskAction TaskAction()
        => new TaskActionExecution(_taskContext);

    public IExploreVideoAction ExploreVideoAction()
        => new ExploreVideoActionExecution(_videoContext, _taskContext);

    public IVideoAction VideoAction() => new VideoActionExecution();

    public IImageAction ImageAction() => new ImageActionExecution();

    public ISubscriptionAction SubscriptionAction()
        => new SubscriptionActionExecution(_subscriptionContext);

    public IFileAction FileAction() => new FileActionExecution(_configuration);

    public ISupportAction SupportAction()
        => new SupportActionExecution(_userContext);
}
