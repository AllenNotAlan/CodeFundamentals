# 06 — System Design Building Blocks

The other system-design chapters are *worked questions*. This one is the **toolkit** — the reusable components and concepts you assemble in any design. Learn these once and you stop re-deriving them per question; you just reach for the right block and justify it.

> **📖 Reading companion — Designing Data-Intensive Applications (DDIA) by Martin Kleppmann.** Each section below points to the DDIA chapter that covers it in depth. This chapter is the interview-sized summary; DDIA is the why-it's-true underneath. Chapter references are to the book's chapters (stable across printings), not page numbers.

---

## How to use this in an interview

Every design question is answered by composing these blocks behind the **clarify → estimate → high-level design → deep dive → trade-offs** framework (see chapter 01). When you say "I'd put a cache here," the interviewer wants to hear *which* caching strategy and *why* — that "why" is what this chapter gives you.

---

## 1. Load Balancing — spreading traffic

A load balancer sits in front of your servers and distributes requests so no single machine is overwhelmed. It also enables horizontal scaling (add more servers) and fault tolerance (route around dead ones via health checks).

- **L4 (transport)** — routes by IP/port; fast, protocol-agnostic.
- **L7 (application)** — routes by HTTP content (path, headers, cookies); enables smart routing, sticky sessions, TLS termination.
- **Algorithms:** round-robin, least-connections, consistent hashing (keeps a key on the same server as the pool changes — crucial for caches).

**Interview tell:** any "handle millions of users / high availability" requirement → put an LB in the diagram and mention health checks + horizontal scaling.

---

## 2. Caching — don't recompute what you can remember

Caching trades memory for latency: store the result of expensive work (a DB query, a computed view) so repeat reads are near-instant.

**Where caches live:** client → CDN → API/in-memory (Redis/Memcached) → database buffer. Each layer closer to the user is faster but staler.

**Write strategies — the part interviewers probe:**
| Strategy | How it works | Trade-off |
|----------|--------------|-----------|
| **Cache-aside** (lazy) | App reads cache; on miss, loads DB and populates cache | Simple, common; first read is slow, risk of stale data |
| **Write-through** | Write to cache *and* DB together | Cache always fresh; slower writes |
| **Write-back** | Write to cache, flush to DB later | Fast writes; risk of data loss on crash |

**Eviction:** LRU (least-recently-used) is the default; also LFU, TTL expiry. (You implemented LRU in the coding track — same idea.)

**The hard problem is invalidation:** stale data. Strategies: short TTLs, event-driven invalidation (publish "user X changed" → evict), or versioned keys.

> **📖 DDIA:** caching is cross-cutting, but the *consistency* consequences (reading stale data) connect to **Ch. 5 (Replication)** and the "reading your own writes" discussion.

---

## 3. Databases — SQL vs NoSQL, and why

**Relational (SQL — Postgres, MySQL):** strong schema, ACID transactions, joins, mature. Default choice when correctness matters (money, orders).

**NoSQL** is a family, pick by access pattern:
- **Key-value** (Redis, DynamoDB) — fast lookups by key; sessions, caches.
- **Document** (MongoDB) — flexible schema; nested objects read together.
- **Wide-column** (Cassandra) — massive write throughput, tunable consistency; time-series, event logs. *(Monzo uses Cassandra heavily.)*
- **Graph** (Neo4j) — relationship-heavy queries.

**Interview tell:** "I'd use PostgreSQL because this needs ACID transactions" or "Cassandra because the write volume is huge and we can tolerate eventual consistency" — naming *and justifying* beats naming alone.

> **📖 DDIA Ch. 2 & 3:** data models (relational vs document vs graph) and the storage engines beneath them (B-trees vs LSM-trees — the reason Cassandra writes so fast).

---

## 4. Replication — copies for availability & read scaling

Keep the same data on multiple nodes so you survive failures and serve more reads.

- **Single-leader (primary/replica):** all writes go to the leader, which streams a **replication log** to followers. Reads can scale across followers. The catch: **replication lag** → a follower may briefly serve stale data ("I updated my profile but it still shows the old one").
- **Multi-leader:** writes accepted at several nodes (multi-region); must resolve write conflicts.
- **Leaderless (Dynamo-style, e.g. Cassandra):** write to several nodes, read from several, use quorums (`R + W > N`) to stay consistent.

**Interview tells:** "99.99% availability" → replication + failover. "Read-heavy" → read replicas. "Multi-region" → multi-leader or leaderless + conflict handling.

> **📖 DDIA Ch. 5 (Replication):** leader/follower logs, replication lag and its anomalies (read-your-writes, monotonic reads), multi-leader conflict resolution, and leaderless quorums. One of the most interview-relevant chapters.

---

## 5. Partitioning (Sharding) — splitting data that won't fit on one node

When data or load exceeds a single machine, split it across nodes.

- **By key range:** contiguous ranges per shard — good for range scans, but risks hot spots (e.g. all recent timestamps on one shard).
- **By hash of key:** spreads load evenly, but kills efficient range queries.
- **Hot-spot mitigation:** add a suffix/prefix to spread a hot key; use consistent hashing so adding a shard moves minimal data.

**The rebalancing problem:** when you add/remove nodes, how much data moves? Consistent hashing minimises it.

**Interview tell:** "storage/throughput exceeds one node" → shard, and immediately address *how you pick the partition key* and *hot spots*.

> **📖 DDIA Ch. 6 (Partitioning):** partitioning strategies, secondary-index partitioning, and rebalancing approaches.

---

## 6. Consistency & the CAP trade-off

In a distributed system, when the network partitions (it will), you choose between **consistency** (every read sees the latest write) and **availability** (every request still gets an answer). You can't have both during a partition — that's **CAP**.

**The spectrum (not a binary):**
- **Strong / linearizable:** reads always see the latest write. Needed for balances, inventory. Costs latency and availability.
- **Eventual:** replicas converge *eventually*; reads may be briefly stale. Fine for likes, feeds, cached profiles.
- **Causal / read-your-writes:** middle grounds that fix the most jarring anomalies without full linearizability.

**Interview tell:** state the requirement explicitly — "balances need strong consistency; the activity feed can be eventually consistent." Senior candidates name the consistency model per component, not for the whole system.

> **📖 DDIA Ch. 7 (Transactions) & Ch. 9 (Consistency and Consensus):** isolation levels, linearizability vs eventual consistency, and why consensus (e.g. Raft) is the foundation under leader election and distributed locks.

### Consensus & quorums — how nodes agree

Strong consistency across replicas rests on **consensus**: getting a set of nodes to agree on a value even when some are slow, crashed, or partitioned. You rarely implement this yourself, but you must know *where it lives* in a design and name it.

- **Consensus algorithms (Raft, Paxos):** elect a single leader and replicate a log so every node applies the same operations in the same order. This is what backs **leader election** (who's the primary?), **distributed locks**, and strongly-consistent metadata stores (etcd, ZooKeeper, Consul). A Raft cluster stays available as long as a **majority** (e.g. 2 of 3, 3 of 5) is reachable.
- **Quorums (leaderless, Dynamo/Cassandra-style):** instead of a leader, require `R + W > N` — reads touch `R` replicas, writes touch `W`, with `N` total. Overlapping read/write sets guarantees a read sees the latest write. Tuning `R`/`W` trades latency against consistency: `W=N` makes writes durable but slow; `W=1` is fast but risky.

**Worked tell — "how does the ledger stay correct across nodes?"**
> "Writes go through a single Raft-elected leader per shard so the replication log is totally ordered — no two nodes disagree on the balance. For reads I can serve followers for the feed (eventually consistent) but route balance checks to the leader or use a quorum read, because a stale balance can cause an overdraft. If the leader dies, Raft elects a new one from an up-to-date follower within a couple of seconds; writes pause briefly rather than risk divergence — a deliberate CP choice."

That paragraph — naming Raft, the ordered log, quorum reads, and the CP trade-off under failover — is the senior-level answer to the consensus probe.

> **📖 DDIA Ch. 9 (Consistency and Consensus):** linearizability, the theory behind quorums, and why total-order broadcast is equivalent to consensus. Ch. 5 covers the leaderless quorum (`R + W > N`) mechanics in practice.

---

## 7. Messaging & Event Streaming — decoupling services

A message broker (queue or log) lets a producer hand off work without waiting for the consumer, absorbing bursts and decoupling services.

- **Queue (RabbitMQ, SQS):** a message is consumed by one worker, then gone. Good for task distribution.
- **Log (Kafka):** messages are an *append-only, replayable* log, partitioned for throughput. Multiple independent consumer groups read the same events; consumers track their own **offset**. Good for event-driven architectures and multiple downstream consumers. *(Monzo runs on Kafka.)*

**Delivery semantics:** at-most-once (may lose), at-least-once (may duplicate — make consumers **idempotent**), exactly-once (hard; usually at-least-once + dedup).

**Patterns worth naming:** the **outbox pattern** (write the event in the same DB transaction as the state change, to avoid "updated DB but failed to publish"), **dead-letter queues** for poison messages, and consumer **backpressure**.

> **📖 DDIA Ch. 11 (Stream Processing):** logs vs queues, consumer offsets, exactly-once semantics, and the outbox/change-data-capture ideas. Pairs with **Ch. 10 (Batch Processing)** for the batch-vs-stream contrast.

---

## 8. Idempotency & Resilience — surviving a messy network

In distributed systems, requests time out, retry, and arrive twice. Design for it:
- **Idempotency keys:** the client sends a unique key; the server stores the result and returns the cached response on retry — so a double-tapped payment charges once. (You saw this in the payment-system design.)
- **Retries with exponential backoff + jitter:** retry transient failures without stampeding a recovering service.
- **Circuit breakers:** stop calling a failing dependency for a cooldown, fail fast, then probe to recover.
- **Timeouts & bulkheads:** never wait forever; isolate resource pools so one slow dependency can't sink everything.

**Interview tell:** the phrase "resilient software" (a Monzo requirement) → idempotency + retries + circuit breakers + DLQ. Say these words.

> **📖 DDIA Ch. 8 (The Trouble with Distributed Systems):** unreliable networks, clocks, and partial failure — *why* all the above machinery is necessary.

---

## 9. Back-of-the-Envelope Estimation — the numbers to know

> 📌 **Canonical latency table** for the whole set. Other chapters cite a short subset for a specific design; this is the full, authoritative list. Treat all figures as order-of-magnitude anchors, not benchmarks.

| Operation | Rough latency |
|-----------|--------------|
| Memory reference | ~100 ns |
| Redis read | < 1 ms |
| SSD random read | ~0.1 ms |
| DB (Postgres) query | 5–20 ms |
| Same-region network round trip | 1–5 ms |
| Cross-continent round trip | ~100–150 ms |

**Method:** users → requests/sec (peak ≈ 2–3× average) → storage (records × size × retention) → bandwidth. State assumptions out loud: "5M users, 2 requests/day each, peak 3× → ~350 req/s."

---

## 10. Observability — how you run it at 3am

Designing the happy path is half the job; interviewers probe "how would on-call debug this when it breaks?" Name the three pillars and what you'd alert on.

- **Metrics (the numbers):** aggregate time-series — request rate, error rate, latency percentiles (p50/p95/p99), queue depth, replication lag. Two useful frameworks: **RED** (Rate, Errors, Duration) for request-driven services; **USE** (Utilisation, Saturation, Errors) for resources. Store in Prometheus/Datadog; graph in dashboards.
- **Logs (the detail):** structured (JSON) events with a **correlation/trace ID** so you can stitch one request across services. Logs are for *why* a specific request failed; don't use them for aggregate counting (that's metrics).
- **Traces (the path):** distributed tracing (OpenTelemetry/Jaeger) follows one request hop-by-hop across services and shows where the latency actually went — indispensable in microservices.

**Alert on symptoms, not causes:** page on user-visible SLO breaches (error rate, p99 latency) and on leading indicators of imminent failure (DLQ depth rising, replication lag growing, disk filling), not on every CPU blip. Over-alerting causes pager fatigue and missed real incidents.

**Interview tell:** the README-level claim "you build it, you run it, you fix it at 3am" is only credible if you can say *what you'd look at first*: "I'd check the service's RED dashboard for the error spike, pull the traces for failing requests by correlation ID, and look at DLQ depth and replication lag to localise the failing dependency." Tie each component in your design to **one metric you'd alert on**.

---

## Putting the blocks together — a mental checklist

For any design, walk the request's journey and name the block at each hop:
1. **Client → LB** (§1): spread load, health checks.
2. **LB → API servers** (stateless, horizontally scalable).
3. **API → Cache** (§2): cache-aside for hot reads; name the invalidation plan.
4. **API → Database** (§3): SQL vs NoSQL *with justification*; replication (§4) for availability, partitioning (§5) at scale.
5. **Async work → Broker** (§7): Kafka/queue for decoupling and bursts; idempotent consumers (§8).
6. **State the consistency model per component** (§6) and the **failure modes** (§8); for strongly-consistent state, name **where consensus lives** (§6 — leader/quorum).
7. **Back it with numbers** (§9).
8. **Say how you'd operate it** (§10): one metric you'd alert on per component, and how on-call would trace a failure.

Say the trade-off at every block — *that* is what reads as senior.

---

## Common Mistakes

- **Jumping to architecture before requirements** — always clarify and estimate first.
- **Naming a technology without justifying it** — "Kafka because we need replayable events and multiple consumers," not just "Kafka."
- **One consistency model for everything** — specify per component.
- **Ignoring failure** — interviewers probe "what happens when this dies?" Have the resilience blocks (§8) and failover/consensus story (§6) ready.
- **No operational story** — "how would you debug this at 3am?" needs the observability answer (§10), not silence.
- **Hand-waving scale** — do the back-of-envelope math (§9), even roughly.

---

## 🔗 Further reading

- **Designing Data-Intensive Applications** — Martin Kleppmann (the definitive deep dive; chapters mapped per section above).
- [System Design Primer (GitHub)](https://github.com/donnemartin/system-design-primer)
- [ByteByteGo](https://bytebytego.com/)
- [Monzo Engineering Blog](https://monzo.com/blog/technology)
