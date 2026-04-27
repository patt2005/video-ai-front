using VideoBackend.Domain.Entities.Video;

namespace VideoBackend.BusinessLayer.Interfaces;

public interface IExploreVideoService
{
    Task<IEnumerable<ExploreVideo>> GetAllAsync();
    Task<ExploreVideo?> GetByIdAsync(Guid id);
    Task<ExploreVideo> CreateAsync(ExploreVideo video);
    Task<ExploreVideo?> UpdateAsync(Guid id, ExploreVideo request);
    Task<bool> DeleteAsync(Guid id);
}
