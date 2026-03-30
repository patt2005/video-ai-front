using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using VideoBackend.Domain.Entities.Video;

namespace VideoBackend.DataAccessLayer.Context;

public class ExploreVideoContext : DbContext
{
    private readonly IConfiguration _configuration;
    
    public ExploreVideoContext(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(_configuration.GetConnectionString("DefaultConnection"));
    }

    public DbSet<ExploreVideo> ExploreVideos { get; set; }
}