using VideoBackend.Domain.Dtos.Video;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IExploreVideoAction
{
    Task<List<ExploreVideoDto>> GetAllExploreVideoActionExecution();
    Task<ExploreVideoDto?> GetExploreVideoByIdActionExecution(Guid id);
    Task<ExploreVideoDto> CreateExploreVideoActionExecution(ExploreVideoDto dto);
    Task<ExploreVideoDto?> UpdateExploreVideoActionExecution(Guid id, ExploreVideoDto dto);
    Task<bool> DeleteExploreVideoActionExecution(Guid id);
}
