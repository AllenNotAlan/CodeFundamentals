# 04 — API Design & Distributed Systems

Modern tech companies run microservice architectures serving millions of users. This interview tests whether you can design clean APIs and reason about the complexities of distributed systems.

---

## Question 1 — Design a RESTful API for a Resource Management System

> "Design the API for a project management tool — users, projects, tasks, and comments."

### Resource Design

```
GET    /projects                        → List user's projects
POST   /projects                        → Create a project
GET    /projects/{id}                   → Get project details
PUT    /projects/{id}                   → Update project
DELETE /projects/{id}                   → Delete project

GET    /projects/{id}/tasks             → List tasks (paginated, filterable)
POST   /projects/{id}/tasks             → Create a task
GET    /tasks/{id}                      → Get task detail
PATCH  /tasks/{id}                      → Update task fields

GET    /tasks/{id}/comments             → List comments
POST   /tasks/{id}/comments             → Add comment
```

### Request/Response Examples

**Create Task:**
```http
POST /v1/projects/proj_123/tasks
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add OAuth2 login flow with Google and GitHub providers",
  "assignee_id": "user_456",
  "priority": "high",
  "due_date": "2024-02-15"
}
```

**Response (201 Created):**
```json
{
  "id": "task_789",
  "title": "Implement user authentication",
  "status": "todo",
  "priority": "high",
  "assignee": { "id": "user_456", "name": "Jane Smith" },
  "due_date": "2024-02-15",
  "created_at": "2024-01-15T10:30:00Z",
  "_links": {
    "self": "/v1/tasks/task_789",
    "project": "/v1/projects/proj_123",
    "comments": "/v1/tasks/task_789/comments"
  }
}
```

**List Tasks (paginated with cursor, filtered):**
```http
GET /v1/projects/proj_123/tasks?status=in_progress&limit=25&cursor=task_abc
```
```json
{
  "data": [
    {
      "id": "task_789",
      "title": "Implement user authentication",
      "status": "in_progress",
      "priority": "high",
      "assignee": { "id": "user_456", "name": "Jane Smith" },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "has_more": true,
    "next_cursor": "task_789"
  }
}
```

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Pagination | Cursor-based (not offset) | Stable under concurrent inserts; offset skips/duplicates items |
| Partial updates | PATCH with sparse fields | PUT requires full resource; PATCH is more practical |
| Versioning | URL path (`/v1/`) | Simple, explicit, easy to route at load balancer |
| Nested vs flat | Flat for tasks (`/tasks/{id}`) | Avoids deep nesting; tasks can move between projects |
| Timestamps | ISO 8601 UTC | Unambiguous, sortable, timezone-safe |

### Error Response Format

```json
{
  "error": {
    "type": "validation_error",
    "message": "Request body contains invalid fields.",
    "details": [
      { "field": "due_date", "issue": "must be a future date" },
      { "field": "priority", "issue": "must be one of: low, medium, high, critical" }
    ]
  }
}
```

---

## Question 2 — Idempotency in Distributed Systems

> "How do you ensure an operation isn't performed twice if the client retries?"

### The Problem

```
Client → POST /orders → Server processes → Response lost in transit
Client → POST /orders → Server processes AGAIN → Duplicate order!
```

### Solution: Idempotency Keys

```
┌────────┐                    ┌─────────────┐         ┌──────────────┐
│ Client │─── POST /orders ──▶│   API       │────────▶│ Idempotency  │
│        │   Idempotency-Key  │   Gateway   │         │   Store      │
└────────┘                    └──────┬──────┘         │  (Redis)     │
                                     │                └──────┬───────┘
                                     │                       │
                              ┌──────▼──────┐               │
                              │ Key exists?  │◀──────────────┘
                              └──────┬──────┘
                                     │
                          ┌──────────┼──────────┐
                          │ NO                   │ YES
                          ▼                      ▼
                   ┌─────────────┐      ┌──────────────┐
                   │ Process     │      │ Return cached │
                   │ request     │      │ response      │
                   │ Store result│      └──────────────┘
                   └─────────────┘
```

### Implementation

```csharp
public async Task<TResult> ProcessIdempotent<TResult>(
    string idempotencyKey, Func<Task<TResult>> action)
{
    // Check if already processed
    var cached = await _redis.GetAsync<TResult>($"idem:{idempotencyKey}");
    if (cached != null) return cached;

    // Acquire lock to prevent concurrent processing of same key
    await using var lockHandle = await _redis.AcquireLockAsync(
        $"idem_lock:{idempotencyKey}", TimeSpan.FromSeconds(30));

    // Double-check after acquiring lock
    cached = await _redis.GetAsync<TResult>($"idem:{idempotencyKey}");
    if (cached != null) return cached;

    // Process the request
    var result = await action();

    // Cache the result (TTL: 24 hours)
    await _redis.SetAsync($"idem:{idempotencyKey}", result, TimeSpan.FromHours(24));

    return result;
}
```

### Key Considerations
- **TTL:** Keys should expire (24–72 hours) — clients shouldn't retry after days
- **Scope:** Key should be per-user, per-action (not globally unique)
- **Storage:** Redis for speed; persist to DB for audit trail
- **Concurrent requests:** Use distributed locking to prevent race conditions

---

## Question 3 — Event-Driven Architecture

> "How would you design the communication between services in a microservice platform?"

### Synchronous vs Asynchronous

```
Synchronous (HTTP/gRPC):
  ✅ Simple, immediate response
  ❌ Tight coupling, cascading failures, retry complexity

Asynchronous (Events):
  ✅ Loose coupling, resilience, natural audit trail
  ❌ Eventual consistency, harder to debug, ordering challenges
```

### Event-Driven Architecture

```
┌──────────────┐     ┌─────────────────────────────────────────────┐
│   Order      │     │              Kafka / Event Bus               │
│   Service    │────▶│                                             │
└──────────────┘     │  Topic: order.created                       │
                     │  Topic: order.fulfilled                     │
                     │  Topic: order.cancelled                     │
                     └──────┬──────────┬──────────┬───────────────┘
                            │          │          │
                            ▼          ▼          ▼
                     ┌───────────┐ ┌────────┐ ┌──────────────┐
                     │Notification│ │Inventory│ │ Analytics    │
                     │ Service   │ │ Service│ │ Service      │
                     └───────────┘ └────────┘ └──────────────┘
```

### Event Schema Design

```json
{
  "event_id": "evt_abc123",
  "event_type": "order.created",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00.123Z",
  "data": {
    "order_id": "ord_xyz789",
    "user_id": "user_123",
    "items": [
      { "product_id": "prod_456", "quantity": 2, "unit_price": 1999 }
    ],
    "total": 3998
  },
  "metadata": {
    "correlation_id": "req_abc",
    "source_service": "order-service"
  }
}
```

### Guarantees and Trade-offs

| Guarantee | How to achieve |
|-----------|---------------|
| At-least-once delivery | Consumer acknowledges after processing; redelivers on failure |
| Ordering | Partition by entity ID — all events for one order are ordered |
| Idempotent consumers | Store processed event_ids; skip duplicates |
| Schema evolution | Use a schema registry; add fields (never remove) |

---

## Question 4 — Consistency Patterns

> "How do you maintain consistency across microservices when an operation spans multiple services?"

### The Problem

An order involves: Inventory Service, Payment Service, Shipping Service, Notification Service.
If one fails, what happens?

### Pattern 1: Saga (Choreography)

Each service publishes events; the next service reacts. On failure, compensating events undo previous steps.

```
Order Created → Reserve Inventory → Charge Payment → Schedule Shipping
                      ↓ (fails)
              Release Inventory (compensating action)
```

### Pattern 2: Saga (Orchestration)

A central orchestrator coordinates the steps:

```csharp
public class OrderSaga
{
    public async Task<OrderResult> Execute(OrderRequest request)
    {
        // Step 1: Reserve inventory
        var reservation = await _inventoryService.Reserve(request.Items);

        try
        {
            // Step 2: Charge payment
            var charge = await _paymentService.Charge(request.UserId, request.Total);

            try
            {
                // Step 3: Create shipment
                await _shippingService.Schedule(request.Address, reservation.Id);
                return OrderResult.Success();
            }
            catch
            {
                await _paymentService.Refund(charge.Id); // compensate
                throw;
            }
        }
        catch
        {
            await _inventoryService.Release(reservation.Id); // compensate
            return OrderResult.Failed("Processing error");
        }
    }
}
```

### Pattern 3: Outbox Pattern

Ensures database write and event publish are atomic:

```
┌─────────────────────────────────────────┐
│  Single Database Transaction:           │
│                                         │
│  1. INSERT INTO orders (...)            │
│  2. INSERT INTO outbox (event_payload)  │
│                                         │
│  COMMIT                                 │
└─────────────────────────────────────────┘
         │
         ▼ (background worker polls outbox)
┌─────────────────────────────────────────┐
│  Outbox Publisher:                       │
│  1. SELECT * FROM outbox WHERE sent=false│
│  2. Publish to Kafka                    │
│  3. UPDATE outbox SET sent=true         │
└─────────────────────────────────────────┘
```

**Why?** You can't atomically write to a DB and publish to Kafka. The outbox pattern solves this by making the event part of the DB transaction.

---

## Question 5 — API Versioning & Backward Compatibility

> "How do you evolve APIs without breaking existing clients?"

### Strategies

| Strategy | Pros | Cons |
|----------|------|------|
| URL versioning (`/v1/`, `/v2/`) | Explicit, easy routing | URL pollution, hard to deprecate |
| Header versioning (`Accept: application/vnd.api.v2+json`) | Clean URLs | Hidden, harder to test |
| Additive changes only | No versioning needed | Can't remove/rename fields |

### Rules for Non-Breaking Changes

```
✅ Safe (backward compatible):
  - Add a new optional field to response
  - Add a new optional query parameter
  - Add a new endpoint
  - Add a new enum value (if clients handle unknown values)

❌ Breaking:
  - Remove or rename a field
  - Change a field's type
  - Make an optional field required
  - Change the meaning of an existing field
  - Remove an endpoint
```

### Deprecation Strategy

```http
GET /v1/users/123
→ 200 OK
   Sunset: Sat, 01 Jun 2025 00:00:00 GMT
   Deprecation: true
   Link: </v2/users/123>; rel="successor-version"
```

Communicate deprecation via headers, documentation, and direct outreach to consumers.

---

## Question 6 — Circuit Breaker Pattern

> "How do you prevent cascading failures when a downstream service is unhealthy?"

### The Problem

```
API Gateway → Auth Service (down) → timeout → retry → timeout → retry
  → API Gateway thread pool exhausted → ALL requests fail
```

### Circuit Breaker States

```
         ┌─────────────────────────────────────────┐
         │                                         │
         ▼                                         │
    ┌─────────┐    failures > threshold    ┌──────────┐
    │ CLOSED  │ ─────────────────────────▶ │   OPEN   │
    │(normal) │                            │(fail fast)│
    └─────────┘                            └─────┬────┘
         ▲                                       │
         │         timeout expires               │
         │                                       ▼
         │                               ┌────────────┐
         └─────── success ───────────────│ HALF-OPEN  │
                                         │(test one)  │
                                         └────────────┘
```

### Implementation

```csharp
public class CircuitBreaker
{
    private enum State { Closed, Open, HalfOpen }

    private State _state = State.Closed;
    private int _failureCount = 0;
    private DateTime _openedAt;
    private readonly int _threshold = 5;
    private readonly TimeSpan _timeout = TimeSpan.FromSeconds(30);

    public async Task<T> Execute<T>(Func<Task<T>> action, Func<Task<T>> fallback)
    {
        if (_state == State.Open)
        {
            if (DateTime.UtcNow - _openedAt > _timeout)
                _state = State.HalfOpen;
            else
                return await fallback();
        }

        try
        {
            var result = await action();
            OnSuccess();
            return result;
        }
        catch
        {
            OnFailure();
            return await fallback();
        }
    }

    private void OnSuccess()
    {
        _failureCount = 0;
        _state = State.Closed;
    }

    private void OnFailure()
    {
        _failureCount++;
        if (_failureCount >= _threshold)
        {
            _state = State.Open;
            _openedAt = DateTime.UtcNow;
        }
    }
}
```

### Fallback Strategies

| Scenario | Fallback |
|----------|----------|
| Recommendation service down | Return popular/default items |
| Search service down | Show cached results or "try again later" |
| Payment provider down | Queue for retry, notify user of delay |
| Auth service down | Allow cached sessions, block new logins |

---

## Key Distributed Systems Concepts to Know

| Concept | One-liner | When it matters |
|---------|-----------|-----------------|
| CAP Theorem | Can't have Consistency + Availability + Partition tolerance simultaneously | Choosing between CP (banking) and AP (social feeds) |
| Eventual Consistency | All replicas converge given enough time | Acceptable for feeds/analytics, not for inventory counts |
| Idempotency | Same request produces same result regardless of retries | Critical for any write operation |
| Exactly-once delivery | Impossible in theory; approximate with idempotent consumers | Design for at-least-once + deduplication |
| Backpressure | Slow consumers signal producers to reduce rate | Prevents OOM during traffic spikes |
| Consensus | Nodes agree on a value (Raft, Paxos) | Leader election, distributed locks |
| Vector clocks | Track causal ordering across nodes | Conflict resolution in replicated systems |
