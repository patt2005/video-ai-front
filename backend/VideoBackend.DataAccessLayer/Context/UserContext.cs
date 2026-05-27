using Microsoft.EntityFrameworkCore;
using VideoBackend.Domain.Entities.User;

namespace VideoBackend.DataAccessLayer.Context;

public class UserContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; }
    public DbSet<EmailVerificationCode> EmailVerificationCodes { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(DbSession.ConnectionString);
    }
}
