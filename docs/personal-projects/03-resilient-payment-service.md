# Project 3 — Resilient Payment Service

> **Gap addressed:** No resilience patterns implemented
> **Timeline:** Weeks 5–7 (15–18 hours total)
> **Outcome:** A payment service in Go with circuit breakers, retries with backoff, idempotency, and timeout handling

---

## 🎯 Why This Project

Monzo explicitly looks for engineers "interested in distributed systems and writing resilient software." This project proves you've actually *built* resilience patterns, not just read about them.

In a real payment system:
- External payment providers go down — you need circuit breakers
- Network calls fail transiently — you need retries with backoff
- Users double-tap "Pay" — you need idempotency
- Downstream services hang — you need timeouts and bulkheads

---

## 📋 What You'll Build

A payment service that:
1. Accepts payment requests via REST API
2. Calls a (simulated) external payment provider
3. Handles failures gracefully with circuit breakers
4. Retries transient failures with exponential backoff
5. Guarantees idempotency — same request never processed twice
6. Publishes payment events to Kafka (connects to Project 2)

---

## 🏗️ Architecture

```
┌──────────┐     ┌─────────────────────────────────────────────────────────┐
│  Client  │     │              Resilient Payment Service                    │
│          │     │                                                           │
│          │────▶│  ┌────────────┐   ┌──────────────────────────────────┐  │
│          │     │  │  Idempotency│   │         Payment Handler          │  │
│          │     │  │  Middleware │──▶│                                  │  │
│          │     │  │  (Redis)   │   │  ┌────────────┐  ┌───────────┐  │  │
│          │     │  └────────────┘   │  │   Retry    │  │  Circuit  │  │  │
│          │     │                    │  │   Layer    │──▶│  Breaker  │  │  │
│          │     │                    │  │  (exp.    │  │  (sony/   │  │  │
│          │     │                    │  │  backoff)  │  │  gobreaker)│  │  │
│          │     │                    │  └────────────┘  └─────┬─────┘  │  │
│          │     │                    │                         │        │  │
│          │     │                    └─────────────────────────┼────────┘  │
│          │     │                                              │           │
│          │     └──────────────────────────────────────────────┼───────────┘
│          │                                                    │
└──────────┘                                                    ▼
                                                    ┌──────────────────────┐
                                                    │  External Payment    │
                                                    │  Provider (simulated)│
                                                    │  - Random failures   │
                                                    │  - Random latency    │
                                                    └──────────────────────┘
```

---

## 📁 Project Structure

```
resilient-payment-service/
├── cmd/
│   ├── server/
│   │   └── main.go                  # Payment service entry point
│   └── fake-provider/
│       └── main.go                  # Simulated unreliable payment provider
├── internal/
│   ├── handler/
│   │   └── payment.go              # HTTP handlers
│   ├── service/
│   │   └── payment.go              # Payment orchestration logic
│   ├── resilience/
│   │   ├── circuitbreaker.go       # Circuit breaker wrapper
│   │   ├── retry.go                # Retry with exponential backoff
│   │   └── timeout.go              # Context-based timeouts
│   ├── idempotency/
│   │   ├── middleware.go           # Idempotency-Key middleware
│   │   └── store.go               # Redis-backed idempotency store
│   ├── provider/
│   │   └── client.go              # External provider HTTP client
│   └── model/
│       └── payment.go             # Payment domain types
├── docker-compose.yml
├── Makefile
├── go.mod
└── README.md
```

---

## 🛠️ Tech Stack & Libraries

| Library | Purpose | Link |
|---------|---------|------|
| `sony/gobreaker` | Circuit breaker | https://github.com/sony/gobreaker |
| `cenkalti/backoff` | Exponential backoff | https://github.com/cenkalti/backoff |
| `redis/go-redis` | Redis client (idempotency store) | https://github.com/redis/go-redis |
| `go-chi/chi` | HTTP router | https://github.com/go-chi/chi |
| `segmentio/kafka-go` | Event publishing | https://github.com/segmentio/kafka-go |
| `rs/zerolog` | Structured logging | https://github.com/rs/zerolog |


---

## 📖 Resilience Patterns Explained

### Pattern 1: Circuit Breaker

```
┌─────────────────────────────────────────────────────────────┐
│                    Circuit Breaker States                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌────────┐    failures > threshold    ┌────────┐          │
│   │ CLOSED │ ─────────────────────────▶ │  OPEN  │          │
│   │(normal)│                            │(reject)│          │
│   └────┬───┘                            └────┬───┘          │
│        ▲                                     │               │
│        │         timeout expires             ▼               │
│        │                              ┌────────────┐        │
│        │         success              │ HALF-OPEN  │        │
│        └──────────────────────────────│  (probe)   │        │
│                                       └────────────┘        │
│                                              │               │
│                    failure                    │               │
│              ┌───────────────────────────────┘               │
│              ▼                                               │
│         Back to OPEN                                         │
│                                                               │
│  CLOSED:    All requests pass through normally               │
│  OPEN:      All requests fail immediately (fast-fail)        │
│  HALF-OPEN: One test request allowed through                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**When to use:** Calling external services that might be down. Prevents cascading failures and gives the downstream service time to recover.

### Pattern 2: Retry with Exponential Backoff

```
Attempt 1: immediate
Attempt 2: wait 100ms
Attempt 3: wait 200ms
Attempt 4: wait 400ms
Attempt 5: wait 800ms (give up after this)

With jitter (randomness to prevent thundering herd):
Attempt 2: wait 100ms ± 50ms
Attempt 3: wait 200ms ± 100ms
...
```

**When to use:** Transient failures (network blips, 503s, timeouts). NOT for 4xx errors (those won't fix themselves).

### Pattern 3: Idempotency

```
Request 1: POST /payments  Idempotency-Key: pay_abc123
  → Process payment → Store result with key → Return 201

Request 2: POST /payments  Idempotency-Key: pay_abc123  (duplicate!)
  → Check Redis: key exists → Return stored result → Return 200 (not 201)
  → Payment NOT processed again

Timeline:
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │Request 1│     │Request 2│     │Request 3│
  │key: abc │     │key: abc │     │key: def │
  └────┬────┘     └────┬────┘     └────┬────┘
       │               │               │
       ▼               ▼               ▼
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │ Process │     │  Return  │     │ Process │
  │ payment │     │  cached  │     │ payment │
  │  (new)  │     │  result  │     │  (new)  │
  └─────────┘     └─────────┘     └─────────┘
```

**When to use:** Any non-idempotent operation (payments, transfers, account creation). The client generates the key and sends it with the request.

### Pattern 4: Timeouts & Context Cancellation

```go
// Without timeout: request hangs forever if provider is slow
resp, err := http.Get("http://provider/charge")

// With timeout: fails fast after 5 seconds
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
req, _ := http.NewRequestWithContext(ctx, "GET", "http://provider/charge", nil)
resp, err := http.DefaultClient.Do(req)
```

**When to use:** Every external call. Always. No exceptions.


---

## 🔨 Implementation Steps

### Phase 1: Fake Payment Provider (Day 1)

Build an unreliable HTTP server that simulates a real payment provider:

```go
// cmd/fake-provider/main.go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "math/rand"
    "net/http"
    "time"
)

func main() {
    http.HandleFunc("/charge", func(w http.ResponseWriter, r *http.Request) {
        // Simulate random latency (50ms–3s)
        delay := time.Duration(50+rand.Intn(2950)) * time.Millisecond
        time.Sleep(delay)

        // Simulate failures (30% of requests fail)
        roll := rand.Float64()
        switch {
        case roll < 0.15:
            // Timeout (no response)
            time.Sleep(30 * time.Second)
            return
        case roll < 0.25:
            // 500 Internal Server Error
            http.Error(w, `{"error": "internal error"}`, http.StatusInternalServerError)
            return
        case roll < 0.30:
            // 503 Service Unavailable
            http.Error(w, `{"error": "service unavailable"}`, http.StatusServiceUnavailable)
            return
        }

        // Success (70% of requests)
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{
            "charge_id": fmt.Sprintf("ch_%d", rand.Int63()),
            "status":    "succeeded",
            "processed": time.Now().UTC(),
        })
    })

    fmt.Println("Fake payment provider on :9090 (30% failure rate)")
    log.Fatal(http.ListenAndServe(":9090", nil))
}
```

### Phase 2: Circuit Breaker Implementation (Days 2–3)

```go
// internal/resilience/circuitbreaker.go
package resilience

import (
    "fmt"
    "time"

    "github.com/sony/gobreaker/v2"
    "github.com/rs/zerolog/log"
)

func NewCircuitBreaker(name string) *gobreaker.CircuitBreaker[[]byte] {
    settings := gobreaker.Settings{
        Name:        name,
        MaxRequests: 3,                // allow 3 requests in half-open state
        Interval:    30 * time.Second, // reset failure count after 30s of no failures
        Timeout:     10 * time.Second, // stay open for 10s before trying half-open

        ReadyToTrip: func(counts gobreaker.Counts) bool {
            // Open circuit after 5 consecutive failures
            return counts.ConsecutiveFailures >= 5
        },

        OnStateChange: func(name string, from gobreaker.State, to gobreaker.State) {
            log.Warn().
                Str("breaker", name).
                Str("from", from.String()).
                Str("to", to.String()).
                Msg("Circuit breaker state change")
        },
    }

    return gobreaker.NewCircuitBreaker[[]byte](settings)
}
```

```go
// internal/resilience/retry.go
package resilience

import (
    "context"
    "time"

    "github.com/cenkalti/backoff/v4"
    "github.com/rs/zerolog/log"
)

type RetryConfig struct {
    MaxRetries     int
    InitialBackoff time.Duration
    MaxBackoff     time.Duration
}

func DefaultRetryConfig() RetryConfig {
    return RetryConfig{
        MaxRetries:     4,
        InitialBackoff: 100 * time.Millisecond,
        MaxBackoff:     5 * time.Second,
    }
}

func WithRetry(ctx context.Context, cfg RetryConfig, operation func() error) error {
    b := backoff.NewExponentialBackOff()
    b.InitialInterval = cfg.InitialBackoff
    b.MaxInterval = cfg.MaxBackoff
    b.MaxElapsedTime = 30 * time.Second

    retryable := backoff.WithMaxRetries(b, uint64(cfg.MaxRetries))
    retryableCtx := backoff.WithContext(retryable, ctx)

    attempt := 0
    return backoff.Retry(func() error {
        attempt++
        err := operation()
        if err != nil {
            log.Debug().
                Int("attempt", attempt).
                Err(err).
                Msg("Operation failed, retrying...")
        }
        return err
    }, retryableCtx)
}
```


### Phase 3: Idempotency Layer (Days 3–4)

```go
// internal/idempotency/store.go
package idempotency

import (
    "context"
    "encoding/json"
    "fmt"
    "time"

    "github.com/redis/go-redis/v9"
)

type StoredResponse struct {
    StatusCode int             `json:"status_code"`
    Body       json.RawMessage `json:"body"`
    CreatedAt  time.Time       `json:"created_at"`
}

type Store struct {
    client *redis.Client
    ttl    time.Duration
}

func NewStore(client *redis.Client, ttl time.Duration) *Store {
    return &Store{client: client, ttl: ttl}
}

func (s *Store) Get(ctx context.Context, key string) (*StoredResponse, error) {
    val, err := s.client.Get(ctx, s.redisKey(key)).Result()
    if err == redis.Nil {
        return nil, nil // not found
    }
    if err != nil {
        return nil, fmt.Errorf("redis get: %w", err)
    }

    var resp StoredResponse
    if err := json.Unmarshal([]byte(val), &resp); err != nil {
        return nil, fmt.Errorf("unmarshal stored response: %w", err)
    }
    return &resp, nil
}

func (s *Store) Set(ctx context.Context, key string, resp StoredResponse) error {
    data, err := json.Marshal(resp)
    if err != nil {
        return fmt.Errorf("marshal response: %w", err)
    }
    return s.client.Set(ctx, s.redisKey(key), data, s.ttl).Err()
}

// Lock prevents concurrent processing of the same idempotency key
func (s *Store) Lock(ctx context.Context, key string) (bool, error) {
    return s.client.SetNX(ctx, s.lockKey(key), "processing", 30*time.Second).Result()
}

func (s *Store) Unlock(ctx context.Context, key string) error {
    return s.client.Del(ctx, s.lockKey(key)).Err()
}

func (s *Store) redisKey(key string) string  { return "idempotency:" + key }
func (s *Store) lockKey(key string) string   { return "idempotency:lock:" + key }
```

```go
// internal/idempotency/middleware.go
package idempotency

import (
    "bytes"
    "encoding/json"
    "net/http"

    "github.com/rs/zerolog/log"
)

func Middleware(store *Store) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            key := r.Header.Get("Idempotency-Key")
            if key == "" {
                http.Error(w, `{"error": "Idempotency-Key header required"}`, http.StatusBadRequest)
                return
            }

            ctx := r.Context()

            // Check if we already have a response for this key
            stored, err := store.Get(ctx, key)
            if err != nil {
                log.Error().Err(err).Msg("Failed to check idempotency store")
                // Fail open — process the request rather than blocking
            }

            if stored != nil {
                // Return cached response
                log.Info().Str("key", key).Msg("Returning cached idempotent response")
                w.Header().Set("Content-Type", "application/json")
                w.Header().Set("X-Idempotent-Replay", "true")
                w.WriteHeader(stored.StatusCode)
                w.Write(stored.Body)
                return
            }

            // Acquire lock to prevent concurrent processing
            acquired, err := store.Lock(ctx, key)
            if err != nil || !acquired {
                http.Error(w, `{"error": "request already in progress"}`, http.StatusConflict)
                return
            }
            defer store.Unlock(ctx, key)

            // Capture the response
            recorder := &responseRecorder{ResponseWriter: w, body: &bytes.Buffer{}}
            next.ServeHTTP(recorder, r)

            // Store the response for future replays
            store.Set(ctx, key, StoredResponse{
                StatusCode: recorder.statusCode,
                Body:       json.RawMessage(recorder.body.Bytes()),
            })
        })
    }
}

type responseRecorder struct {
    http.ResponseWriter
    statusCode int
    body       *bytes.Buffer
}

func (r *responseRecorder) WriteHeader(code int) {
    r.statusCode = code
    r.ResponseWriter.WriteHeader(code)
}

func (r *responseRecorder) Write(b []byte) (int, error) {
    r.body.Write(b)
    return r.ResponseWriter.Write(b)
}
```

### Phase 4: Payment Provider Client with Resilience (Day 5)

```go
// internal/provider/client.go
package provider

import (
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"

    "github.com/sony/gobreaker/v2"
    "resilient-payment-service/internal/resilience"
    "github.com/rs/zerolog/log"
)

type ChargeResponse struct {
    ChargeID  string    `json:"charge_id"`
    Status    string    `json:"status"`
    Processed time.Time `json:"processed"`
}

type Client struct {
    baseURL   string
    httpClient *http.Client
    breaker   *gobreaker.CircuitBreaker[[]byte]
    retryCfg  resilience.RetryConfig
}

func NewClient(baseURL string) *Client {
    return &Client{
        baseURL: baseURL,
        httpClient: &http.Client{
            Timeout: 5 * time.Second, // hard timeout per request
        },
        breaker:  resilience.NewCircuitBreaker("payment-provider"),
        retryCfg: resilience.DefaultRetryConfig(),
    }
}

func (c *Client) Charge(ctx context.Context, amount int64, currency string) (*ChargeResponse, error) {
    var result *ChargeResponse

    // Retry wraps the circuit breaker
    err := resilience.WithRetry(ctx, c.retryCfg, func() error {
        // Circuit breaker wraps the HTTP call
        body, cbErr := c.breaker.Execute(func() ([]byte, error) {
            return c.doCharge(ctx, amount, currency)
        })

        if cbErr != nil {
            return cbErr
        }

        var resp ChargeResponse
        if err := json.Unmarshal(body, &resp); err != nil {
            return fmt.Errorf("unmarshal response: %w", err)
        }
        result = &resp
        return nil
    })

    if err != nil {
        return nil, fmt.Errorf("charge failed after retries: %w", err)
    }

    return result, nil
}

func (c *Client) doCharge(ctx context.Context, amount int64, currency string) ([]byte, error) {
    reqBody := fmt.Sprintf(`{"amount": %d, "currency": "%s"}`, amount, currency)

    req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/charge",
        io.NopCloser(bytes.NewBufferString(reqBody)))
    if err != nil {
        return nil, err
    }
    req.Header.Set("Content-Type", "application/json")

    log.Debug().Str("url", c.baseURL+"/charge").Msg("Calling payment provider")

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("http request failed: %w", err)
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, fmt.Errorf("read response body: %w", err)
    }

    if resp.StatusCode >= 500 {
        return nil, fmt.Errorf("provider returned %d: %s", resp.StatusCode, string(body))
    }

    if resp.StatusCode >= 400 {
        // 4xx errors are not retryable
        return nil, backoff.Permanent(fmt.Errorf("provider returned %d: %s", resp.StatusCode, string(body)))
    }

    return body, nil
}
```


### Phase 5: Docker Compose & Integration (Days 6–7)

```yaml
# docker-compose.yml
services:
  payment-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: payment-service
    ports:
      - "8080:8080"
    environment:
      - PROVIDER_URL=http://fake-provider:9090
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      redis:
        condition: service_healthy
      fake-provider:
        condition: service_started

  fake-provider:
    build:
      context: .
      dockerfile: Dockerfile
      target: fake-provider
    ports:
      - "9090:9090"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,HOST://localhost:9092
      KAFKA_LISTENERS: PLAINTEXT://kafka:29092,CONTROLLER://kafka:29093,HOST://0.0.0.0:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:29093
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      CLUSTER_ID: MkU3OEVBNTcwNTJENDM2Qk
```

---

## 🧪 Testing Scenarios

| Scenario | How to Test | Expected Behaviour |
|----------|-------------|-------------------|
| Happy path | Send payment with valid idempotency key | 201 Created, provider charged |
| Idempotent replay | Send same key twice | Second returns 200 with cached result |
| Provider timeout | Set provider delay > 5s | Retries, then fails gracefully |
| Circuit opens | Send 5+ requests while provider is down | Fast-fail after circuit opens |
| Circuit recovery | Wait 10s after circuit opens, send request | Half-open → probe → close |
| Missing idempotency key | Omit header | 400 Bad Request |
| Concurrent duplicates | Send same key simultaneously | One processes, other gets 409 |

### Manual Test Script

```bash
# Start everything
docker-compose up --build

# Happy path
curl -X POST http://localhost:8080/v1/payments \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: pay_test_001" \
  -d '{"account_id": "acc_123", "amount": 5000, "currency": "GBP", "recipient": "acc_456"}'

# Idempotent replay (same key — should return cached result)
curl -X POST http://localhost:8080/v1/payments \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: pay_test_001" \
  -d '{"account_id": "acc_123", "amount": 5000, "currency": "GBP", "recipient": "acc_456"}'
# Look for X-Idempotent-Replay: true header

# Stress test (trigger circuit breaker)
for i in $(seq 1 20); do
  curl -s -X POST http://localhost:8080/v1/payments \
    -H "Content-Type: application/json" \
    -H "Idempotency-Key: pay_stress_$i" \
    -d '{"account_id": "acc_123", "amount": 100, "currency": "GBP", "recipient": "acc_456"}' &
done
wait
# Watch logs for circuit breaker state changes
```

---

## 🧠 Interview Talking Points

After building this, you can discuss:

| Topic | What You Can Say |
|-------|-----------------|
| Circuit breakers | "I implemented gobreaker with 5-failure threshold, 10s timeout, and 3 probe requests in half-open state" |
| Retry strategy | "Exponential backoff starting at 100ms, max 5s, with jitter. Only retry 5xx, not 4xx" |
| Idempotency | "Redis-backed with TTL, distributed lock to prevent concurrent processing of same key" |
| Timeouts | "5s per-request timeout via context, 30s overall operation timeout" |
| Trade-offs | "Fail-open on Redis errors (availability over consistency for the idempotency check)" |
| Monitoring | "I'd add metrics: circuit state changes, retry counts, p99 latency, idempotent hit rate" |

---

## 📚 References

- **Circuit Breaker pattern (Martin Fowler):** https://martinfowler.com/bliki/CircuitBreaker.html
- **sony/gobreaker:** https://github.com/sony/gobreaker
- **cenkalti/backoff:** https://github.com/cenkalti/backoff
- **Idempotency patterns (Stripe):** https://stripe.com/docs/api/idempotent_requests
- **Microsoft resilience patterns:** https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker
- **Exponential backoff (AWS):** https://docs.aws.amazon.com/general/latest/gr/api-retries.html
- **Redis distributed locks:** https://redis.io/docs/manual/patterns/distributed-locks/
- **Monzo on resilience:** https://monzo.com/blog/2018/07/27/how-we-monitor-monzo
- **Release It! (book):** https://pragprog.com/titles/mnee2/release-it-second-edition/

---

## ✅ Definition of Done

- [ ] Fake provider runs and fails randomly (30% failure rate)
- [ ] Payment service retries transient failures with exponential backoff
- [ ] Circuit breaker opens after 5 consecutive failures
- [ ] Circuit breaker recovers (half-open → closed) when provider comes back
- [ ] Idempotency-Key prevents duplicate payment processing
- [ ] Concurrent requests with same key handled correctly (lock)
- [ ] Payment events published to Kafka on success
- [ ] Structured logging shows retry attempts, circuit state, idempotent hits
- [ ] Docker Compose runs the full stack
- [ ] README with architecture diagram and demo instructions
- [ ] Pushed to GitHub
