# 01 — System Design

System design is the highest-weighted interview for senior roles. You'll be asked to design systems that handle millions of users, high throughput, and complex data flows.

---

## Framework for Answering

Use this structure for every system design question:

```
1. Clarify Requirements (2–3 min)
   → Functional: what does the system DO?
   → Non-functional: scale, latency, consistency, availability

2. Back-of-envelope Estimation (2 min)
   → Users, requests/sec, storage, bandwidth

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

## Question 1 — Design a URL Shortener

> "Design a service like bit.ly that shortens URLs and redirects users."

### Clarifying Questions to Ask
- What's the expected volume of URLs created per day?
- What's the read:write ratio?
- Do short URLs expire?
- Do we need analytics (click counts, referrers)?

### Requirements
- **Functional:** Create short URL, redirect to original, optional analytics
- **Non-functional:** Low latency redirects (<50ms), high availability, 100:1 read:write ratio

### Back-of-Envelope
```
- 100M URLs created/month
- 10B redirects/month (100:1 ratio)
- ~3,800 writes/sec, ~380,000 reads/sec at peak
- Each URL record: ~500 bytes
- Storage: 100M × 500B × 12 months = 600GB/year
```

### High-Level Architecture

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│  Client  │────▶│  API Gateway │────▶│  URL Service     │
│          │     │  (Rate limit)│     │                  │
└──────────┘     └──────────────┘     └────────┬────────┘
                                               │
                      ┌────────────────────────┼────────────────┐
                      │                        │                │
                      ▼                        ▼                ▼
              ┌──────────────┐      ┌──────────────┐    ┌──────────────┐
              │   Cache      │      │  Database    │    │  Analytics   │
              │   (Redis)    │      │  (Postgres)  │    │  (Kafka →    │
              │              │      │              │    │   ClickHouse)│
              └──────────────┘      └──────────────┘    └──────────────┘
```

### Key Design Decisions

**Short URL Generation:**
```csharp
// Option 1: Base62 encoding of auto-increment ID
string Encode(long id)
{
    const string chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var sb = new StringBuilder();
    while (id > 0)
    {
        sb.Insert(0, chars[(int)(id % 62)]);
        id /= 62;
    }
    return sb.ToString();
}
// 7 chars = 62^7 = 3.5 trillion unique URLs

// Option 2: Hash-based (MD5/SHA → take first 7 chars)
// Pro: No coordination needed. Con: Collisions possible.
```

**Read Path (optimised for speed):**
```
1. Client requests GET /abc1234
2. Check Redis cache → hit? Return 301 redirect
3. Cache miss → query Postgres → cache result → return 301
4. Async: publish click event to Kafka for analytics
```

### Trade-offs

| Decision | Choice | Why |
|----------|--------|-----|
| 301 vs 302 redirect | 301 (permanent) | Browsers cache it; reduces load. Use 302 if analytics matter more |
| ID generation | Distributed ID generator (Snowflake) | Avoids single-point-of-failure of auto-increment |
| Cache eviction | LRU with TTL | Most URLs follow power-law distribution (few get most traffic) |
| Database | Postgres | Simple key-value lookup; could also use DynamoDB for scale |

---

## Question 2 — Design a Notification System

> "Design a system that sends push notifications, emails, and SMS to users."

### Requirements
- **Functional:** Multi-channel delivery (push, email, SMS), user preferences, templating, scheduling
- **Non-functional:** At-least-once delivery, <5 second push latency, handle 100K notifications/sec at peak

### High-Level Architecture

```
┌────────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│ Trigger Source │────▶│  Event Bus   │────▶│  Notification   │────▶│  Delivery    │
│ (any service)  │     │  (Kafka)     │     │  Orchestrator   │     │  Workers     │
└────────────────┘     └──────────────┘     └────────┬────────┘     └──────┬───────┘
                                                     │                     │
                                                     ▼                     ▼
                                            ┌──────────────────┐   ┌──────────────┐
                                            │  User Preferences│   │  APNs / FCM  │
                                            │  + Templates     │   │  SendGrid    │
                                            │  (DB/Cache)      │   │  Twilio      │
                                            └──────────────────┘   └──────────────┘
```

### Event Flow

```
1. Service publishes event (e.g., "order.shipped") → Kafka
2. Notification orchestrator consumes event
3. Looks up user preferences (which channels? quiet hours?)
4. Renders template with event data
5. Routes to appropriate delivery worker (push/email/SMS)
6. Worker delivers via third-party provider
7. Stores delivery status for audit/retry
```

### Key Design Decisions

**Why Kafka?**
- Decouples producers from notification logic
- Handles burst traffic via buffering
- Replay capability if notification service goes down
- Multiple consumers from same event stream

**Handling Failures:**
```
Worker attempts delivery → fails
  → Retry with exponential backoff (1s, 2s, 4s, 8s, 16s)
  → After 5 retries → dead letter queue (DLQ)
  → Alert on DLQ depth > threshold
  → Manual review / batch retry
```

**Priority Queues:**
```
High priority:   Security alerts, OTP codes     → dedicated workers, no batching
Medium priority: Order updates, shipping         → standard workers
Low priority:    Marketing, weekly digests       → batch processing, respect quiet hours
```

---

## Question 3 — Design a Rate Limiter

> "Design a distributed rate limiter that protects your API from abuse."

### Requirements
- **Functional:** Limit requests per user/IP per time window, configurable per endpoint
- **Non-functional:** <1ms overhead per request, distributed (works across multiple API servers)

### Algorithms Compared

| Algorithm | Pros | Cons |
|-----------|------|------|
| Fixed window | Simple, low memory | Burst at window boundary (2x allowed) |
| Sliding window log | Precise | High memory (stores every timestamp) |
| Sliding window counter | Good balance | Slight approximation |
| Token bucket | Smooth, allows bursts | Slightly more complex |
| Leaky bucket | Constant output rate | Doesn't allow legitimate bursts |

### Token Bucket Implementation (Redis)

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐
│ Request │────▶│  Rate Limit  │────▶│   Redis     │
│         │     │  Middleware  │     │  (tokens)   │
└─────────┘     └──────┬───────┘     └─────────────┘
                       │
                ┌──────▼───────┐
                │ Tokens > 0?  │
                │ Yes → allow  │
                │ No  → 429    │
                └──────────────┘
```

```csharp
public class TokenBucketRateLimiter
{
    private readonly IDatabase _redis;
    private readonly int _maxTokens;
    private readonly int _refillRate; // tokens per second

    public async Task<bool> IsAllowed(string key)
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var script = @"
            local key = KEYS[1]
            local max_tokens = tonumber(ARGV[1])
            local refill_rate = tonumber(ARGV[2])
            local now = tonumber(ARGV[3])

            local data = redis.call('HMGET', key, 'tokens', 'last_refill')
            local tokens = tonumber(data[1]) or max_tokens
            local last_refill = tonumber(data[2]) or now

            -- Refill tokens based on elapsed time
            local elapsed = (now - last_refill) / 1000.0
            tokens = math.min(max_tokens, tokens + elapsed * refill_rate)

            if tokens >= 1 then
                tokens = tokens - 1
                redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
                redis.call('EXPIRE', key, max_tokens / refill_rate * 2)
                return 1
            else
                redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
                return 0
            end
        ";
        var result = await _redis.ScriptEvaluateAsync(script,
            new RedisKey[] { $"ratelimit:{key}" },
            new RedisValue[] { _maxTokens, _refillRate, now });
        return (int)result == 1;
    }
}
```

### Trade-offs

| Decision | Choice | Why |
|----------|--------|-----|
| Where to limit | API gateway layer | Single enforcement point; services don't need to implement |
| Storage | Redis | Sub-millisecond reads; atomic operations via Lua scripts |
| Granularity | Per-user + per-endpoint | Prevents one endpoint from consuming another's budget |
| Response on limit | 429 + Retry-After header | Client knows when to retry |

---

## Question 4 — Design a Chat System

> "Design a real-time messaging system supporting 1:1 and group chats."

### Requirements
- **Functional:** Send/receive messages in real-time, message history, read receipts, online status
- **Non-functional:** <200ms message delivery, message ordering, offline message delivery

### High-Level Architecture

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│  Client  │◀═══▶│  WebSocket   │────▶│  Chat Service   │
│  (App)   │     │  Gateway     │     │                 │
└──────────┘     └──────────────┘     └────────┬────────┘
                                               │
                      ┌────────────────────────┼────────────────┐
                      │                        │                │
                      ▼                        ▼                ▼
              ┌──────────────┐      ┌──────────────┐    ┌──────────────┐
              │  Message     │      │  Presence    │    │  Push        │
              │  Store       │      │  Service     │    │  Service     │
              │  (Cassandra) │      │  (Redis)     │    │  (offline)   │
              └──────────────┘      └──────────────┘    └──────────────┘
```

### Message Flow

```
1. Alice sends message via WebSocket connection
2. WebSocket gateway routes to Chat Service
3. Chat Service:
   a. Persists message to Cassandra
   b. Checks if Bob is online (Presence Service / Redis)
   c. If online → route to Bob's WebSocket gateway → deliver
   d. If offline → queue for push notification
4. Bob's client acknowledges receipt → update delivery status
```

### Data Model (Cassandra — optimised for chat reads)

```sql
-- Messages partitioned by conversation, ordered by time
CREATE TABLE messages (
    conversation_id UUID,
    message_id      TIMEUUID,
    sender_id       UUID,
    content         TEXT,
    message_type    TEXT,       -- 'text', 'image', 'file'
    created_at      TIMESTAMP,
    PRIMARY KEY (conversation_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

-- User's conversation list
CREATE TABLE user_conversations (
    user_id             UUID,
    last_message_at     TIMESTAMP,
    conversation_id     UUID,
    last_message_preview TEXT,
    unread_count        INT,
    PRIMARY KEY (user_id, last_message_at)
) WITH CLUSTERING ORDER BY (last_message_at DESC);
```

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Protocol | WebSocket (with HTTP fallback) | Bidirectional, low latency, persistent connection |
| Message store | Cassandra | Write-heavy, time-series data, horizontal scaling |
| Presence | Redis with TTL | Fast pub/sub, automatic expiry for stale sessions |
| Message ordering | Server-assigned timestamps (TIMEUUID) | Client clocks can't be trusted |
| Group messages | Fan-out on write (small groups) / fan-out on read (large channels) | Trade-off between write amplification and read latency |

---

## Question 5 — Design a Task Queue / Job Scheduler

> "Design a system that executes background jobs reliably — retries on failure, supports scheduling, and scales horizontally."

### Requirements
- **Functional:** Submit jobs, execute asynchronously, retry on failure, schedule for future, priority levels
- **Non-functional:** At-least-once execution, horizontal scaling, job deduplication

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Producers   │────▶│  Job Queue   │────▶│  Workers        │
│  (any svc)   │     │  (Redis/SQS) │     │  (auto-scaling) │
└──────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  Job State Store │
                                          │  (Postgres)      │
                                          └──────────────────┘
```

### Job Lifecycle

```
PENDING → RUNNING → COMPLETED
                  → FAILED → RETRY (back to PENDING with delay)
                           → DEAD (max retries exceeded)
```

### Implementation

```csharp
public class Job
{
    public string Id { get; set; }
    public string Type { get; set; }
    public string Payload { get; set; }       // JSON
    public int Priority { get; set; }
    public int Attempts { get; set; }
    public int MaxRetries { get; set; } = 3;
    public DateTime? ScheduledAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public string Status { get; set; }        // pending, running, completed, failed, dead
}

public class Worker
{
    public async Task ProcessLoop(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            var job = await _queue.Dequeue(timeout: TimeSpan.FromSeconds(5));
            if (job == null) continue;

            try
            {
                job.Status = "running";
                job.StartedAt = DateTime.UtcNow;
                job.Attempts++;
                await _store.Update(job);

                await ExecuteJob(job);

                job.Status = "completed";
                await _store.Update(job);
            }
            catch (Exception ex)
            {
                if (job.Attempts >= job.MaxRetries)
                    job.Status = "dead";
                else
                {
                    job.Status = "pending";
                    job.ScheduledAt = DateTime.UtcNow.Add(GetBackoff(job.Attempts));
                    await _queue.Enqueue(job, job.ScheduledAt);
                }
                await _store.Update(job);
            }
        }
    }

    private TimeSpan GetBackoff(int attempt) =>
        TimeSpan.FromSeconds(Math.Pow(2, attempt)); // 2s, 4s, 8s, 16s
}
```

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Queue backend | Redis (ZSET for delayed jobs) or SQS | Redis for low latency; SQS for managed durability |
| Visibility timeout | Lock job for 5 min while processing | Prevents duplicate execution if worker crashes |
| Deduplication | Unique job ID; reject if already exists | Prevents duplicate work from retried submissions |
| Scaling | Workers auto-scale based on queue depth | Cost-efficient; handles traffic spikes |

---

## General Tips for System Design Interviews

1. **Always start with requirements** — don't jump to architecture
2. **State your assumptions** — "I'm assuming 10M users, is that reasonable?"
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
   - Cross-region: 50–150ms
   - SSD random read: 0.1ms
   - HDD random read: 10ms
