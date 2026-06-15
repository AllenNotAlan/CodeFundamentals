# 05 — Database & Data Modelling

The data layer is the foundation of any system. This interview tests whether you can design schemas that are correct, performant, and scalable.

---

## Question 1 — Design the Schema for an E-Commerce Order System

> "Design the database schema for an order management system supporting products, orders, and inventory."

### Schema

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(200) UNIQUE NOT NULL,
    name        VARCHAR(200) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    price       BIGINT NOT NULL,              -- minor units (cents)
    currency    CHAR(3) NOT NULL DEFAULT 'USD',
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory (
    product_id  UUID PRIMARY KEY REFERENCES products(id),
    quantity    INTEGER NOT NULL DEFAULT 0,
    reserved    INTEGER NOT NULL DEFAULT 0,   -- reserved but not yet shipped
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_available CHECK (quantity - reserved >= 0)
);

CREATE TABLE orders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
    total       BIGINT NOT NULL,
    currency    CHAR(3) NOT NULL DEFAULT 'USD',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id),
    product_id  UUID NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL,
    unit_price  BIGINT NOT NULL,              -- price at time of order (snapshot)
    total       BIGINT NOT NULL
);

CREATE INDEX idx_orders_user ON orders (user_id, created_at DESC);
CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_orders_status ON orders (status) WHERE status IN ('pending', 'confirmed');
```

### Key Design Decisions

| Decision | Why |
|----------|-----|
| `unit_price` on order_items | Snapshot the price at order time — product price may change later |
| `reserved` on inventory | Separates "in stock" from "available to sell" — prevents overselling |
| `BIGINT` for money | Never use floats for currency; store in minor units |
| Partial index on status | Most queries filter active orders; don't index delivered/cancelled |

### Atomic Order Placement

```sql
BEGIN;

-- Reserve inventory
UPDATE inventory
SET reserved = reserved + 2
WHERE product_id = 'prod_123'
  AND quantity - reserved >= 2;  -- guard: enough available

-- Check rows affected (application code)
-- If 0 rows → insufficient stock → ROLLBACK

-- Create order
INSERT INTO orders (id, user_id, status, total, currency)
VALUES ('ord_abc', 'user_456', 'pending', 3998, 'USD');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total)
VALUES ('ord_abc', 'prod_123', 2, 1999, 3998);

COMMIT;
```

---

## Question 2 — Audit Trail / Event Log Design

> "Design a schema that tracks all changes to entities for compliance and debugging."

### Why Audit Trails Matter
- Debugging: "What changed and when?"
- Compliance: Regulatory requirements in many industries
- Undo: Ability to reconstruct past state

### Schema

```sql
CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    entity_type     VARCHAR(50) NOT NULL,     -- 'order', 'user', 'product'
    entity_id       UUID NOT NULL,
    action          VARCHAR(20) NOT NULL,     -- 'created', 'updated', 'deleted'
    changed_fields  JSONB,                    -- {"status": {"old": "pending", "new": "shipped"}}
    actor_id        UUID,                     -- who made the change (null for system)
    actor_type      VARCHAR(20),              -- 'user', 'admin', 'system'
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id, timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_log (actor_id, timestamp DESC);
```

### Usage Pattern

```csharp
public async Task UpdateOrderStatus(Guid orderId, string newStatus, Guid actorId)
{
    var order = await _db.Orders.FindAsync(orderId);
    var oldStatus = order.Status;

    order.Status = newStatus;
    order.UpdatedAt = DateTime.UtcNow;

    _db.AuditLog.Add(new AuditEntry
    {
        EntityType = "order",
        EntityId = orderId,
        Action = "updated",
        ChangedFields = JsonSerializer.Serialize(new {
            status = new { old = oldStatus, @new = newStatus }
        }),
        ActorId = actorId,
        ActorType = "user"
    });

    await _db.SaveChangesAsync(); // single transaction
}
```

### Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| Audit table (above) | Simple, queryable, single DB | Table grows fast; needs archival strategy |
| Event sourcing | Complete history, replay capability | Complex, requires CQRS, steep learning curve |
| CDC (Change Data Capture) | No application changes needed | Infrastructure overhead (Debezium/Kafka) |
| Trigger-based | Automatic, can't be bypassed | Hard to maintain, performance impact |

---

## Question 3 — Indexing Strategy

> "This query is slow. How would you fix it?"

```sql
SELECT * FROM orders
WHERE user_id = 'user_123'
  AND status = 'shipped'
  AND created_at BETWEEN '2024-01-01' AND '2024-01-31'
ORDER BY created_at DESC
LIMIT 25;
```

### Analysis

The query filters on three columns and orders by one. The optimal index depends on selectivity:

```sql
-- Option A: Composite index matching the query
CREATE INDEX idx_orders_user_status_time
ON orders (user_id, status, created_at DESC);

-- Option B: If status filter is rare, partial index
CREATE INDEX idx_orders_shipped
ON orders (user_id, created_at DESC)
WHERE status = 'shipped';
```

### Index Selection Rules

| Rule | Explanation |
|------|-------------|
| Equality columns first | `user_id = ?` and `status = ?` go before range columns |
| Range/sort column last | `created_at` is used for both range filter and ORDER BY |
| Consider selectivity | High-cardinality columns (user_id) are more selective |
| Partial indexes for hot paths | If you frequently query one status, index only those rows |

### EXPLAIN Output to Look For

```
✅ Good: "Index Scan using idx_orders_user_status_time"
❌ Bad:  "Seq Scan on orders" (full table scan)
❌ Bad:  "Sort" (means the index didn't provide ordering)
```

### Index Anti-Patterns

```
❌ Indexing every column individually (wastes space, slows writes)
❌ Indexing low-cardinality columns alone (e.g., boolean `is_active`)
❌ Not indexing foreign keys (Postgres doesn't auto-index FKs)
❌ Over-indexing write-heavy tables (each index slows INSERT/UPDATE)
```

---

## Question 4 — Handling Soft Deletes

> "A user deletes their account. What happens to their data?"

### Options

```sql
-- Option 1: Soft delete with flag
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;

-- All queries must filter:
SELECT * FROM users WHERE deleted_at IS NULL;

-- Option 2: Separate archive table
INSERT INTO users_archive SELECT * FROM users WHERE id = ?;
DELETE FROM users WHERE id = ?;

-- Option 3: Status field (most flexible)
UPDATE users SET status = 'deleted', deleted_at = NOW() WHERE id = ?;
```

### Considerations

| Concern | Solution |
|---------|----------|
| Queries accidentally include deleted rows | Default scope / view: `CREATE VIEW active_users AS SELECT * FROM users WHERE deleted_at IS NULL` |
| Unique constraints on deleted records | Partial unique index: `CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL` |
| GDPR / data retention | Anonymise PII but keep structural data for referential integrity |
| Performance (table bloat) | Partition by status or archive old soft-deleted records periodically |

### GDPR Anonymisation

```sql
-- Anonymise PII while preserving referential integrity
UPDATE users SET
    email = 'deleted_' || id || '@removed.invalid',
    name = 'Deleted User',
    phone = NULL,
    status = 'anonymised',
    deleted_at = NOW()
WHERE id = ?;

-- Orders, audit logs, etc. still reference user_id but can't identify the person
```

---

## Question 5 — Scaling the Database

> "Your orders table has 500 million rows. Queries are getting slow. What do you do?"

### Strategy 1: Table Partitioning

```sql
-- Partition by time range
CREATE TABLE orders (
    id          UUID NOT NULL,
    user_id     UUID NOT NULL,
    status      VARCHAR(20) NOT NULL,
    total       BIGINT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024_q1 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE orders_2024_q2 PARTITION OF orders
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
```

**Why time-based partitioning?**
- Most queries filter by date range (recent orders)
- Old partitions can be moved to cheaper storage or archived
- Dropping old data = dropping a partition (instant, no vacuum)
- Each partition is smaller → indexes fit in memory

### Strategy 2: Read Replicas

```
Writes → Primary (single node)
Reads  → Replicas (multiple nodes)

Good for:
  - Order history (read-heavy, slight lag acceptable)
  - Analytics / reporting queries
  - Search and listing pages

NOT suitable for:
  - Inventory checks (stale read = overselling)
  - Order placement (must read-your-writes)
```

### Strategy 3: Sharding

```
Shard key: user_id

Shard 1: users A-M (hash-based is more common: user_id % num_shards)
Shard 2: users N-Z

Pros:
  - All data for one user is co-located
  - Queries by user_id hit one shard
  - Horizontal scaling

Cons:
  - Cross-user queries (admin dashboards) span shards
  - Rebalancing is painful
  - Joins across shards are expensive or impossible
```

### Decision Framework

```
< 50M rows      → Single Postgres, good indexes, done
50M – 500M rows → Partitioning + read replicas
> 500M rows     → Consider sharding (but exhaust other options first)
```

---

## Question 6 — Optimistic vs Pessimistic Locking

> "Two requests try to buy the last item in stock simultaneously. How do you prevent overselling?"

### Pessimistic Locking (SELECT FOR UPDATE)

```sql
BEGIN;
SELECT quantity, reserved FROM inventory WHERE product_id = ? FOR UPDATE;
-- Row is now locked — other transactions wait
UPDATE inventory SET reserved = reserved + 1 WHERE product_id = ?;
COMMIT;
```

**Pros:** Simple, guaranteed correctness
**Cons:** Blocks concurrent transactions on same row; potential deadlocks

### Optimistic Locking (Version/CAS)

```sql
-- Read current state
SELECT quantity, reserved, version FROM inventory WHERE product_id = ?;
-- quantity=10, reserved=8, version=42

-- Update only if version hasn't changed
UPDATE inventory
SET reserved = 9, version = 43
WHERE product_id = ? AND version = 42;

-- If 0 rows affected → someone else modified it → retry
```

**Pros:** No blocking; high throughput for low-contention items
**Cons:** Retries under high contention; more complex application logic

### Atomic Conditional Update (Best for Most Cases)

```sql
UPDATE inventory
SET reserved = reserved + 1, updated_at = NOW()
WHERE product_id = ? AND quantity - reserved >= 1;

-- Check rows affected:
-- 1 row  → success (item reserved)
-- 0 rows → out of stock (no lock needed!)
```

**Why this wins:** Single atomic statement, no explicit locking, database handles concurrency. The `WHERE quantity - reserved >= 1` acts as a guard clause.

---

## Key Concepts to Know

| Concept | Explanation | When it matters |
|---------|-------------|-----------------|
| ACID | Atomicity, Consistency, Isolation, Durability | Any multi-step write operation |
| WAL (Write-Ahead Log) | Changes written to log before data files | Crash recovery, replication |
| MVCC | Multi-Version Concurrency Control | How Postgres handles concurrent reads/writes |
| Isolation levels | Read Committed, Repeatable Read, Serializable | Preventing phantom reads, dirty reads |
| Connection pooling | Reuse DB connections (PgBouncer) | Prevents connection exhaustion under load |
| N+1 query problem | Fetching related data in a loop | Use JOINs or batch loading instead |
| Denormalisation | Duplicate data for read performance | Acceptable when reads >> writes |

---

## Common Interview Mistakes

1. **Using floats for money** — always use integers in minor units
2. **No indexes on foreign keys** — Postgres doesn't auto-index FKs
3. **Over-normalising** — sometimes denormalisation is the correct trade-off
4. **Ignoring time zones** — always use `TIMESTAMPTZ`, store in UTC
5. **Not considering query patterns first** — design schema around how data is read, not just how it's written
6. **Forgetting about data growth** — "it works with 1000 rows" doesn't mean it works with 100M
