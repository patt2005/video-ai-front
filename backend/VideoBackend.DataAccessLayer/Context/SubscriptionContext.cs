using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using VideoBackend.Domain.Entities.Subscription;

namespace VideoBackend.DataAccessLayer.Context;

public class SubscriptionContext : DbContext
{
    private readonly IConfiguration _configuration;

    public SubscriptionContext(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(_configuration.GetConnectionString("DefaultConnection"));
    }

    public DbSet<Subscription> Subscriptions { get; set; }
}
