using VideoBackend.Domain.Entities.Video;

namespace VideoBackend.DataAccessLayer.Repositories.Interfaces;

public interface IExploreVideoRepository
{
    Task<IEnumerable<ExploreVideo>> GetAllAsync();
    Task<ExploreVideo?> GetByIdAsync(Guid id);
    Task<ExploreVideo> CreateAsync(ExploreVideo video);
    Task<ExploreVideo> UpdateAsync(ExploreVideo video);
    Task DeleteAsync(ExploreVideo video);
}
