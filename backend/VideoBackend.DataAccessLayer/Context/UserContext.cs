using Microsoft.EntityFrameworkCore;
using VideoBackend.Domain.Entities.User;

namespace VideoBackend.DataAccessLayer.Context;

public class UserContext : DbContext
{
    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(DbSession.ConnectionString);
    }
}
