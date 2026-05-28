using Microsoft.EntityFrameworkCore;
using VideoBackend.Domain.Entities.Support;
using VideoBackend.Domain.Entities.User;

namespace VideoBackend.DataAccessLayer.Context;

public class UserContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; }
    public DbSet<EmailVerificationCode> EmailVerificationCodes { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public DbSet<SupportTicket> SupportTickets { get; set; }
    public DbSet<SupportMessage> SupportMessages { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(DbSession.ConnectionString);
    }
}
