using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.DataAccessLayer.Repositories.Interfaces;
using VideoBackend.Domain.Entities.Video;

namespace VideoBackend.BusinessLayer.Services;

public class ExploreVideoService : IExploreVideoService
{
    private readonly IExploreVideoRepository _exploreVideoRepository;

    public ExploreVideoService(IExploreVideoRepository exploreVideoRepository)
    {
        _exploreVideoRepository = exploreVideoRepository;
    }

    public async Task<IEnumerable<ExploreVideo>> GetAllAsync()
    {
        return await _exploreVideoRepository.GetAllAsync();
    }

    public async Task<ExploreVideo?> GetByIdAsync(Guid id)
    {
        return await _exploreVideoRepository.GetByIdAsync(id);
    }

    public async Task<ExploreVideo> CreateAsync(ExploreVideo video)
    {
        return await _exploreVideoRepository.CreateAsync(video);
    }

    public async Task<ExploreVideo?> UpdateAsync(Guid id, ExploreVideo request)
    {
        var existing = await _exploreVideoRepository.GetByIdAsync(id);
        if (existing is null)
            return null;

        existing.Title = request.Title;
        existing.Description = request.Description;
        existing.VideoUrl = request.VideoUrl;

        return await _exploreVideoRepository.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _exploreVideoRepository.GetByIdAsync(id);
        if (existing is null)
            return false;

        await _exploreVideoRepository.DeleteAsync(existing);
        return true;
    }
}
