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

Idempotency keys are the answer, and the mechanism is general — see the canonical write-up (problem, Redis-backed store, distributed lock, the implementation, TTL/scope/storage considerations, and the "cache only on success" caveat) in **[generic §Q2 — Idempotency](../interview-prep-generic/04-api-design-distributed-systems.md#question-2--idempotency-in-distributed-systems)**.

### Fintech delta — why this is non-negotiable here

```
Client → POST /payments → Server processes → Response lost in transit
Client → POST /payments → Server processes AGAIN → Double charge! 💸
```

- **The client supplies the key**, not the server (header `Idempotency-Key`), so a retry of *the same user intent* is deduplicated — a fresh "send £50" is a new key.
- **Persist the key with the payment, not just in Redis.** Redis gives the fast path; the durable record in the payments DB is the audit trail regulators expect, and the source of truth if the cache is cold.
- **The hardest version — exactly-once ledger posting under retries** — is covered in [05 — Database & Data Modelling](./05-database-data-modelling.md) (atomic conditional update) and the auth-vs-settlement lifecycle later in this chapter: the idempotency key guards the *request*, but the ledger's atomic guard guards the *money*.

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

The outbox pattern makes "update the DB" and "publish the event" atomic by writing the event into an `outbox` table inside the *same* transaction, then relaying it with a background worker. The mechanism and diagram are in **[generic §Q4 — Outbox Pattern](../interview-prep-generic/04-api-design-distributed-systems.md#question-4--consistency-patterns)**.

**Fintech delta:** this is how you avoid the classic "debited the account but failed to publish `payment.completed`" split-brain. The ledger write *and* the outbox row commit together; if the relay crashes, the event is still in the outbox and gets published on recovery — at-least-once, so the consumer must be idempotent (same key discipline as Q2).

---

## Question 5 — API Versioning & Backward Compatibility

> "How do you evolve APIs without breaking existing clients?"

The strategies (URL vs header vs additive-only), the non-breaking-vs-breaking change rules, and the `Sunset`/`Deprecation` header deprecation flow are general — see **[generic §Q5 — API Versioning](../interview-prep-generic/04-api-design-distributed-systems.md#question-5--api-versioning--backward-compatibility)**.

**Fintech delta:** backward compatibility is heavier here because clients include *other banks, Open Banking TPPs, and long-lived mobile app versions* you can't force-upgrade. Practical consequences:
- Prefer **additive, never-remove** evolution on payment/transaction payloads — a field you drop may be a field a regulator-mandated integration still reads.
- Deprecation windows are long and must be communicated formally (Open Banking has versioned API standards with published sunset dates).
- Money and status enums are especially dangerous to change — adding a new `status` value can break a client that doesn't handle unknowns, so document the "clients must tolerate unknown enum values" contract up front.

---

## Question 6 — Circuit Breaker Pattern

> "How do you prevent cascading failures when a downstream service is unhealthy?"

The problem (thread-pool exhaustion from retrying a dead dependency), the CLOSED → OPEN → HALF-OPEN state machine, and the reference `CircuitBreaker` implementation (plus its thread-safety caveat) are general — see **[generic §Q6 — Circuit Breaker](../interview-prep-generic/04-api-design-distributed-systems.md#question-6--circuit-breaker-pattern)**.

### In Fintech Context

The interesting part is the *fallback policy*, which is domain-specific and risk-laden:

```
Fraud service down?
  → Circuit opens
  → Fallback: approve low-value transactions (<£30), queue high-value for manual review
  → Alert on-call engineer
  → Circuit half-opens after 30s, tests one request
  → If healthy, resume normal flow
```

> ⚠️ **This fallback is a deliberate risk trade-off, not a default.** "Approve low-value when fraud scoring is unavailable" trades a small, bounded fraud-loss exposure for availability (customers can still spend). It's a *business* decision with a risk/compliance owner — in an interview, present it as "one option, and here's the risk," not as obviously correct. The safer stance for higher-risk flows is fail-closed (decline) + queue for review.

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
