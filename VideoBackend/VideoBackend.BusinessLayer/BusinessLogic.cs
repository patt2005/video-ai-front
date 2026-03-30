using VideoBackend.BusinessLayer.Core;
using VideoBackend.BusinessLayer.Interfaces;

namespace VideoBackend.BusinessLayer;

public class BusinessLogic
{
    public BusinessLogic() { }

    public IExploreVideoActions GetExploreVideoLogic()
    {
        return new ExploreVideoActions();
    }
}