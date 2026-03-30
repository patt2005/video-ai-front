using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Task = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.DataAccessLayer.Context;

public class TaskContext : DbContext
{
    private readonly IConfiguration _configuration;
    
    public TaskContext(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(_configuration.GetConnectionString("DefaultConnection"));
    }

    public DbSet<Task> Tasks { get; set; }
}