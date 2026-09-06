using icloud_calendar_api.Features.ApiKeys;
using icloud_calendar_api.Features.Clients;
using Microsoft.EntityFrameworkCore;

namespace icloud_calendar_api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Client>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.ClientIdentifier).HasDefaultValueSql("gen_random_uuid()");
            entity.HasIndex(e => e.ClientIdentifier).IsUnique();
        });

        modelBuilder.Entity<ApiKey>(entity =>
        {
            entity.Property(e => e.Status).HasDefaultValue("active");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasIndex(e => e.KeyHash).IsUnique();
            entity.HasOne(e => e.Client)
                .WithMany(c => c.ApiKeys)
                .HasForeignKey(e => e.ClientId);
        });
    }
}
