using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using VideoBackend.Domain.Entities.User;

namespace VideoBackend.DataAccessLayer.Context;

public class UserContext : DbContext
{
    private readonly IConfiguration _configuration;
    
    public UserContext(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(_configuration.GetConnectionString("DefaultConnection"));
    }

    public DbSet<User> Users { get; set; }
}
