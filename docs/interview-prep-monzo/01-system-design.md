# 01 — System Design

System design is the highest-weighted interview for senior roles at fintech companies. You'll be asked to design systems that handle real money, real-time notifications, and millions of concurrent users.

---

## Framework for Answering

Use this structure for every system design question:

```
1. Clarify Requirements (2–3 min)
   → Functional: what does the system DO?
   → Non-functional: scale, latency, consistency, availability

2. Back-of-envelope Estimation (2 min)
   → Users, transactions/sec, storage, bandwidth

3. High-Level Design (10 min)
   → Core components, data flow diagram

4. Deep Dive (15–20 min)
   → Pick 2–3 components to detail
   → Data model, APIs, trade-offs

5. Trade-offs & Extensions (5 min)
   → What breaks at 10x scale?
   → What would you monitor/alert on?
```

---

## Question 1 — Design a Payment System

> "Design a system that allows users to send money to other users instantly."

### Clarifying Questions to Ask
- Domestic only or international?
- What payment rails? (Faster Payments, SEPA, card networks)
- What's the expected TPS (transactions per second)?
- Do we need to support scheduled payments?
- What's the consistency requirement? (Can we ever show wrong balance?)

### Requirements
- **Functional:** Send money P2P, debit sender, credit receiver, transaction history
- **Non-functional:** Strong consistency for balances, <500ms latency, 99.99% availability, idempotent

### Back-of-Envelope
```
- 5M active users
- Average 2 transactions/user/day = 10M tx/day
- Peak: 3x average = ~350 TPS
- Each transaction record: ~500 bytes
- Daily storage: 10M × 500B = 5GB/day
```

### High-Level Architecture

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│  Mobile  │────▶│  API Gateway │────▶│ Payment Service  │
│   App    │     │  (Auth/Rate) │     │  (Orchestrator)  │
└──────────┘     └──────────────┘     └────────┬────────┘
                                               │
                      ┌────────────────────────┼────────────────────┐
                      │                        │                    │
                      ▼                        ▼                    ▼
              ┌──────────────┐      ┌──────────────────┐   ┌──────────────┐
              │   Ledger     │      │  Fraud/Risk      │   │ Notification │
              │   Service    │      │  Engine          │   │   Service    │
              │  (Double-    │      │  (Real-time      │   │  (Push/SMS)  │
              │   entry)     │      │   scoring)       │   │              │
              └──────┬───────┘      └──────────────────┘   └──────────────┘
                     │
                     ▼
              ┌──────────────┐
              │  PostgreSQL  │
              │  (ACID tx)   │
              └──────────────┘
```

### Deep Dive: The Ledger

The core of any payment system is a **double-entry ledger**. Every transaction creates two entries:

```sql
-- Transaction: Alice sends £50 to Bob
BEGIN;
INSERT INTO ledger_entries (account_id, amount, direction, tx_id, created_at)
VALUES
  ('alice_123', 5000, 'DEBIT',  'tx_abc', NOW()),
  ('bob_456',   5000, 'CREDIT', 'tx_abc', NOW());

-- Update balances atomically
UPDATE accounts SET balance = balance - 5000 WHERE id = 'alice_123' AND balance >= 5000;
UPDATE accounts SET balance = balance + 5000 WHERE id = 'bob_456';
COMMIT;
```

**Why double-entry?**
- Every debit has a matching credit — the system is always balanced
- Full audit trail — regulators require this
- Easy reconciliation — sum of all entries should be zero

### Idempotency

Payments must be idempotent — retrying a request must not double-charge:

```csharp
// Client sends an idempotency key with every request
POST /payments
Headers: Idempotency-Key: "user123_payment_2024-01-15_abc"

// Server checks if this key was already processed
var existing = await _db.Payments.FindByIdempotencyKey(key);
if (existing != null) return existing.Result; // return cached response
```

### Key Trade-offs

| Decision | Choice | Why |
|----------|--------|-----|
| Consistency vs Availability | Strong consistency | Wrong balances = regulatory failure |
| Sync vs Async | Sync for debit, async for notifications | User needs immediate confirmation |
| Single DB vs Sharded | Single (partitioned) initially | Simpler consistency; shard later by account |
| SQL vs NoSQL | SQL (PostgreSQL) | ACID transactions are non-negotiable for money |

---

## Question 2 — Design a Real-Time Notification System

> "Design the system that sends push notifications when a user's card is used."

### Requirements
- **Functional:** Instant push notification on card transaction, in-app feed, notification preferences
- **Non-functional:** <3 second delivery, at-least-once delivery, handle 50K notifications/sec at peak

### High-Level Architecture

```
┌────────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────┐
│ Card Processor │────▶│  Event Bus   │────▶│  Notification   │────▶│  APNs /  │
│ (Visa/MC)      │     │  (Kafka)     │     │  Service        │     │  FCM     │
└────────────────┘     └──────────────┘     └────────┬────────┘     └──────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │  User Preferences│
                                            │  + Device Tokens │
                                            │  (Redis/DynamoDB)│
                                            └──────────────────┘
```

### Event Flow

```
1. Card processor sends authorisation event → Kafka topic "card.transactions"
2. Notification service consumes event
3. Looks up user preferences (do they want push for this merchant/amount?)
4. Looks up device tokens
5. Formats message: "💳 £4.50 at Tesco Express"
6. Sends to APNs (iOS) / FCM (Android)
7. Stores in notification feed (for in-app history)
```

### Key Design Decisions

**Why Kafka?**
- Decouples card processing from notification delivery
- Handles burst traffic (Black Friday) via buffering
- Replay capability if notification service goes down
- Multiple consumers (push, email, analytics) from same event

**Handling Failures:**
```
Consumer reads event → attempts delivery → fails
  → Retry with exponential backoff (1s, 2s, 4s, 8s)
  → After 5 retries → dead letter queue
  → Alert on DLQ depth > threshold
```

**At-least-once vs Exactly-once:**
- Push notifications are idempotent from user perspective (seeing "£4.50 at Tesco" twice is annoying but not harmful)
- Use at-least-once delivery — simpler, more reliable
- Deduplicate in the notification feed using transaction ID

---

## Question 3 — Design a Spending Insights / Categorisation System

> "Design a system that categorises transactions and shows users their spending breakdown."

### Requirements
- **Functional:** Auto-categorise transactions (groceries, transport, entertainment), monthly summaries, budget alerts
- **Non-functional:** Categorisation within 5 seconds of transaction, handle recategorisation, 95%+ accuracy

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐
│ Transaction  │────▶│  Kafka       │────▶│  Categorisation   │
│ Created Event│     │              │     │  Service           │
└──────────────┘     └──────────────┘     └────────┬──────────┘
                                                   │
                                    ┌──────────────┼──────────────┐
                                    │              │              │
                                    ▼              ▼              ▼
                            ┌────────────┐ ┌────────────┐ ┌────────────┐
                            │  Merchant  │ │  ML Model  │ │  User      │
                            │  Mapping   │ │  (fallback)│ │  Overrides │
                            │  (lookup)  │ │            │ │  (cache)   │
                            └────────────┘ └────────────┘ └────────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  Spending        │
                                          │  Aggregation     │
                                          │  (pre-computed)  │
                                          └──────────────────┘
```

### Categorisation Strategy (Layered)

```
1. Exact merchant match (MCC code + merchant name) → 80% of transactions
2. MCC code category mapping → 15% of transactions
3. ML model (NLP on merchant name) → 4% of transactions
4. "General" fallback → 1% — user can recategorise
```

### Aggregation Approach

Don't compute spending summaries on-the-fly — pre-aggregate:

```sql
-- Materialised view / background job updates this
CREATE TABLE spending_summary (
    user_id       UUID,
    category      VARCHAR(50),
    month         DATE,        -- first of month
    total_amount  BIGINT,      -- in minor units (pence)
    tx_count      INTEGER,
    updated_at    TIMESTAMP
);

-- Query is instant:
SELECT category, total_amount FROM spending_summary
WHERE user_id = ? AND month = '2024-01-01';
```

### Trade-offs

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Real-time vs batch aggregation | Near real-time (event-driven) | Users expect instant updates after a purchase |
| ML model hosting | Separate service | Can update model without redeploying categorisation service |
| User overrides | Override wins permanently for that merchant+user | Respects user intent, improves personalisation |

---

## Question 4 — Design a Card Freeze/Unfreeze Feature

> "Design the system that lets users instantly freeze and unfreeze their debit card from the app."

### Requirements
- **Functional:** Toggle card status, block all transactions when frozen, instant effect
- **Non-functional:** Freeze must take effect within 1 second, 99.99% availability (safety feature)

### The Challenge

The card processor (Visa/Mastercard) sends authorisation requests. Your system must respond within ~100ms with approve/decline. The freeze status must be checked on every single transaction.

### Architecture

```
┌──────────┐    ┌──────────────┐    ┌─────────────────────┐
│  User    │───▶│  Card API    │───▶│  Card State Store   │
│  App     │    │  Service     │    │  (Redis — primary)  │
└──────────┘    └──────────────┘    │  (Postgres — source │
                                    │   of truth)         │
                                    └──────────┬──────────┘
                                               │
                                               │ read on every auth
                                               ▼
┌────────────────┐    ┌──────────────────────────────────┐
│ Card Network   │───▶│  Authorisation Service            │
│ (Visa/MC)      │    │  1. Check card state (Redis)      │
└────────────────┘    │  2. Check balance                 │
                      │  3. Check fraud rules             │
                      │  4. Approve/Decline               │
                      └──────────────────────────────────┘
```

### Why Redis for Card State?

```
- Auth requests must respond in <100ms
- Redis read: <1ms
- PostgreSQL read: 5–20ms (acceptable but tighter)
- Redis gives headroom for fraud checks + balance check in same request

Write path (freeze/unfreeze):
  1. Write to PostgreSQL (source of truth)
  2. Write to Redis (for fast reads)
  3. If Redis write fails → retry; card is still frozen in Postgres
     (fail-safe: if Redis is down, fall back to Postgres read)
```

### Consistency Concern

What if a user freezes their card but a transaction arrives before Redis is updated?

```
Timeline:
  T=0ms   User taps "Freeze"
  T=5ms   API writes to Postgres (frozen=true)
  T=8ms   API writes to Redis (frozen=true)
  T=6ms   Auth request arrives, reads Redis (frozen=false) ← STALE!

Mitigation:
  - Write Redis BEFORE responding to user (sync)
  - Auth service checks Postgres as fallback if Redis is unavailable
  - Accept tiny window (~3ms) of inconsistency — acceptable trade-off
    vs making freeze take 500ms+ for the user
```

---

## Question 5 — Design a Shared Tab / Bill Splitting Feature

> "Design a feature where users can create a shared tab, add expenses, and settle up."

### Requirements
- **Functional:** Create tab with multiple users, add expenses, calculate who owes whom, settle via in-app payment
- **Non-functional:** Eventual consistency acceptable for tab state, strong consistency for settlements

### Data Model

```sql
CREATE TABLE tabs (
    id          UUID PRIMARY KEY,
    name        VARCHAR(100),
    created_by  UUID REFERENCES users(id),
    status      VARCHAR(20), -- 'active', 'settled', 'archived'
    created_at  TIMESTAMP
);

CREATE TABLE tab_members (
    tab_id      UUID REFERENCES tabs(id),
    user_id     UUID REFERENCES users(id),
    PRIMARY KEY (tab_id, user_id)
);

CREATE TABLE tab_expenses (
    id          UUID PRIMARY KEY,
    tab_id      UUID REFERENCES tabs(id),
    paid_by     UUID REFERENCES users(id),
    amount      BIGINT,          -- in minor units
    description VARCHAR(200),
    split_type  VARCHAR(20),     -- 'equal', 'exact', 'percentage'
    created_at  TIMESTAMP
);

CREATE TABLE expense_splits (
    expense_id  UUID REFERENCES tab_expenses(id),
    user_id     UUID REFERENCES users(id),
    amount      BIGINT,          -- what this user owes for this expense
    PRIMARY KEY (expense_id, user_id)
);
```

### Settlement Algorithm

Minimise the number of payments needed to settle all debts:

```csharp
// Calculate net balance for each member
// Positive = owed money, Negative = owes money
Dictionary<string, long> CalculateNetBalances(Tab tab)
{
    var balances = new Dictionary<string, long>();
    foreach (var member in tab.Members)
        balances[member.Id] = 0;

    foreach (var expense in tab.Expenses)
    {
        balances[expense.PaidBy] += expense.Amount; // they paid
        foreach (var split in expense.Splits)
            balances[split.UserId] -= split.Amount; // they owe
    }
    return balances;
}

// Greedy settlement: match largest creditor with largest debtor
List<Settlement> CalculateSettlements(Dictionary<string, long> balances)
{
    var creditors = new SortedSet<(long amount, string id)>();
    var debtors = new SortedSet<(long amount, string id)>();

    foreach (var (id, balance) in balances)
    {
        if (balance > 0) creditors.Add((balance, id));
        else if (balance < 0) debtors.Add((-balance, id));
    }

    var settlements = new List<Settlement>();
    while (creditors.Count > 0 && debtors.Count > 0)
    {
        var creditor = creditors.Max; creditors.Remove(creditor);
        var debtor = debtors.Max; debtors.Remove(debtor);

        long amount = Math.Min(creditor.amount, debtor.amount);
        settlements.Add(new Settlement(debtor.id, creditor.id, amount));

        if (creditor.amount > amount)
            creditors.Add((creditor.amount - amount, creditor.id));
        if (debtor.amount > amount)
            debtors.Add((debtor.amount - amount, debtor.id));
    }
    return settlements;
}
```

### Trade-offs

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Real-time recalculation vs cached | Cached, recalculate on expense add/remove | Tabs are small (< 20 people), recalc is cheap |
| Settlement via in-app payment | Reuse existing P2P payment infrastructure | No new payment rails needed |
| Consistency model | Eventual for tab state, strong for actual money movement | Tab display can lag slightly; payments cannot |

---

## General Tips for System Design Interviews

1. **Always start with requirements** — don't jump to architecture
2. **State your assumptions** — "I'm assuming 5M users, is that reasonable?"
3. **Draw before you talk** — diagrams communicate faster than words
4. **Name specific technologies** — "I'd use Kafka here because..." not "some message queue"
5. **Discuss trade-offs unprompted** — this is what separates senior from mid
6. **Think about failure modes** — "What happens when this service goes down?"
7. **Consider the human side** — "How would on-call engineers debug this?"
8. **Know your numbers:**
   - Redis read: <1ms
   - Postgres read: 5–20ms
   - Kafka publish: 5–10ms
   - HTTP call (same region): 1–5ms
   - Push notification delivery: 100ms–3s
