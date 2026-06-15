# 01 — System Design (.NET Focus)

System design interviews for .NET roles expect you to map architectural patterns to concrete .NET technologies. You should know when to reach for Azure Service Bus vs Kafka, EF Core vs Dapper, and how ASP.NET Core fits into a microservice topology.

---

## Framework for Answering

```
1. Clarify Requirements (2–3 min)
   → Functional & non-functional requirements
   → Scale: users, throughput, storage

2. High-Level Design (10 min)
   → Components, data flow, .NET services
   → Which Azure/AWS services and why

3. Deep Dive (15–20 min)
   → Pick 2–3 components
   → Show .NET implementation patterns
   → Data model, APIs, trade-offs

4. Operational Concerns (5 min)
   → Monitoring, deployment, failure modes
```

---

## Question 1 — Design a Background Job Processing System

> "Design a system that processes long-running tasks (report generation, email campaigns, data imports) reliably."

### Requirements
- **Functional:** Submit jobs, execute asynchronously, retry on failure, schedule recurring jobs, priority queues
- **Non-functional:** At-least-once execution, horizontal scaling, job visibility/monitoring

### .NET Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  ASP.NET     │────▶│  Azure Service   │────▶│  Worker Service     │
│  Core API    │     │  Bus / RabbitMQ  │     │  (BackgroundService)│
└──────────────┘     └──────────────────┘     └────────┬────────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │  SQL Server /    │
                                              │  Postgres        │
                                              │  (Job State)     │
                                              └──────────────────┘
```

### Implementation with .NET Worker Services

```csharp
// Program.cs — Worker Service
var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<JobProcessorWorker>();
builder.Services.AddSingleton<IJobQueue, ServiceBusJobQueue>();
builder.Services.AddScoped<IJobExecutor, JobExecutor>();
var host = builder.Build();
host.Run();

// Worker
public class JobProcessorWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IJobQueue _queue;

    public JobProcessorWorker(IServiceScopeFactory scopeFactory, IJobQueue queue)
    {
        _scopeFactory = scopeFactory;
        _queue = queue;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        await foreach (var job in _queue.DequeueAsync(ct))
        {
            using var scope = _scopeFactory.CreateScope();
            var executor = scope.ServiceProvider.GetRequiredService<IJobExecutor>();

            try
            {
                await executor.ExecuteAsync(job, ct);
                await _queue.CompleteAsync(job);
            }
            catch (Exception ex)
            {
                if (job.Attempts >= job.MaxRetries)
                    await _queue.DeadLetterAsync(job, ex);
                else
                    await _queue.AbandonAsync(job); // will be redelivered
            }
        }
    }
}
```

### Key .NET Decisions

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Queue | Azure Service Bus, RabbitMQ, SQS | Service Bus for Azure-native; RabbitMQ for self-hosted |
| Worker hosting | .NET Worker Service, Azure Functions | Worker Service for long-running; Functions for short bursts |
| Job state | SQL Server, Postgres | Relational DB for queryable job history |
| Scheduling | Hangfire, Quartz.NET, Azure Timer Functions | Hangfire for dashboard + persistence; Quartz for complex schedules |
| Scaling | KEDA, Azure Container Apps | Scale workers based on queue depth |

### Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| Hangfire | Built-in dashboard, persistence, retries | Polling-based; SQL dependency |
| Azure Service Bus + Worker | True push-based; managed infrastructure | Azure lock-in; more code to write |
| Azure Functions (queue trigger) | Zero infrastructure; auto-scale | Cold starts; 10-min execution limit (Consumption) |

---

## Question 2 — Design a Multi-Tenant SaaS Platform

> "Design a SaaS application where multiple organisations share the same deployment but have isolated data."

### Requirements
- **Functional:** Tenant isolation, per-tenant configuration, tenant-aware routing
- **Non-functional:** Data isolation (regulatory), per-tenant scaling, shared infrastructure cost efficiency

### Architecture

```
┌──────────────┐     ┌──────────────────────────────────────────┐
│   Clients    │────▶│  ASP.NET Core API                        │
│  (per tenant)│     │  ┌────────────────────────────────────┐  │
└──────────────┘     │  │  Tenant Resolution Middleware      │  │
                     │  │  (subdomain / header / token claim)│  │
                     │  └────────────────────────────────────┘  │
                     │  ┌────────────────────────────────────┐  │
                     │  │  EF Core with Tenant Query Filter  │  │
                     │  └────────────────────────────────────┘  │
                     └──────────────────┬───────────────────────┘
                                        │
                     ┌──────────────────┼──────────────────┐
                     │                  │                  │
                     ▼                  ▼                  ▼
              ┌────────────┐   ┌────────────┐    ┌────────────┐
              │ DB per     │   │ Schema per │    │ Shared DB  │
              │ tenant     │   │ tenant     │    │ (TenantId  │
              │ (isolated) │   │ (moderate) │    │  column)   │
              └────────────┘   └────────────┘    └────────────┘
```

### EF Core Multi-Tenancy Implementation

```csharp
// Tenant resolution middleware
public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public async Task InvokeAsync(HttpContext context, ITenantResolver resolver)
    {
        var tenantId = await resolver.ResolveAsync(context);
        context.Items["TenantId"] = tenantId;
        await _next(context);
    }
}

// DbContext with global query filter
public class AppDbContext : DbContext
{
    private readonly Guid _tenantId;

    public AppDbContext(DbContextOptions options, ITenantAccessor tenantAccessor)
        : base(options)
    {
        _tenantId = tenantAccessor.TenantId;
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Automatically filter ALL queries by tenant
        builder.Entity<Order>().HasQueryFilter(o => o.TenantId == _tenantId);
        builder.Entity<Product>().HasQueryFilter(p => p.TenantId == _tenantId);
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        // Auto-set TenantId on new entities
        foreach (var entry in ChangeTracker.Entries<ITenantEntity>()
            .Where(e => e.State == EntityState.Added))
        {
            entry.Entity.TenantId = _tenantId;
        }
        return base.SaveChangesAsync(ct);
    }
}
```

### Data Isolation Strategies

| Strategy | Isolation | Cost | Complexity |
|----------|-----------|------|------------|
| Shared DB + TenantId column | Low (row-level) | Lowest | Low — query filters |
| Schema per tenant | Medium | Medium | Medium — migration per schema |
| Database per tenant | Highest | Highest | High — connection management |

---

## Question 3 — Design a Real-Time Dashboard with SignalR

> "Design a system that pushes live metrics (orders, active users, errors) to an admin dashboard."

### Requirements
- **Functional:** Real-time updates, multiple metric types, historical data + live stream
- **Non-functional:** <1 second update latency, support 1000 concurrent dashboard connections

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Services    │────▶│  Event Bus   │────▶│  Metrics Aggregator │
│  (emit      │     │  (Kafka /    │     │  (Worker Service)   │
│   events)   │     │   Service Bus)│     └────────┬────────────┘
└──────────────┘     └──────────────┘              │
                                                   ▼
                                          ┌──────────────────┐
┌──────────────┐                          │  SignalR Hub      │
│  Dashboard   │◀════ WebSocket ═════════▶│  (ASP.NET Core)  │
│  (Browser)   │                          └──────────────────┘
└──────────────┘
```

### SignalR Implementation

```csharp
// Hub
public class MetricsHub : Hub
{
    public async Task SubscribeToMetric(string metricName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, metricName);
    }
}

// Background service pushing updates
public class MetricsBroadcaster : BackgroundService
{
    private readonly IHubContext<MetricsHub> _hub;
    private readonly IMetricsStream _stream;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        await foreach (var metric in _stream.ReadAsync(ct))
        {
            await _hub.Clients.Group(metric.Name).SendAsync(
                "MetricUpdated",
                new { metric.Name, metric.Value, metric.Timestamp },
                ct);
        }
    }
}

// Startup configuration
builder.Services.AddSignalR()
    .AddAzureSignalR(); // for scale-out across multiple servers
```

### Scaling SignalR

| Scenario | Solution |
|----------|----------|
| Single server | In-memory; no backplane needed |
| Multiple servers | Azure SignalR Service (managed backplane) |
| Self-hosted scale-out | Redis backplane (`AddStackExchangeRedis()`) |
| Very high fan-out | Azure SignalR Serverless mode |

---

## Question 4 — Design a CQRS + Event Sourcing System

> "Design an order management system using CQRS and Event Sourcing."

### Why CQRS in .NET?
- Separates read and write models — optimise each independently
- Event sourcing gives full audit trail and temporal queries
- Natural fit with DDD (Domain-Driven Design) in C#

### Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Commands   │────▶│  Command Handler │────▶│  Event Store    │
│  (Write)    │     │  (MediatR)       │     │  (EventStoreDB /│
└─────────────┘     └──────────────────┘     │   SQL + Events) │
                                              └────────┬────────┘
                                                       │ publish
                                                       ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Queries    │────▶│  Query Handler   │────▶│  Read Model     │
│  (Read)     │     │  (MediatR)       │     │  (Denormalised)  │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

### Implementation

```csharp
// Domain aggregate
public class Order
{
    private readonly List<IDomainEvent> _events = new();
    public IReadOnlyList<IDomainEvent> DomainEvents => _events;

    public Guid Id { get; private set; }
    public OrderStatus Status { get; private set; }
    public List<OrderLine> Lines { get; private set; } = new();

    public static Order Create(Guid userId, List<OrderLine> lines)
    {
        var order = new Order { Id = Guid.NewGuid(), Status = OrderStatus.Pending, Lines = lines };
        order._events.Add(new OrderCreatedEvent(order.Id, userId, lines));
        return order;
    }

    public void Confirm()
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException("Can only confirm pending orders");
        Status = OrderStatus.Confirmed;
        _events.Add(new OrderConfirmedEvent(Id));
    }
}

// Command handler (using MediatR)
public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IEventStore _eventStore;

    public async Task<Guid> Handle(CreateOrderCommand cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.UserId, cmd.Lines);
        await _eventStore.AppendAsync(order.Id, order.DomainEvents, ct);
        return order.Id;
    }
}

// Read model projector (event handler)
public class OrderReadModelProjector : INotificationHandler<OrderCreatedEvent>
{
    private readonly IReadModelDb _db;

    public async Task Handle(OrderCreatedEvent e, CancellationToken ct)
    {
        await _db.UpsertAsync(new OrderReadModel
        {
            Id = e.OrderId,
            UserId = e.UserId,
            Status = "Pending",
            ItemCount = e.Lines.Count,
            Total = e.Lines.Sum(l => l.Quantity * l.UnitPrice)
        }, ct);
    }
}
```

### When to Use CQRS + Event Sourcing

| Use when | Avoid when |
|----------|-----------|
| Complex domain with rich business rules | Simple CRUD applications |
| Audit trail is a hard requirement | Team is unfamiliar with the pattern |
| Read and write patterns differ significantly | Consistency requirements are simple |
| You need temporal queries ("state at time X") | You need strong consistency on reads immediately |

---

## Question 5 — Design a Caching Strategy for a .NET API

> "Your API is hitting the database too hard. Design a caching layer."

### Multi-Level Caching Architecture

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Client  │────▶│  Response    │────▶│  Distributed │────▶│  Database│
│          │     │  Cache       │     │  Cache       │     │          │
│          │     │  (HTTP/CDN)  │     │  (Redis)     │     │          │
└──────────┘     └──────────────┘     └──────────────┘     └──────────┘
                        │                     │
                        │              ┌──────────────┐
                        │              │  In-Memory   │
                        └─────────────▶│  Cache       │
                                       │  (IMemoryCache)│
                                       └──────────────┘
```

### Implementation

```csharp
// Layered cache service
public class CachedProductService : IProductService
{
    private readonly IMemoryCache _memoryCache;
    private readonly IDistributedCache _distributedCache;
    private readonly IProductRepository _repository;

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var key = $"product:{id}";

        // L1: In-memory (fastest, per-instance)
        if (_memoryCache.TryGetValue(key, out Product? cached))
            return cached;

        // L2: Distributed cache (shared across instances)
        var bytes = await _distributedCache.GetAsync(key, ct);
        if (bytes != null)
        {
            var product = JsonSerializer.Deserialize<Product>(bytes);
            _memoryCache.Set(key, product, TimeSpan.FromMinutes(1));
            return product;
        }

        // L3: Database
        var fromDb = await _repository.GetByIdAsync(id, ct);
        if (fromDb != null)
        {
            var serialized = JsonSerializer.SerializeToUtf8Bytes(fromDb);
            await _distributedCache.SetAsync(key, serialized,
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) }, ct);
            _memoryCache.Set(key, fromDb, TimeSpan.FromMinutes(1));
        }
        return fromDb;
    }
}

// Cache invalidation on write
public async Task UpdateProductAsync(Product product, CancellationToken ct)
{
    await _repository.UpdateAsync(product, ct);
    await _distributedCache.RemoveAsync($"product:{product.Id}", ct);
    _memoryCache.Remove($"product:{product.Id}");
}
```

### .NET Caching Options

| Layer | Technology | TTL | Scope |
|-------|-----------|-----|-------|
| HTTP response | `[ResponseCache]`, CDN | Minutes–hours | Per-endpoint |
| In-memory | `IMemoryCache` | Seconds–minutes | Per-instance |
| Distributed | Redis (`IDistributedCache`) | Minutes–hours | Shared across instances |
| Output caching | `OutputCache` middleware (.NET 7+) | Configurable | Per-endpoint, server-side |

### Cache Invalidation Patterns

| Pattern | How | When |
|---------|-----|------|
| TTL expiry | Set absolute/sliding expiration | Data that's OK to be slightly stale |
| Write-through | Update cache on every write | Strong consistency needed |
| Event-driven | Invalidate on domain event | Microservices; eventual consistency OK |
| Cache-aside | Application manages cache explicitly | Most common; full control |

---

## General Tips for .NET System Design

1. **Name .NET-specific technologies** — "I'd use Azure Service Bus with a Worker Service" not "some queue with a consumer"
2. **Know the hosting models** — Kestrel, IIS, containers, Azure App Service, Azure Functions
3. **Understand DI lifetimes** — Singleton services can't depend on Scoped services (captive dependency)
4. **Think about `IAsyncDisposable`** — long-lived connections (DB, message broker) need proper lifecycle
5. **Configuration hierarchy** — `appsettings.json` < environment variables < Azure Key Vault
6. **Health checks** — ASP.NET Core has built-in health check middleware; use it for readiness/liveness probes
