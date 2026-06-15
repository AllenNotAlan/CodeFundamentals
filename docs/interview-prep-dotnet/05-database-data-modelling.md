# 05 — Database & Data Modelling (.NET Focus)

.NET database interviews focus heavily on Entity Framework Core, performance tuning, and the patterns that bridge your domain model to the database.

---

## Question 1 — EF Core: Configuration & Best Practices

> "How do you configure EF Core for a production application? What are the common pitfalls?"

### DbContext Configuration

```csharp
// Registration — always Scoped (one per request)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsql =>
    {
        npgsql.EnableRetryOnFailure(maxRetryCount: 3);
        npgsql.CommandTimeout(30);
        npgsql.MigrationsHistoryTable("__ef_migrations", "public");
    });

    // Development only
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// DbContext
public class AppDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    // Automatic audit fields
    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<IAuditable>())
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedAt = DateTime.UtcNow;
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(ct);
    }
}
```

### Entity Configuration (Fluent API)

```csharp
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id).ValueGeneratedNever(); // app-generated GUIDs
        builder.Property(o => o.Status).HasMaxLength(20).IsRequired();
        builder.Property(o => o.Total).HasColumnType("bigint"); // money in minor units

        builder.HasMany(o => o.Lines)
            .WithOne(l => l.Order)
            .HasForeignKey(l => l.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => new { o.UserId, o.CreatedAt })
            .IsDescending(false, true);

        // Global query filter (soft delete)
        builder.HasQueryFilter(o => !o.IsDeleted);
    }
}
```

### Common EF Core Pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| N+1 queries | Lazy loading in a loop | Use `.Include()` or `.Select()` projection |
| Tracking overhead | All queries track by default | Use `.AsNoTracking()` for read-only queries |
| Large result sets | Loading entire table into memory | Use pagination, `.Take()`, or `IAsyncEnumerable` |
| Client evaluation | LINQ that can't translate to SQL | Check EF Core warnings; simplify expressions |
| Missing indexes | Slow queries on filtered columns | Add indexes via Fluent API or raw migration |
| Cartesian explosion | Multiple `.Include()` on collections | Use split queries: `.AsSplitQuery()` |

---

## Question 2 — Repository Pattern vs Direct DbContext

> "Should you wrap EF Core in a repository pattern?"

### The Debate

| Approach | Pros | Cons |
|----------|------|------|
| Direct DbContext | Simple, full EF power, less abstraction | Harder to test without real DB, EF leaks into services |
| Generic Repository | Testable, swappable | Leaky abstraction, hides EF features, often over-engineered |
| Specification Pattern | Encapsulates query logic, composable | More code, learning curve |

### Pragmatic Approach: Thin Repository for Commands, Direct for Queries

```csharp
// Command side: repository encapsulates write logic
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct);
    Task AddAsync(Order order, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;
    public OrderRepository(AppDbContext db) => _db = db;

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct) =>
        await _db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task AddAsync(Order order, CancellationToken ct) =>
        await _db.Orders.AddAsync(order, ct);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}

// Query side: use DbContext directly with projections
public class OrderQueryService
{
    private readonly AppDbContext _db;

    public async Task<List<OrderSummaryDto>> GetRecentAsync(Guid userId, CancellationToken ct) =>
        await _db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Take(25)
            .Select(o => new OrderSummaryDto
            {
                Id = o.Id,
                Total = o.Total,
                Status = o.Status,
                ItemCount = o.Lines.Count
            })
            .ToListAsync(ct);
}
```

---

## Question 3 — Migrations in Production

> "How do you handle EF Core migrations in a production environment with zero downtime?"

### Migration Strategy

```
Development:
  dotnet ef migrations add AddOrderIndex
  dotnet ef database update

Production:
  Generate SQL script → review → apply via CI/CD pipeline
  dotnet ef migrations script --idempotent -o migration.sql
```

### Zero-Downtime Migration Rules

```
✅ Safe migrations (backward compatible):
  - Add a new nullable column
  - Add a new table
  - Add an index (CONCURRENTLY in Postgres)
  - Add a new column with a default value

❌ Dangerous migrations (require multi-step):
  - Rename a column → add new, copy data, drop old (3 deployments)
  - Change column type → add new column, migrate data, swap
  - Drop a column → deploy code that doesn't use it first, then drop
  - Add NOT NULL constraint → add as nullable, backfill, then add constraint
```

### Multi-Step Column Rename Example

```
Step 1 (Deploy v1): Add new column, write to both
  ALTER TABLE orders ADD COLUMN order_status VARCHAR(20);
  -- App writes to both 'status' and 'order_status'

Step 2 (Deploy v2): Backfill, read from new column
  UPDATE orders SET order_status = status WHERE order_status IS NULL;
  -- App reads from 'order_status', writes to both

Step 3 (Deploy v3): Drop old column
  ALTER TABLE orders DROP COLUMN status;
  -- App only uses 'order_status'
```

### Automated Migration in CI/CD

```csharp
// Startup migration (simple apps only — not for scaled deployments)
using var scope = app.Services.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
await db.Database.MigrateAsync();

// Better: separate migration job in CI/CD pipeline
// - Runs before deployment
// - Has its own timeout and rollback strategy
// - Doesn't block app startup
```

---

## Question 4 — Performance: EF Core vs Dapper vs Raw SQL

> "When would you use Dapper or raw SQL instead of EF Core?"

### Comparison

| Scenario | Best Choice | Why |
|----------|-------------|-----|
| Standard CRUD | EF Core | Change tracking, migrations, type safety |
| Complex reporting queries | Dapper | Full SQL control, no translation overhead |
| Bulk operations (10K+ rows) | Raw SQL / EF Core `ExecuteUpdate` | EF change tracker chokes on bulk |
| Hot path (sub-ms latency) | Dapper | Less overhead than EF materialisation |
| Simple read-only projections | EF Core `.Select()` | Translates cleanly, type-safe |

### Dapper Example

```csharp
public class OrderDapperRepository
{
    private readonly IDbConnection _connection;

    public async Task<IEnumerable<OrderReportDto>> GetMonthlyReport(
        int year, int month, CancellationToken ct)
    {
        const string sql = """
            SELECT 
                DATE(created_at) as Date,
                COUNT(*) as OrderCount,
                SUM(total) as Revenue
            FROM orders
            WHERE EXTRACT(YEAR FROM created_at) = @Year
              AND EXTRACT(MONTH FROM created_at) = @Month
              AND status = 'completed'
            GROUP BY DATE(created_at)
            ORDER BY Date
            """;

        return await _connection.QueryAsync<OrderReportDto>(
            new CommandDefinition(sql, new { Year = year, Month = month }, cancellationToken: ct));
    }
}
```

### EF Core 8 Bulk Operations

```csharp
// Bulk update without loading entities (EF Core 7+)
await db.Orders
    .Where(o => o.Status == "pending" && o.CreatedAt < cutoff)
    .ExecuteUpdateAsync(s => s
        .SetProperty(o => o.Status, "cancelled")
        .SetProperty(o => o.UpdatedAt, DateTime.UtcNow), ct);

// Bulk delete
await db.Orders
    .Where(o => o.IsDeleted && o.DeletedAt < archiveCutoff)
    .ExecuteDeleteAsync(ct);
```

---

## Question 5 — Unit of Work & Transaction Management

> "How do you manage transactions across multiple repositories?"

### EF Core's Built-in Unit of Work

```csharp
// DbContext IS the Unit of Work — SaveChangesAsync commits everything
public class OrderService
{
    private readonly AppDbContext _db;

    public async Task PlaceOrderAsync(CreateOrderCommand cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.UserId, cmd.Lines);
        _db.Orders.Add(order);

        // Deduct inventory in same transaction
        foreach (var line in cmd.Lines)
        {
            var inventory = await _db.Inventory.FindAsync(new object[] { line.ProductId }, ct);
            inventory!.Reserve(line.Quantity);
        }

        // Single SaveChanges = single transaction
        await _db.SaveChangesAsync(ct);
    }
}
```

### Explicit Transactions (when you need more control)

```csharp
public async Task TransferAsync(Guid fromAccount, Guid toAccount, long amount, CancellationToken ct)
{
    await using var transaction = await _db.Database.BeginTransactionAsync(ct);
    try
    {
        var from = await _db.Accounts.FindAsync(new object[] { fromAccount }, ct);
        var to = await _db.Accounts.FindAsync(new object[] { toAccount }, ct);

        from!.Debit(amount);
        to!.Credit(amount);

        _db.LedgerEntries.AddRange(
            LedgerEntry.Debit(fromAccount, amount),
            LedgerEntry.Credit(toAccount, amount));

        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
    }
    catch
    {
        await transaction.RollbackAsync(ct);
        throw;
    }
}
```

---

## Question 6 — Connection Pooling & Resilience

> "How do you configure database connections for a high-traffic .NET application?"

### Connection Pooling

```csharp
// Connection string with pooling settings
"Host=db.example.com;Database=myapp;Username=app;Password=***;
 Minimum Pool Size=10;Maximum Pool Size=100;Connection Idle Lifetime=300;
 Timeout=15;Command Timeout=30"

// For Npgsql (Postgres)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsql =>
    {
        npgsql.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null);
    });
});
```

### Connection Exhaustion Prevention

```csharp
// ❌ BAD: Long-lived DbContext holds connection
public class BadService
{
    private readonly AppDbContext _db; // injected as Singleton = connection leak!
}

// ✅ GOOD: Scoped DbContext, released after request
// (default when using AddDbContext)

// ✅ GOOD: For background services, create scope manually
public class BackgroundWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            // use db... connection returned to pool when scope disposes
        }
    }
}
```

### Health Check for Database

```csharp
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, name: "postgres", tags: new[] { "ready" })
    .AddDbContextCheck<AppDbContext>(name: "ef-context");
```

---

## Key .NET Database Concepts

| Concept | .NET Implementation |
|---------|-------------------|
| Connection pooling | Built into ADO.NET providers (Npgsql, SqlClient) |
| Retry on transient failure | EF Core `EnableRetryOnFailure` or Polly |
| Read replicas | Configure separate `DbContext` with read-only connection string |
| Compiled queries | `EF.CompileAsyncQuery()` for hot-path queries |
| Interceptors | `SaveChangesInterceptor`, `DbCommandInterceptor` for cross-cutting |
| Value converters | Map domain types to DB types (e.g., `Money` → `bigint`) |
| Owned types | Map value objects to same table (e.g., `Address` inside `Order`) |

---

## Common Interview Mistakes

1. **Not knowing EF Core vs EF 6 differences** — they're fundamentally different ORMs
2. **Saying "always use repository pattern"** — know when it adds value vs overhead
3. **Ignoring `AsNoTracking()`** — massive performance win for read-only queries
4. **Not mentioning connection pooling** — it's the #1 production database issue
5. **Forgetting about migrations strategy** — "we just run `dotnet ef database update`" is not production-ready
6. **Using `DateTime` instead of `DateTimeOffset`/`TIMESTAMPTZ`** — timezone bugs in production
