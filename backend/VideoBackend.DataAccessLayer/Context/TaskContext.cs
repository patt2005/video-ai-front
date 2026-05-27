using Microsoft.EntityFrameworkCore;
using VideoBackend.Domain.Entities.Task;
using VideoBackend.Domain.Entities.User;
using Task = VideoBackend.Domain.Entities.Task.Task;

namespace VideoBackend.DataAccessLayer.Context;

public class TaskContext : DbContext
{
    public DbSet<Task> Tasks { get; set; }
    public DbSet<Content> Contents { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(DbSession.ConnectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().ToTable("Users");
        modelBuilder.Entity<Task>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .IsRequired(false);
    }
}
