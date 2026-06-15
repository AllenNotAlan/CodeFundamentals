# 04 — API Design & Distributed Systems (.NET Focus)

.NET roles expect you to design APIs using ASP.NET Core idioms and understand how .NET services communicate in a distributed architecture.

---

## Question 1 — Design a RESTful API with ASP.NET Core

> "Design and implement a clean API for a resource management system using ASP.NET Core."

### Minimal API vs Controllers

```csharp
// Minimal API (preferred for simple, focused endpoints)
app.MapGet("/api/products/{id}", async (Guid id, IProductService svc, CancellationToken ct) =>
{
    var product = await svc.GetByIdAsync(id, ct);
    return product is not null ? Results.Ok(product) : Results.NotFound();
});

// Controller (preferred for complex APIs with shared filters/conventions)
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service) => _service = service;

    [HttpGet("{id:guid}")]
    [ProducesResponseType<ProductDto>(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var product = await _service.GetByIdAsync(id, ct);
        return product is not null ? Ok(product) : NotFound();
    }

    [HttpPost]
    [ProducesResponseType<ProductDto>(201)]
    [ProducesResponseType<ValidationProblemDetails>(400)]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        var product = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }
}
```

### Request Validation with FluentValidation

```csharp
public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.Currency).Must(c => c is "GBP" or "USD" or "EUR");
    }
}

// Register in DI
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();
```

### Problem Details (RFC 7807)

```csharp
// ASP.NET Core has built-in support
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = ctx =>
    {
        ctx.ProblemDetails.Extensions["traceId"] = ctx.HttpContext.TraceIdentifier;
    };
});

// Produces standardised error responses:
// {
//   "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
//   "title": "Not Found",
//   "status": 404,
//   "traceId": "00-abc123..."
// }
```

### Key Design Decisions

| Decision | .NET Approach |
|----------|--------------|
| Pagination | Cursor-based with `IAsyncEnumerable<T>` streaming for large datasets |
| Versioning | `Asp.Versioning.Http` package (URL or header-based) |
| Authentication | `[Authorize]` attribute + JWT Bearer / OpenID Connect |
| Rate limiting | Built-in `RateLimiter` middleware (.NET 7+) |
| OpenAPI docs | Swashbuckle or NSwag for auto-generated Swagger |

---

## Question 2 — Middleware Pipeline & Cross-Cutting Concerns

> "How does the ASP.NET Core middleware pipeline work? How would you implement cross-cutting concerns?"

### Pipeline Visualisation

```
Request →  [Exception Handler]
              → [Rate Limiter]
                 → [Authentication]
                    → [Authorization]
                       → [Custom Logging]
                          → [Endpoint/Controller]
                       ← [Custom Logging]
                    ← [Authorization]
                 ← [Authentication]
              ← [Rate Limiter]
           ← [Exception Handler]
← Response
```

### Custom Middleware

```csharp
public class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestTimingMiddleware> _logger;

    public RequestTimingMiddleware(RequestDelegate next, ILogger<RequestTimingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            await _next(context);
        }
        finally
        {
            sw.Stop();
            _logger.LogInformation(
                "HTTP {Method} {Path} responded {StatusCode} in {Elapsed}ms",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                sw.ElapsedMilliseconds);
        }
    }
}

// Registration order matters!
app.UseMiddleware<RequestTimingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

### Global Exception Handling

```csharp
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var problemDetails = exception switch
        {
            NotFoundException e => new ProblemDetails
            {
                Status = 404, Title = "Not Found", Detail = e.Message
            },
            ValidationException e => new ProblemDetails
            {
                Status = 400, Title = "Validation Error", Detail = e.Message
            },
            _ => new ProblemDetails
            {
                Status = 500, Title = "Internal Server Error"
            }
        };
        context.Response.StatusCode = problemDetails.Status!.Value;
        await context.Response.WriteAsJsonAsync(problemDetails);
    });
});
```

---

## Question 3 — Microservice Communication in .NET

> "How do .NET services communicate? When would you use HTTP vs gRPC vs messaging?"

### Comparison

| Protocol | Use Case | .NET Support |
|----------|----------|-------------|
| HTTP/REST | Public APIs, simple CRUD | `HttpClient`, `IHttpClientFactory` |
| gRPC | Internal service-to-service, high throughput | `Grpc.AspNetCore`, code-gen from .proto |
| Message bus | Async events, decoupled services | MassTransit, NServiceBus, Azure Service Bus SDK |
| SignalR | Real-time client push | `Microsoft.AspNetCore.SignalR` |

### HTTP with Resilience (Polly + IHttpClientFactory)

```csharp
builder.Services.AddHttpClient<IOrderService, OrderServiceClient>(client =>
{
    client.BaseAddress = new Uri("https://orders-api.internal");
})
.AddStandardResilienceHandler(); // .NET 8: built-in retry, circuit breaker, timeout

// Or custom Polly pipeline
.AddResilienceHandler("custom", builder =>
{
    builder.AddRetry(new HttpRetryStrategyOptions
    {
        MaxRetryAttempts = 3,
        BackoffType = DelayBackoffType.Exponential
    });
    builder.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
    {
        SamplingDuration = TimeSpan.FromSeconds(10),
        FailureRatio = 0.5,
        MinimumThroughput = 10,
        BreakDuration = TimeSpan.FromSeconds(30)
    });
    builder.AddTimeout(TimeSpan.FromSeconds(5));
});
```

### gRPC Service Definition

```protobuf
// orders.proto
syntax = "proto3";

service OrderService {
  rpc GetOrder (GetOrderRequest) returns (OrderResponse);
  rpc StreamOrders (StreamOrdersRequest) returns (stream OrderResponse);
}

message GetOrderRequest { string order_id = 1; }
message OrderResponse {
  string id = 1;
  string status = 2;
  int64 total = 3;
}
```

```csharp
// Server implementation
public class OrderGrpcService : OrderService.OrderServiceBase
{
    public override async Task<OrderResponse> GetOrder(
        GetOrderRequest request, ServerCallContext context)
    {
        var order = await _repository.GetAsync(request.OrderId, context.CancellationToken);
        return new OrderResponse { Id = order.Id, Status = order.Status, Total = order.Total };
    }
}
```

### Message-Based Communication (MassTransit)

```csharp
// Define message contract
public record OrderCreated(Guid OrderId, Guid UserId, decimal Total);

// Publisher
await _publishEndpoint.Publish(new OrderCreated(order.Id, order.UserId, order.Total));

// Consumer
public class OrderCreatedConsumer : IConsumer<OrderCreated>
{
    public async Task Consume(ConsumeContext<OrderCreated> context)
    {
        var message = context.Message;
        await _notificationService.SendOrderConfirmation(message.UserId, message.OrderId);
    }
}

// Registration
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<OrderCreatedConsumer>();
    x.UsingAzureServiceBus((ctx, cfg) =>
    {
        cfg.Host(connectionString);
        cfg.ConfigureEndpoints(ctx);
    });
});
```

---

## Question 4 — Health Checks & Observability

> "How do you make a .NET microservice observable and production-ready?"

### Health Checks

```csharp
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString, name: "database")
    .AddRedis(redisConnection, name: "cache")
    .AddAzureServiceBusTopic(sbConnection, "orders", name: "servicebus");

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false // liveness = app is running, no dependency checks
});
```

### OpenTelemetry

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddEntityFrameworkCoreInstrumentation()
        .AddSource("MyApp")
        .AddOtlpExporter())
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddRuntimeInstrumentation()
        .AddOtlpExporter());
```

### Structured Logging

```csharp
builder.Host.UseSerilog((context, config) => config
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Service", "OrderApi")
    .WriteTo.Console(new JsonFormatter()));

// Usage — structured, not string interpolation
_logger.LogInformation("Order {OrderId} created for user {UserId}, total: {Total}",
    order.Id, order.UserId, order.Total);
```

---

## Question 5 — Outbox Pattern in .NET

> "How do you ensure a database write and an event publish happen atomically?"

### Implementation with EF Core

```csharp
public class OutboxMessage
{
    public Guid Id { get; set; }
    public string Type { get; set; } = default!;
    public string Payload { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}

// In your service — write entity + outbox message in same transaction
public async Task CreateOrderAsync(Order order, CancellationToken ct)
{
    _db.Orders.Add(order);
    _db.OutboxMessages.Add(new OutboxMessage
    {
        Id = Guid.NewGuid(),
        Type = nameof(OrderCreated),
        Payload = JsonSerializer.Serialize(new OrderCreated(order.Id, order.UserId, order.Total)),
        CreatedAt = DateTime.UtcNow
    });
    await _db.SaveChangesAsync(ct); // single transaction
}

// Background worker publishes outbox messages
public class OutboxProcessor : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var messages = await db.OutboxMessages
                .Where(m => m.ProcessedAt == null)
                .OrderBy(m => m.CreatedAt)
                .Take(100)
                .ToListAsync(ct);

            foreach (var msg in messages)
            {
                await _publisher.PublishAsync(msg.Type, msg.Payload, ct);
                msg.ProcessedAt = DateTime.UtcNow;
            }
            await db.SaveChangesAsync(ct);
            await Task.Delay(TimeSpan.FromSeconds(1), ct);
        }
    }
}
```

---

## Question 6 — API Rate Limiting (.NET 7+)

> "How do you implement rate limiting in ASP.NET Core?"

### Built-in Rate Limiter

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Per-user sliding window
    options.AddPolicy("per-user", context =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: context.User?.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString(),
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6
            }));

    // Global fixed window
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter("global",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10000,
                Window = TimeSpan.FromMinutes(1)
            }));
});

app.UseRateLimiter();

// Apply to specific endpoints
app.MapGet("/api/expensive", Handler).RequireRateLimiting("per-user");
```

---

## Key .NET Distributed Systems Libraries

| Concern | Library | Notes |
|---------|---------|-------|
| HTTP resilience | Polly / `Microsoft.Extensions.Http.Resilience` | Retry, circuit breaker, timeout |
| Messaging | MassTransit, NServiceBus | Abstracts RabbitMQ, Azure SB, SQS |
| Service discovery | Consul, Azure Service Fabric | Or Kubernetes DNS |
| Distributed cache | `IDistributedCache` + Redis | StackExchange.Redis |
| Distributed locking | RedLock.net, Azure Blob leases | For singleton operations |
| Observability | OpenTelemetry .NET SDK | Traces, metrics, logs |
