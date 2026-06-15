# 02 — Coding & Algorithms (.NET Focus)

.NET coding interviews test both algorithmic thinking and C# fluency. Interviewers expect idiomatic C#, proper use of the type system, and awareness of performance characteristics.

---

## What .NET Interviewers Specifically Assess

| Criteria | What they look for |
|----------|-------------------|
| C# idioms | Pattern matching, LINQ, records, nullable reference types |
| Async mastery | Proper `async`/`await`, avoiding deadlocks, `CancellationToken` |
| Type system | Generics, interfaces, value vs reference types |
| Memory awareness | When to use `Span<T>`, `StringBuilder`, avoiding allocations |
| API design | Clean method signatures, proper exception handling |

---

## Question 1 — Async/Await Deep Dive

> "Explain what happens when you `await` a task. Then implement a method that processes items concurrently with a maximum degree of parallelism."

### The Explanation

```
When you await a Task:
1. If the task is already completed → continues synchronously (no state machine)
2. If not completed → compiler generates a state machine
3. Current method returns to caller (frees the thread)
4. When task completes → continuation is scheduled on the captured SynchronizationContext
   (or thread pool if ConfigureAwait(false))
```

### Common Pitfalls

```csharp
// ❌ BAD: Blocking on async (deadlock in ASP.NET pre-.NET 6)
var result = GetDataAsync().Result;

// ❌ BAD: Async void (exceptions are unobservable)
async void HandleClick() { await DoWork(); }

// ❌ BAD: Unnecessary async (adds state machine overhead)
async Task<int> GetValue() { return await Task.FromResult(42); }

// ✅ GOOD: Just return the task
Task<int> GetValue() => Task.FromResult(42);
```

### Solution: Throttled Concurrent Processing

```csharp
public static async Task ProcessWithThrottleAsync<T>(
    IEnumerable<T> items,
    Func<T, CancellationToken, Task> processor,
    int maxConcurrency,
    CancellationToken ct = default)
{
    using var semaphore = new SemaphoreSlim(maxConcurrency);
    var tasks = items.Select(async item =>
    {
        await semaphore.WaitAsync(ct);
        try
        {
            await processor(item, ct);
        }
        finally
        {
            semaphore.Release();
        }
    });
    await Task.WhenAll(tasks);
}

// Usage
await ProcessWithThrottleAsync(
    urls,
    async (url, ct) => await httpClient.GetAsync(url, ct),
    maxConcurrency: 10);
```

### .NET 8+ Alternative: `Parallel.ForEachAsync`

```csharp
await Parallel.ForEachAsync(items, new ParallelOptions { MaxDegreeOfParallelism = 10 }, 
    async (item, ct) => await ProcessAsync(item, ct));
```

---

## Question 2 — Implement a Generic Result Type

> "Design a Result<T> type that represents either a success value or an error, eliminating the need for exceptions in expected failure cases."

### Why This Is Asked
Tests understanding of generics, value types, operator overloading, and API design — common in domain-driven .NET codebases.

### Solution

```csharp
public readonly struct Result<T>
{
    private readonly T? _value;
    private readonly string? _error;

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException($"Cannot access Value on failed result: {_error}");

    public string Error => IsFailure
        ? _error!
        : throw new InvalidOperationException("Cannot access Error on successful result");

    private Result(T value)
    {
        _value = value;
        _error = null;
        IsSuccess = true;
    }

    private Result(string error)
    {
        _value = default;
        _error = error;
        IsSuccess = false;
    }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error) => new(error);

    public static implicit operator Result<T>(T value) => Success(value);

    public TOut Match<TOut>(Func<T, TOut> onSuccess, Func<string, TOut> onFailure) =>
        IsSuccess ? onSuccess(_value!) : onFailure(_error!);
}

// Usage
public Result<User> GetUser(Guid id)
{
    var user = _db.Users.Find(id);
    return user is not null
        ? Result<User>.Success(user)
        : Result<User>.Failure($"User {id} not found");
}

// Consuming
var result = GetUser(id);
return result.Match(
    user => Ok(user),
    error => NotFound(error));
```

---

## Question 3 — LINQ Performance Pitfalls

> "Refactor this code to fix the performance issues."

### The Problem Code

```csharp
// ❌ Multiple enumeration, N+1 queries, unnecessary allocations
public List<OrderDto> GetRecentOrders(IQueryable<Order> orders)
{
    var recent = orders.Where(o => o.CreatedAt > DateTime.UtcNow.AddDays(-30));

    var count = recent.Count();           // DB query #1
    Console.WriteLine($"Found {count}");

    var sorted = recent                   // DB query #2 (re-executes the WHERE)
        .OrderByDescending(o => o.CreatedAt)
        .ToList();

    return sorted.Select(o => new OrderDto  // in-memory, fine
    {
        Id = o.Id,
        Total = o.Lines.Sum(l => l.Price),  // ❌ N+1: lazy-loads Lines for each order
        CustomerName = o.Customer.Name       // ❌ N+1: lazy-loads Customer for each order
    }).ToList();
}
```

### The Fix

```csharp
// ✅ Single query, eager loading, projection at DB level
public async Task<List<OrderDto>> GetRecentOrdersAsync(AppDbContext db, CancellationToken ct)
{
    var cutoff = DateTime.UtcNow.AddDays(-30);

    var results = await db.Orders
        .Where(o => o.CreatedAt > cutoff)
        .OrderByDescending(o => o.CreatedAt)
        .Select(o => new OrderDto
        {
            Id = o.Id,
            Total = o.Lines.Sum(l => l.Price),     // translated to SQL SUM
            CustomerName = o.Customer.Name          // translated to SQL JOIN
        })
        .ToListAsync(ct);

    Console.WriteLine($"Found {results.Count}");
    return results;
}
```

### Key Lessons

| Issue | Fix |
|-------|-----|
| Multiple enumeration of `IQueryable` | Materialise once with `ToListAsync()` |
| N+1 queries | Use `.Include()` or project with `.Select()` |
| `IEnumerable` vs `IQueryable` confusion | Keep as `IQueryable` until you need to materialise |
| Evaluating in memory | Ensure LINQ translates to SQL (check EF Core warnings) |

---

## Question 4 — Implement a Thread-Safe In-Memory Cache

> "Implement a cache with expiration that's safe for concurrent access."

### Solution

```csharp
public class InMemoryCache<TKey, TValue> where TKey : notnull
{
    private readonly ConcurrentDictionary<TKey, CacheEntry> _store = new();
    private readonly TimeSpan _defaultTtl;

    public InMemoryCache(TimeSpan defaultTtl) => _defaultTtl = defaultTtl;

    public TValue? Get(TKey key)
    {
        if (_store.TryGetValue(key, out var entry))
        {
            if (entry.ExpiresAt > DateTime.UtcNow)
                return entry.Value;
            _store.TryRemove(key, out _); // lazy eviction
        }
        return default;
    }

    public TValue GetOrAdd(TKey key, Func<TKey, TValue> factory, TimeSpan? ttl = null)
    {
        if (_store.TryGetValue(key, out var entry) && entry.ExpiresAt > DateTime.UtcNow)
            return entry.Value;

        // Note: factory may be called multiple times under contention
        // Use Lazy<T> wrapper if factory is expensive
        var newEntry = new CacheEntry(factory(key), DateTime.UtcNow + (ttl ?? _defaultTtl));
        return _store.AddOrUpdate(key, newEntry, (_, _) => newEntry).Value;
    }

    public void Set(TKey key, TValue value, TimeSpan? ttl = null)
    {
        var entry = new CacheEntry(value, DateTime.UtcNow + (ttl ?? _defaultTtl));
        _store[key] = entry;
    }

    public void Remove(TKey key) => _store.TryRemove(key, out _);

    private record CacheEntry(TValue Value, DateTime ExpiresAt);
}
```

### Follow-up: Preventing Stampede

```csharp
// Use Lazy<T> to ensure factory runs only once per key
private readonly ConcurrentDictionary<TKey, Lazy<CacheEntry>> _store = new();

public TValue GetOrAdd(TKey key, Func<TKey, TValue> factory, TimeSpan? ttl = null)
{
    var lazy = _store.GetOrAdd(key, k =>
        new Lazy<CacheEntry>(() =>
            new CacheEntry(factory(k), DateTime.UtcNow + (ttl ?? _defaultTtl))));

    if (lazy.Value.ExpiresAt > DateTime.UtcNow)
        return lazy.Value.Value;

    // Expired — remove and retry
    _store.TryRemove(key, out _);
    return GetOrAdd(key, factory, ttl);
}
```

---

## Question 5 — Value Types, Boxing, and Performance

> "What's wrong with this code from a performance perspective?"

```csharp
// ❌ Boxing on every iteration
public int SumValues(IEnumerable<object> items)
{
    int sum = 0;
    foreach (var item in items)
        sum += (int)item;  // unboxing
    return sum;
}

// ❌ Struct implementing interface causes boxing
public interface IShape { double Area(); }
public struct Circle : IShape
{
    public double Radius;
    public double Area() => Math.PI * Radius * Radius;
}

IShape shape = new Circle { Radius = 5 }; // BOXED! Allocated on heap
```

### Correct Approaches

```csharp
// ✅ Generic constraint avoids boxing
public T Sum<T>(IEnumerable<T> items) where T : INumber<T>
{
    T sum = T.Zero;
    foreach (var item in items)
        sum += item;
    return sum;
}

// ✅ Use generic constraint instead of interface variable
public double GetArea<T>(T shape) where T : IShape => shape.Area(); // no boxing

// ✅ Use Span<T> for stack-allocated buffers
public int CountDigits(ReadOnlySpan<char> input)
{
    int count = 0;
    foreach (var c in input)
        if (char.IsDigit(c)) count++;
    return count;
}
// Called with: CountDigits("hello123".AsSpan()) — zero allocations
```

---

## Question 6 — Dependency Injection Lifetimes

> "Explain the three DI lifetimes in ASP.NET Core. What's a captive dependency and why is it dangerous?"

### The Three Lifetimes

```csharp
services.AddTransient<IService, Service>();   // New instance every time
services.AddScoped<IService, Service>();      // One instance per HTTP request
services.AddSingleton<IService, Service>();   // One instance for app lifetime
```

### Captive Dependency Problem

```csharp
// ❌ DANGEROUS: Singleton captures a Scoped service
public class MySingleton
{
    private readonly IScopedService _scoped; // lives forever inside singleton!

    public MySingleton(IScopedService scoped) => _scoped = scoped;
    // _scoped was created for ONE request but now lives forever
    // → stale DbContext, disposed connections, data leaks between requests
}
```

### The Rule

```
Singleton → can depend on → Singleton only
Scoped    → can depend on → Scoped or Singleton
Transient → can depend on → Transient, Scoped, or Singleton
```

### Detection

```csharp
// Enable scope validation in development
builder.Host.UseDefaultServiceProvider(options =>
{
    options.ValidateScopes = true;   // throws on captive dependencies
    options.ValidateOnBuild = true;  // validates at startup, not first resolve
});
```

---

## Question 7 — Pattern Matching and Modern C#

> "Refactor this method using modern C# features."

### Before (C# 7 style)

```csharp
public string DescribeShape(object shape)
{
    if (shape == null) throw new ArgumentNullException(nameof(shape));

    if (shape is Circle c)
    {
        if (c.Radius > 100) return "Large circle";
        else return $"Circle with radius {c.Radius}";
    }
    else if (shape is Rectangle r)
    {
        if (r.Width == r.Height) return $"Square with side {r.Width}";
        else return $"Rectangle {r.Width}x{r.Height}";
    }
    else
    {
        return "Unknown shape";
    }
}
```

### After (C# 12 style)

```csharp
public string DescribeShape(object shape) => shape switch
{
    null => throw new ArgumentNullException(nameof(shape)),
    Circle { Radius: > 100 } => "Large circle",
    Circle c => $"Circle with radius {c.Radius}",
    Rectangle { Width: var w, Height: var h } when w == h => $"Square with side {w}",
    Rectangle r => $"Rectangle {r.Width}x{r.Height}",
    _ => "Unknown shape"
};
```

---

## Tips for .NET Coding Interviews

1. **Use `var` appropriately** — when the type is obvious from the right side
2. **Prefer `async Task` over `async void`** — always
3. **Use `CancellationToken`** — pass it through every async method
4. **Know your collections** — `List<T>` vs `HashSet<T>` vs `Dictionary<K,V>` vs `ImmutableArray<T>`
5. **String handling** — `StringBuilder` for loops, `string.Create` for high-perf, interpolation for readability
6. **Null safety** — use nullable reference types (`string?`), null-conditional (`?.`), null-coalescing (`??`)
7. **Records for DTOs** — `public record OrderDto(Guid Id, decimal Total);`
8. **`IAsyncEnumerable<T>`** — for streaming data without buffering entire collections
