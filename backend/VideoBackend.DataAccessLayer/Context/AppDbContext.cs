using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using VideoBackend.Domain.Entities.Task;
using VideoBackend.Domain.Entities.User;
using VideoBackend.Domain.Entities.Video;
using Task = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.DataAccessLayer.Context;

public class AppDbContext : DbContext
{
    private readonly IConfiguration _configuration;

    public AppDbContext(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(_configuration.GetConnectionString("DefaultConnection"));
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Task> Tasks { get; set; }
    public DbSet<Content> Contents { get; set; }
    public DbSet<ExploreVideo> ExploreVideos { get; set; }
}
