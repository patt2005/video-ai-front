using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.BusinessLayer.Structure;

namespace VideoBackend.BusinessLayer;

public class BusinessLogic
{
    public IUserAction UserAction() => new UserActionExecution();

    public ITaskAction TaskAction() => new TaskActionExecution();

    public IExploreVideoAction ExploreVideoAction() => new ExploreVideoActionExecution();

    public IVideoAction VideoAction() => new VideoActionExecution();
}
