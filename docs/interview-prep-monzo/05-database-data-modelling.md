# 05 — Database & Data Modelling

Fintech systems live and die by their data layer. This interview tests whether you can design schemas that are correct, performant, and auditable — because when you're storing money, there's no room for "eventually we'll fix it."

---

## Question 1 — Design the Schema for a Banking Ledger

> "Design the database schema for a double-entry accounting ledger that supports multiple currencies."

### Why Double-Entry?

Every financial movement creates two entries: a debit and a credit. The system is always balanced — the sum of all entries is zero. This is a regulatory requirement and the foundation of financial auditing.

```
Alice sends £50 to Bob:
  DEBIT  Alice's account  -£50
  CREDIT Bob's account    +£50
  Net change to system:     £0  ✓
```

### Schema

```sql
CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    currency        CHAR(3) NOT NULL,          -- ISO 4217: GBP, EUR, USD
    account_type    VARCHAR(20) NOT NULL,       -- 'current', 'savings', 'pot'
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ledger_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL,              -- groups debit + credit together
    account_id      UUID NOT NULL REFERENCES accounts(id),
    amount          BIGINT NOT NULL,            -- minor units (pence); negative = debit
    currency        CHAR(3) NOT NULL,
    direction       VARCHAR(6) NOT NULL,        -- 'DEBIT' or 'CREDIT'
    balance_after   BIGINT NOT NULL,            -- running balance snapshot
    description     VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Denormalised balance for fast reads (updated atomically with ledger entry)
CREATE TABLE account_balances (
    account_id      UUID PRIMARY KEY REFERENCES accounts(id),
    balance         BIGINT NOT NULL DEFAULT 0,  -- current balance in minor units
    currency        CHAR(3) NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_account_time ON ledger_entries (account_id, created_at DESC);
CREATE INDEX idx_ledger_transaction ON ledger_entries (transaction_id);
```

### Why `balance_after` on Each Entry?

```sql
-- Without balance_after: to get balance at any point, you must SUM all entries
SELECT SUM(amount) FROM ledger_entries WHERE account_id = ? AND created_at <= ?;
-- Slow for accounts with millions of entries

-- With balance_after: just find the last entry before that time
SELECT balance_after FROM ledger_entries
WHERE account_id = ? AND created_at <= ?
ORDER BY created_at DESC LIMIT 1;
-- O(1) with index
```

### Atomic Balance Update

```sql
BEGIN;

-- Insert ledger entries
INSERT INTO ledger_entries (transaction_id, account_id, amount, currency, direction, balance_after)
VALUES
  ('tx_123', 'acc_alice', -5000, 'GBP', 'DEBIT',
   (SELECT balance - 5000 FROM account_balances WHERE account_id = 'acc_alice')),
  ('tx_123', 'acc_bob',    5000, 'GBP', 'CREDIT',
   (SELECT balance + 5000 FROM account_balances WHERE account_id = 'acc_bob'));

-- Update balances
UPDATE account_balances SET balance = balance - 5000, updated_at = NOW()
WHERE account_id = 'acc_alice' AND balance >= 5000;  -- prevents overdraft

UPDATE account_balances SET balance = balance + 5000, updated_at = NOW()
WHERE account_id = 'acc_bob';

COMMIT;
```

The `balance >= 5000` check in the UPDATE acts as an application-level constraint — if the balance is insufficient, the UPDATE affects 0 rows and the application rolls back.

---

## Question 2 — Transactions Table Design

> "Design the schema for storing user-facing transactions (the feed they see in the app)."

### Schema

```sql
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES accounts(id),
    amount          BIGINT NOT NULL,            -- signed: negative = outgoing
    currency        CHAR(3) NOT NULL,
    category        VARCHAR(50),                -- 'groceries', 'transport', etc.
    merchant_name   VARCHAR(200),
    merchant_id     UUID REFERENCES merchants(id),
    status          VARCHAR(20) NOT NULL,       -- 'pending', 'settled', 'declined', 'refunded'
    type            VARCHAR(30) NOT NULL,       -- 'card_payment', 'transfer', 'direct_debit'
    reference       VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settled_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE merchants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    mcc_code        VARCHAR(4),                 -- Merchant Category Code
    logo_url        VARCHAR(500),
    category        VARCHAR(50)
);

CREATE INDEX idx_tx_account_time ON transactions (account_id, created_at DESC);
CREATE INDEX idx_tx_status ON transactions (status) WHERE status = 'pending';
```

### Why Separate from Ledger?

```
Ledger entries = source of truth for money movement (internal, auditable)
Transactions   = user-facing view (enriched with merchant data, categories, UI state)
```

They have different lifecycles:
- A transaction starts as `pending` (card authorisation) before money moves
- The ledger entry is only created when the transaction `settles`
- A declined transaction exists in `transactions` but never in the ledger

---

## Question 3 — Indexing Strategy

> "This query is slow. How would you fix it?"

```sql
SELECT * FROM transactions
WHERE account_id = 'acc_123'
  AND created_at BETWEEN '2024-01-01' AND '2024-01-31'
  AND category = 'groceries'
ORDER BY created_at DESC
LIMIT 25;
```

### Analysis

The query filters on three columns and orders by one. The optimal index depends on selectivity:

```sql
-- Option A: Composite index matching the query
CREATE INDEX idx_tx_account_cat_time
ON transactions (account_id, category, created_at DESC);

-- Option B: If category filter is rare, partial index
CREATE INDEX idx_tx_groceries
ON transactions (account_id, created_at DESC)
WHERE category = 'groceries';
```

### Index Selection Rules

| Rule | Explanation |
|------|-------------|
| Equality columns first | `account_id = ?` and `category = ?` go before range columns |
| Range/sort column last | `created_at` is used for both range filter and ORDER BY |
| Consider selectivity | If 90% of queries don't filter by category, a simpler index may be better |
| Partial indexes for hot paths | If you frequently query `status = 'pending'`, index only those rows |

### EXPLAIN Output to Look For

```
✅ Good: "Index Scan using idx_tx_account_cat_time"
❌ Bad:  "Seq Scan on transactions" (full table scan)
❌ Bad:  "Sort" (means the index didn't provide ordering)
```

---

## Question 4 — Handling Soft Deletes vs Hard Deletes

> "A user closes their account. What happens to their data?"

### The Fintech Constraint

You **cannot** hard-delete financial data. Regulations (FCA, PSD2) require retention for 5–7 years. But GDPR requires you to delete personal data on request.

### Solution: Separation of Concerns

```sql
-- User data (can be anonymised)
CREATE TABLE users (
    id              UUID PRIMARY KEY,
    email           VARCHAR(200),       -- can be nulled on deletion
    full_name       VARCHAR(200),       -- can be nulled
    status          VARCHAR(20),        -- 'active', 'closed', 'anonymised'
    closed_at       TIMESTAMPTZ,
    anonymised_at   TIMESTAMPTZ
);

-- Financial data (must be retained)
CREATE TABLE ledger_entries (
    -- ... same as before
    -- account_id still references accounts, but user details are anonymised
);
```

### Anonymisation Strategy

```sql
-- When user requests deletion:
UPDATE users SET
    email = 'anonymised_' || id,
    full_name = 'Account Holder',
    phone = NULL,
    status = 'anonymised',
    anonymised_at = NOW()
WHERE id = ?;

-- Financial records remain intact for regulatory compliance
-- but can no longer be linked to a real person's PII
```

### Trade-off Table

| Approach | Pros | Cons |
|----------|------|------|
| Hard delete | Simple, GDPR-compliant | Breaks audit trail, regulatory violation |
| Soft delete (status flag) | Preserves data, simple queries | PII still exists, storage grows |
| Anonymisation | GDPR + regulatory compliant | Complex, must verify all PII paths |
| Separate PII store | Clean separation | More infrastructure, join complexity |

---

## Question 5 — Scaling the Database

> "Your transactions table has 2 billion rows. Queries are getting slow. What do you do?"

### Strategy 1: Table Partitioning

```sql
-- Partition by time range (most common for financial data)
CREATE TABLE transactions (
    id          UUID NOT NULL,
    account_id  UUID NOT NULL,
    amount      BIGINT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE transactions_2024_01 PARTITION OF transactions
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE transactions_2024_02 PARTITION OF transactions
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

**Why time-based partitioning?**
- Most queries filter by date range (last 30 days, this month)
- Old partitions can be moved to cheaper storage
- Dropping old data = dropping a partition (instant, no vacuum)
- Each partition is smaller → indexes fit in memory

### Strategy 2: Read Replicas

```
Writes → Primary (single node)
Reads  → Replicas (multiple nodes)

Use cases for replicas:
  - Transaction feed (read-heavy, slight lag acceptable)
  - Analytics queries (heavy aggregations)
  - Reporting (end-of-day statements)

NOT suitable for:
  - Balance checks (must read from primary — stale balance = overdraft)
```

### Strategy 3: Sharding by Account

```
Shard key: account_id

Shard 1: accounts A-M
Shard 2: accounts N-Z
(or hash-based: account_id % num_shards)

Pros:
  - All data for one account is co-located
  - Queries by account_id hit one shard

Cons:
  - Cross-account queries (transfers) span shards
  - Rebalancing is painful
  - Hot accounts (merchants) create hot shards
```

### Decision Framework

```
< 100M rows     → Single Postgres, good indexes, done
100M – 1B rows  → Partitioning + read replicas
> 1B rows       → Consider sharding (but exhaust other options first)
```

---

## Question 6 — Optimistic vs Pessimistic Locking

> "Two requests try to debit the same account simultaneously. How do you prevent overdraft?"

### Pessimistic Locking (SELECT FOR UPDATE)

```sql
BEGIN;
SELECT balance FROM account_balances WHERE account_id = ? FOR UPDATE;
-- Row is now locked — other transactions wait
UPDATE account_balances SET balance = balance - 5000 WHERE account_id = ?;
COMMIT;
```

**Pros:** Simple, guaranteed correctness
**Cons:** Blocks concurrent transactions on same account; potential deadlocks

### Optimistic Locking (Version/CAS)

```sql
-- Read current state
SELECT balance, version FROM account_balances WHERE account_id = ?;
-- balance = 10000, version = 42

-- Update only if version hasn't changed
UPDATE account_balances
SET balance = 5000, version = 43
WHERE account_id = ? AND version = 42;

-- If 0 rows affected → someone else modified it → retry
```

**Pros:** No blocking; high throughput for low-contention accounts
**Cons:** Retries under high contention; more complex application logic

### Atomic Conditional Update (Best for Fintech)

```sql
UPDATE account_balances
SET balance = balance - 5000, updated_at = NOW()
WHERE account_id = ? AND balance >= 5000;

-- Check rows affected:
-- 1 row  → success
-- 0 rows → insufficient funds (no lock needed!)
```

**Why this wins:** Single atomic statement, no explicit locking, database handles concurrency. The `WHERE balance >= 5000` acts as a guard clause.

---

## Key Concepts to Know

| Concept | Explanation | Fintech relevance |
|---------|-------------|-------------------|
| ACID | Atomicity, Consistency, Isolation, Durability | Non-negotiable for money |
| WAL (Write-Ahead Log) | Changes written to log before data files | Crash recovery for transactions |
| MVCC | Multi-Version Concurrency Control | How Postgres handles concurrent reads/writes |
| Isolation levels | Read Committed, Repeatable Read, Serializable | Balance reads need at least Read Committed |
| Connection pooling | Reuse DB connections (PgBouncer) | Prevents connection exhaustion under load |
| Vacuum/Autovacuum | Reclaims dead tuples in Postgres | Critical for high-write tables like ledger |

---

## Common Interview Mistakes

1. **Using floats for money** — always use integers in minor units (pence/cents)
2. **No indexes on foreign keys** — Postgres doesn't auto-index FKs
3. **Over-normalising** — sometimes denormalisation (like `balance_after`) is correct
4. **Ignoring time zones** — always use `TIMESTAMPTZ`, store in UTC
5. **Not considering the query patterns first** — design schema around how data is read, not just how it's written
