# 04 — API Design & Distributed Systems

Fintech companies run microservice architectures serving millions of users. This interview tests whether you can design clean APIs and reason about the complexities of distributed systems.

---

## Question 1 — Design a RESTful API for a Banking App

> "Design the API for a mobile banking app's core features: accounts, transactions, and payments."

### Resource Design

```
GET    /accounts                    → List user's accounts
GET    /accounts/{id}               → Get account details + balance
GET    /accounts/{id}/transactions  → List transactions (paginated)
GET    /transactions/{id}           → Get single transaction detail

POST   /payments                    → Initiate a payment
GET    /payments/{id}               → Get payment status
```

### Request/Response Examples

**Initiate Payment:**
```http
POST /v1/payments
Content-Type: application/json
Idempotency-Key: pay_abc123_2024-01-15

{
  "source_account_id": "acc_123",
  "destination": {
    "type": "sort_code_account_number",
    "sort_code": "040004",
    "account_number": "12345678",
    "name": "Jane Smith"
  },
  "amount": {
    "value": 5000,
    "currency": "GBP"
  },
  "reference": "Rent January"
}
```

**Response (202 Accepted — payment is async):**
```json
{
  "id": "pay_xyz789",
  "status": "pending",
  "amount": { "value": 5000, "currency": "GBP" },
  "created_at": "2024-01-15T10:30:00Z",
  "_links": {
    "self": "/v1/payments/pay_xyz789",
    "source_account": "/v1/accounts/acc_123"
  }
}
```

**List Transactions (paginated with cursor):**
```http
GET /v1/accounts/acc_123/transactions?limit=25&since=tx_abc
```
```json
{
  "data": [
    {
      "id": "tx_def456",
      "amount": { "value": -450, "currency": "GBP" },
      "merchant": { "name": "Tesco", "category": "groceries" },
      "created_at": "2024-01-15T09:15:00Z",
      "settled_at": "2024-01-15T14:00:00Z"
    }
  ],
  "pagination": {
    "has_more": true,
    "next_cursor": "tx_def456"
  }
}
```

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Pagination | Cursor-based (not offset) | Stable under concurrent inserts; offset skips/duplicates items |
| Money representation | Integer minor units + currency | Avoids floating-point errors; explicit currency prevents bugs |
| Payment response | 202 Accepted (async) | Payments go through fraud checks, compliance — can't guarantee instant |
| Versioning | URL path (`/v1/`) | Simple, explicit, easy to route at load balancer |
| Idempotency | Client-provided key in header | Prevents duplicate payments on retry |

### Error Response Format

```json
{
  "error": {
    "type": "insufficient_funds",
    "message": "Account acc_123 has insufficient balance for this payment.",
    "params": {
      "available_balance": 3500,
      "requested_amount": 5000
    }
  }
}
```

Consistent error structure lets clients handle errors programmatically.

---

## Question 2 — Idempotency in Distributed Systems

> "How do you ensure a payment isn't processed twice if the client retries?"

### The Problem

```
Client → POST /payments → Server processes → Response lost in transit
Client → POST /payments → Server processes AGAIN → Double charge!
```

### Solution: Idempotency Keys

```
┌────────┐                    ┌─────────────┐         ┌──────────┐
│ Client │─── POST /pay ─────▶│   API       │────────▶│ Idempotency│
│        │   Idempotency-Key  │   Gateway   │         │   Store    │
└────────┘                    └──────┬──────┘         │  (Redis)   │
                                     │                └──────┬─────┘
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
                   │ payment     │      │ response      │
                   │ Store result│      └──────────────┘
                   └─────────────┘
```

### Implementation

```csharp
public async Task<PaymentResult> ProcessPayment(PaymentRequest request, string idempotencyKey)
{
    // Check if already processed
    var cached = await _redis.GetAsync<PaymentResult>($"idem:{idempotencyKey}");
    if (cached != null) return cached;

    // Acquire lock to prevent concurrent processing of same key
    await using var lockHandle = await _redis.AcquireLockAsync(
        $"idem_lock:{idempotencyKey}", TimeSpan.FromSeconds(30));

    // Double-check after acquiring lock
    cached = await _redis.GetAsync<PaymentResult>($"idem:{idempotencyKey}");
    if (cached != null) return cached;

    // Process the payment
    var result = await _paymentService.Execute(request);

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

> "How would you design the communication between services in a banking platform?"

### Synchronous vs Asynchronous

```
Synchronous (HTTP):
  ✅ Simple, immediate response
  ❌ Tight coupling, cascading failures, retry complexity

Asynchronous (Events):
  ✅ Loose coupling, resilience, natural audit trail
  ❌ Eventual consistency, harder to debug, ordering challenges
```

### Event-Driven Architecture for Payments

```
┌──────────────┐     ┌─────────────────────────────────────────────┐
│   Payment    │     │              Kafka / Event Bus               │
│   Service    │────▶│                                             │
└──────────────┘     │  Topic: payment.created                     │
                     │  Topic: payment.completed                   │
                     │  Topic: payment.failed                      │
                     └──────┬──────────┬──────────┬───────────────┘
                            │          │          │
                            ▼          ▼          ▼
                     ┌───────────┐ ┌────────┐ ┌──────────────┐
                     │Notification│ │Analytics│ │ Compliance   │
                     │ Service   │ │ Service│ │ Service      │
                     └───────────┘ └────────┘ └──────────────┘
```

### Event Schema Design

```json
{
  "event_id": "evt_abc123",
  "event_type": "payment.completed",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00.123Z",
  "data": {
    "payment_id": "pay_xyz789",
    "source_account": "acc_123",
    "destination_account": "acc_456",
    "amount": { "value": 5000, "currency": "GBP" },
    "status": "completed"
  },
  "metadata": {
    "correlation_id": "req_abc",
    "source_service": "payment-service"
  }
}
```

### Guarantees and Trade-offs

| Guarantee | How to achieve |
|-----------|---------------|
| At-least-once delivery | Consumer acknowledges after processing; redelivers on failure |
| Ordering | Partition by account_id — all events for one account are ordered |
| Idempotent consumers | Store processed event_ids; skip duplicates |
| Schema evolution | Use a schema registry; add fields (never remove) |

---

## Question 4 — Consistency Patterns

> "How do you maintain consistency across microservices when a payment involves multiple services?"

### The Problem

A payment touches: Balance Service, Ledger Service, Notification Service, Analytics.
If one fails, what happens?

### Pattern 1: Saga (Choreography)

Each service publishes events; the next service reacts. On failure, compensating events undo previous steps.

```
Payment Created → Debit Balance → Record Ledger → Send Notification
                      ↓ (fails)
              Credit Balance Back (compensating action)
```

### Pattern 2: Saga (Orchestration)

A central orchestrator coordinates the steps:

```csharp
public class PaymentSaga
{
    public async Task<PaymentResult> Execute(PaymentRequest request)
    {
        // Step 1: Reserve funds
        var reservation = await _balanceService.Reserve(request.SourceAccount, request.Amount);

        try
        {
            // Step 2: Record in ledger
            await _ledgerService.RecordDebit(request);

            // Step 3: Credit destination
            await _balanceService.Credit(request.DestAccount, request.Amount);

            // Step 4: Confirm reservation
            await _balanceService.ConfirmReservation(reservation.Id);

            return PaymentResult.Success();
        }
        catch (Exception)
        {
            // Compensate: release the reservation
            await _balanceService.ReleaseReservation(reservation.Id);
            return PaymentResult.Failed("Processing error");
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
│  1. UPDATE accounts SET balance = ...   │
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
GET /v1/transactions/123
→ 200 OK
   Sunset: Sat, 01 Jun 2025 00:00:00 GMT
   Deprecation: true
   Link: </v2/transactions/123>; rel="successor-version"
```

Communicate deprecation via headers, documentation, and direct outreach to consumers.

---

## Question 6 — Circuit Breaker Pattern

> "How do you prevent cascading failures when a downstream service is unhealthy?"

### The Problem

```
Payment Service → Fraud Service (down) → timeout → retry → timeout → retry
  → Payment Service thread pool exhausted → ALL payments fail
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

### In Fintech Context

```
Fraud service down?
  → Circuit opens
  → Fallback: approve low-value transactions (<£30), queue high-value for manual review
  → Alert on-call engineer
  → Circuit half-opens after 30s, tests one request
  → If healthy, resume normal flow
```

---

## Key Distributed Systems Concepts to Know

| Concept | One-liner | Fintech relevance |
|---------|-----------|-------------------|
| CAP Theorem | Can't have Consistency + Availability + Partition tolerance simultaneously | Payments need CP; notifications can be AP |
| Eventual Consistency | All replicas converge given enough time | Acceptable for feeds/analytics, not for balances |
| Idempotency | Same request produces same result regardless of retries | Critical for all payment operations |
| Exactly-once delivery | Impossible in theory; approximate with idempotent consumers | Design for at-least-once + deduplication |
| Backpressure | Slow consumers signal producers to reduce rate | Prevents OOM during traffic spikes |
| Consensus | Nodes agree on a value (Raft, Paxos) | Leader election for singleton workers |
