using Microsoft.EntityFrameworkCore;
using VideoBackend.Domain.Entities.Video;

namespace VideoBackend.DataAccessLayer.Context;

public class ExploreVideoContext : DbContext
{
    public DbSet<ExploreVideo> ExploreVideos { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(DbSession.ConnectionString);
    }
}
