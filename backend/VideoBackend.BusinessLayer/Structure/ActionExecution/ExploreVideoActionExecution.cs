using VideoBackend.BusinessLayer.Core.Action;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Dtos.Video;

namespace VideoBackend.BusinessLayer.Structure.ActionExecution;

public class ExploreVideoActionExecution : ExploreVideoAction, IExploreVideoAction
{
    public ExploreVideoActionExecution(ExploreVideoContext context, TaskContext taskContext) : base(context, taskContext) { }

    public Task<List<ExploreVideoDto>> GetAllExploreVideoActionExecution()
        => GetAllExploreVideoAction();

    public Task<ExploreVideoDto?> GetExploreVideoByIdActionExecution(Guid id)
        => GetExploreVideoByIdAction(id);

    public Task<ExploreVideoDto> CreateExploreVideoActionExecution(ExploreVideoDto dto)
        => CreateExploreVideoAction(dto);

    public Task<ExploreVideoDto?> UpdateExploreVideoActionExecution(Guid id, ExploreVideoDto dto)
        => UpdateExploreVideoAction(id, dto);

    public Task<bool> DeleteExploreVideoActionExecution(Guid id)
        => DeleteExploreVideoAction(id);
}
