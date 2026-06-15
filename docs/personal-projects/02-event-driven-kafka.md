# Project 2 — Event-Driven Transaction System with Kafka

> **Gap addressed:** No event-driven/Kafka practice
> **Timeline:** Weeks 3–5 (12–15 hours total)
> **Outcome:** A working Kafka producer/consumer pipeline that processes transaction events asynchronously

---

## 🎯 Why This Project

Monzo uses Kafka as their "asynchronous message queue" for inter-service communication. Event-driven architecture is fundamental to how modern fintech systems work:
- Payments trigger notifications, fraud checks, analytics — all asynchronously
- Services are decoupled — the payment service doesn't need to know about notifications
- Events provide an audit trail and enable replay

---

## 📋 What You'll Build

A system where:
1. A **Transaction API** publishes events when transactions occur
2. A **Notification Service** consumes events and "sends" notifications
3. A **Fraud Detection Service** consumes events and flags suspicious activity
4. A **Dead Letter Queue (DLQ)** captures failed messages for investigation

---

## 🏗️ Architecture

```
┌──────────────────┐
│  Transaction API │
│  (Go - Producer) │
└────────┬─────────┘
         │
         │ Publishes events
         ▼
┌─────────────────────────────────────────────────────────────┐
│                        Apache Kafka                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Topic: transaction.created                          │    │
│  │  Partitions: 3 (partitioned by account_id)           │    │
│  └──────────┬──────────────────────┬───────────────────┘    │
│             │                      │                         │
│  ┌──────────┴──────────┐  ┌──────┴────────────────────┐   │
│  │  Consumer Group:     │  │  Consumer Group:           │   │
│  │  notifications       │  │  fraud-detection           │   │
│  └──────────┬──────────┘  └──────┬────────────────────┘   │
│             │                      │                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Topic: transaction.dlq  (Dead Letter Queue)         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │                      │
         ▼                      ▼
┌──────────────────┐   ┌──────────────────────┐
│  Notification    │   │  Fraud Detection      │
│  Service         │   │  Service              │
│  (Go - Consumer) │   │  (Go - Consumer)      │
└──────────────────┘   └──────────────────────┘
```

---

## 📁 Project Structure

```
event-driven-transactions/
├── cmd/
│   ├── producer/
│   │   └── main.go              # Transaction API (produces events)
│   ├── notification-consumer/
│   │   └── main.go              # Notification service
│   └── fraud-consumer/
│       └── main.go              # Fraud detection service
├── internal/
│   ├── event/
│   │   ├── types.go             # Event schemas
│   │   ├── producer.go          # Kafka producer wrapper
│   │   └── consumer.go          # Kafka consumer wrapper
│   ├── notification/
│   │   └── handler.go           # Notification processing logic
│   ├── fraud/
│   │   └── handler.go           # Fraud detection logic
│   └── config/
│       └── config.go            # Kafka connection config
├── docker-compose.yml
├── Makefile
├── go.mod
└── README.md
```

---

## 🛠️ Tech Stack & Libraries

| Library | Purpose | Link |
|---------|---------|------|
| `segmentio/kafka-go` | Kafka client for Go | https://github.com/segmentio/kafka-go |
| `go-chi/chi` | HTTP router (producer API) | https://github.com/go-chi/chi |
| `rs/zerolog` | Structured logging | https://github.com/rs/zerolog |
| `google/uuid` | Event IDs | https://github.com/google/uuid |

**Alternative Kafka client:** `IBM/sarama` (more mature but more complex) — https://github.com/IBM/sarama

---

## 📖 Learning Path (Before You Code)

### Kafka Fundamentals (3–4 hours)

1. **Kafka in 5 minutes** (video) — https://www.youtube.com/watch?v=PzPXRmVHMxI
2. **Kafka official quickstart** — https://kafka.apache.org/quickstart
3. **Confluent Kafka 101** (free course) — https://developer.confluent.io/courses/apache-kafka/events/

### Key Concepts to Understand

```
┌─────────────────────────────────────────────────────────────┐
│                     Kafka Concepts                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  TOPIC: A named stream of events (like a database table)     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  transaction.created                                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │Partition 0│ │Partition 1│ │Partition 2│            │    │
│  │  │ msg1,msg4 │ │ msg2,msg5 │ │ msg3,msg6 │            │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  PRODUCER: Writes events to a topic                          │
│  CONSUMER: Reads events from a topic                         │
│  CONSUMER GROUP: Multiple consumers sharing the work         │
│  OFFSET: Position of a consumer in a partition               │
│  PARTITION KEY: Determines which partition a message goes to  │
│                                                               │
│  KEY GUARANTEES:                                             │
│  • Messages with same key → same partition → ordered         │
│  • Each partition consumed by exactly one consumer in group   │
│  • Messages are durable (persisted to disk)                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Why Partition by Account ID?

```
account_123 → Partition 0  (all events for this account are ordered)
account_456 → Partition 1
account_789 → Partition 2

This guarantees: for any single account, events are processed in order.
Cross-account ordering is NOT guaranteed (and doesn't need to be).
```

---

## 🔨 Implementation Steps

### Phase 1: Docker Compose with Kafka (Day 1)

```yaml
# docker-compose.yml
services:
  kafka:
    image: confluentinc/cp-kafka:7.6.0
    hostname: kafka
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
    healthcheck:
      test: kafka-topics --bootstrap-server kafka:9092 --list
      interval: 10s
      timeout: 5s
      retries: 5

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    ports:
      - "8090:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
    depends_on:
      kafka:
        condition: service_healthy

  init-kafka:
    image: confluentinc/cp-kafka:7.6.0
    depends_on:
      kafka:
        condition: service_healthy
    entrypoint: ["/bin/sh", "-c"]
    command: |
      "
      kafka-topics --create --topic transaction.created --partitions 3 --replication-factor 1 --bootstrap-server kafka:29092
      kafka-topics --create --topic transaction.dlq --partitions 1 --replication-factor 1 --bootstrap-server kafka:29092
      echo 'Topics created!'
      "
```

### Phase 2: Event Schema & Producer (Days 2–3)

```go
// internal/event/types.go
package event

import (
    "time"
    "github.com/google/uuid"
)

type TransactionEvent struct {
    EventID       string    `json:"event_id"`
    EventType     string    `json:"event_type"`
    Timestamp     time.Time `json:"timestamp"`
    TransactionID string    `json:"transaction_id"`
    AccountID     string    `json:"account_id"`
    Amount        int64     `json:"amount"`
    Currency      string    `json:"currency"`
    Merchant      string    `json:"merchant,omitempty"`
    Type          string    `json:"type"` // "deposit", "withdrawal", "transfer", "purchase"
}

func NewTransactionEvent(accountID string, amount int64, txType, merchant string) TransactionEvent {
    return TransactionEvent{
        EventID:       uuid.New().String(),
        EventType:     "transaction.created",
        Timestamp:     time.Now().UTC(),
        TransactionID: uuid.New().String(),
        AccountID:     accountID,
        Amount:        amount,
        Currency:      "GBP",
        Merchant:      merchant,
        Type:          txType,
    }
}
```

```go
// internal/event/producer.go
package event

import (
    "context"
    "encoding/json"
    "fmt"

    "github.com/segmentio/kafka-go"
)

type Producer struct {
    writer *kafka.Writer
}

func NewProducer(brokers []string, topic string) *Producer {
    return &Producer{
        writer: &kafka.Writer{
            Addr:     kafka.TCP(brokers...),
            Topic:    topic,
            Balancer: &kafka.Hash{}, // partition by key
        },
    }
}

func (p *Producer) PublishTransaction(ctx context.Context, event TransactionEvent) error {
    value, err := json.Marshal(event)
    if err != nil {
        return fmt.Errorf("failed to marshal event: %w", err)
    }

    msg := kafka.Message{
        Key:   []byte(event.AccountID), // partition by account for ordering
        Value: value,
    }

    if err := p.writer.WriteMessages(ctx, msg); err != nil {
        return fmt.Errorf("failed to publish event: %w", err)
    }

    return nil
}

func (p *Producer) Close() error {
    return p.writer.Close()
}
```

```go
// cmd/producer/main.go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"

    "github.com/go-chi/chi/v5"
    "event-driven-transactions/internal/event"
)

func main() {
    producer := event.NewProducer([]string{"localhost:9092"}, "transaction.created")
    defer producer.Close()

    r := chi.NewRouter()

    r.Post("/v1/transactions", func(w http.ResponseWriter, r *http.Request) {
        var req struct {
            AccountID string `json:"account_id"`
            Amount    int64  `json:"amount"`
            Type      string `json:"type"`
            Merchant  string `json:"merchant"`
        }

        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, `{"error": "invalid body"}`, http.StatusBadRequest)
            return
        }

        evt := event.NewTransactionEvent(req.AccountID, req.Amount, req.Type, req.Merchant)

        if err := producer.PublishTransaction(r.Context(), evt); err != nil {
            http.Error(w, `{"error": "failed to publish"}`, http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusAccepted)
        json.NewEncoder(w).Encode(map[string]string{
            "event_id":       evt.EventID,
            "transaction_id": evt.TransactionID,
            "status":         "accepted",
        })
    })

    fmt.Println("Producer API starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}
```

### Phase 3: Notification Consumer (Day 4)

```go
// internal/notification/handler.go
package notification

import (
    "context"
    "fmt"

    "event-driven-transactions/internal/event"
    "github.com/rs/zerolog/log"
)

type Handler struct{}

func NewHandler() *Handler {
    return &Handler{}
}

func (h *Handler) Handle(ctx context.Context, evt event.TransactionEvent) error {
    // In production: send push notification, SMS, email
    // Here we just log it
    switch {
    case evt.Amount < 0:
        log.Info().
            Str("account_id", evt.AccountID).
            Int64("amount", evt.Amount).
            Str("merchant", evt.Merchant).
            Msg("💸 Payment notification: You spent money")
    case evt.Amount > 0:
        log.Info().
            Str("account_id", evt.AccountID).
            Int64("amount", evt.Amount).
            Msg("💰 Deposit notification: Money received")
    }

    // Simulate occasional failures for DLQ testing
    if evt.Amount == 666 {
        return fmt.Errorf("simulated processing failure")
    }

    return nil
}
```

```go
// cmd/notification-consumer/main.go
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "os"
    "os/signal"
    "syscall"

    "github.com/segmentio/kafka-go"
    "github.com/rs/zerolog/log"
    "event-driven-transactions/internal/event"
    "event-driven-transactions/internal/notification"
)

func main() {
    reader := kafka.NewReader(kafka.ReaderConfig{
        Brokers:  []string{"localhost:9092"},
        Topic:    "transaction.created",
        GroupID:  "notification-service",
        MinBytes: 1,
        MaxBytes: 10e6,
    })
    defer reader.Close()

    dlqWriter := &kafka.Writer{
        Addr:  kafka.TCP("localhost:9092"),
        Topic: "transaction.dlq",
    }
    defer dlqWriter.Close()

    handler := notification.NewHandler()

    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    // Graceful shutdown
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    go func() {
        <-sigChan
        fmt.Println("\nShutting down...")
        cancel()
    }()

    log.Info().Msg("Notification consumer started, waiting for messages...")

    for {
        msg, err := reader.ReadMessage(ctx)
        if err != nil {
            if ctx.Err() != nil {
                break // context cancelled, shutting down
            }
            log.Error().Err(err).Msg("Failed to read message")
            continue
        }

        var evt event.TransactionEvent
        if err := json.Unmarshal(msg.Value, &evt); err != nil {
            log.Error().Err(err).Msg("Failed to unmarshal event")
            continue
        }

        if err := handler.Handle(ctx, evt); err != nil {
            log.Error().Err(err).Str("event_id", evt.EventID).Msg("Failed to process, sending to DLQ")

            // Send to Dead Letter Queue
            dlqMsg := kafka.Message{
                Key:   msg.Key,
                Value: msg.Value,
                Headers: []kafka.Header{
                    {Key: "error", Value: []byte(err.Error())},
                    {Key: "original-topic", Value: []byte("transaction.created")},
                    {Key: "consumer-group", Value: []byte("notification-service")},
                },
            }
            if dlqErr := dlqWriter.WriteMessages(ctx, dlqMsg); dlqErr != nil {
                log.Error().Err(dlqErr).Msg("Failed to write to DLQ!")
            }
        }
    }
}
```

### Phase 4: Fraud Detection Consumer (Day 5)

```go
// internal/fraud/handler.go
package fraud

import (
    "context"
    "sync"
    "time"

    "event-driven-transactions/internal/event"
    "github.com/rs/zerolog/log"
)

type Handler struct {
    mu             sync.Mutex
    recentActivity map[string][]event.TransactionEvent // account_id -> recent events
}

func NewHandler() *Handler {
    return &Handler{
        recentActivity: make(map[string][]event.TransactionEvent),
    }
}

func (h *Handler) Handle(ctx context.Context, evt event.TransactionEvent) error {
    h.mu.Lock()
    defer h.mu.Unlock()

    // Keep last 10 minutes of activity per account
    h.cleanOldEvents(evt.AccountID)
    h.recentActivity[evt.AccountID] = append(h.recentActivity[evt.AccountID], evt)

    // Rule 1: High-value transaction
    if evt.Amount < -50000 { // > £500 spend
        log.Warn().
            Str("account_id", evt.AccountID).
            Int64("amount", evt.Amount).
            Str("rule", "high_value").
            Msg("🚨 FRAUD ALERT: High-value transaction")
    }

    // Rule 2: Rapid successive transactions (velocity check)
    recent := h.recentActivity[evt.AccountID]
    if len(recent) >= 5 {
        // 5+ transactions in 10 minutes
        log.Warn().
            Str("account_id", evt.AccountID).
            Int("tx_count", len(recent)).
            Str("rule", "velocity").
            Msg("🚨 FRAUD ALERT: Unusual transaction velocity")
    }

    // Rule 3: Transaction at unusual hour (simplified)
    hour := evt.Timestamp.Hour()
    if hour >= 2 && hour <= 5 {
        log.Warn().
            Str("account_id", evt.AccountID).
            Int("hour", hour).
            Str("rule", "unusual_time").
            Msg("⚠️ FRAUD WARNING: Transaction at unusual hour")
    }

    return nil
}

func (h *Handler) cleanOldEvents(accountID string) {
    cutoff := time.Now().Add(-10 * time.Minute)
    events := h.recentActivity[accountID]
    filtered := events[:0]
    for _, e := range events {
        if e.Timestamp.After(cutoff) {
            filtered = append(filtered, e)
        }
    }
    h.recentActivity[accountID] = filtered
}
```

### Phase 5: Integration Testing (Day 6)

```go
// integration_test.go (run with docker-compose up first)
//go:build integration

package integration

import (
    "context"
    "encoding/json"
    "testing"
    "time"

    "github.com/segmentio/kafka-go"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    "event-driven-transactions/internal/event"
)

func TestProduceAndConsume(t *testing.T) {
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    // Produce an event
    producer := event.NewProducer([]string{"localhost:9092"}, "transaction.created")
    defer producer.Close()

    evt := event.NewTransactionEvent("acc_test_123", -2500, "purchase", "Tesco")
    err := producer.PublishTransaction(ctx, evt)
    require.NoError(t, err)

    // Consume and verify
    reader := kafka.NewReader(kafka.ReaderConfig{
        Brokers:  []string{"localhost:9092"},
        Topic:    "transaction.created",
        GroupID:  "test-consumer-" + time.Now().Format("150405"),
        MinBytes: 1,
        MaxBytes: 10e6,
    })
    defer reader.Close()

    msg, err := reader.ReadMessage(ctx)
    require.NoError(t, err)

    var received event.TransactionEvent
    err = json.Unmarshal(msg.Value, &received)
    require.NoError(t, err)

    assert.Equal(t, evt.EventID, received.EventID)
    assert.Equal(t, "acc_test_123", received.AccountID)
    assert.Equal(t, int64(-2500), received.Amount)
    assert.Equal(t, "Tesco", received.Merchant)
}
```

---

## 🧠 Key Patterns to Understand & Discuss in Interviews

### 1. At-Least-Once vs Exactly-Once Delivery

```
┌─────────────────────────────────────────────────────────────┐
│  Delivery Semantics                                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  AT-MOST-ONCE:  Fire and forget. May lose messages.          │
│  AT-LEAST-ONCE: Retry until ack. May get duplicates. ← US   │
│  EXACTLY-ONCE:  Kafka supports this but it's complex.        │
│                                                               │
│  In practice: use AT-LEAST-ONCE + IDEMPOTENT CONSUMERS       │
│  (deduplicate using event_id)                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2. Consumer Group Rebalancing

```
Before (2 consumers, 3 partitions):
  Consumer A: [P0, P1]
  Consumer B: [P2]

Consumer B dies → Rebalance:
  Consumer A: [P0, P1, P2]  ← picks up the slack

New Consumer C joins → Rebalance:
  Consumer A: [P0]
  Consumer C: [P1, P2]
```

### 3. Dead Letter Queue Pattern

```
Normal flow:
  Message → Consumer → Process → Commit offset ✓

Failure flow:
  Message → Consumer → Process FAILS → Retry (3x)
                                      → Still fails → Send to DLQ
                                      → Commit offset (don't block)
                                      → Alert on-call engineer
```

### 4. Event Schema Evolution

```
v1: { "amount": 5000 }
v2: { "amount": { "value": 5000, "currency": "GBP" } }  ← BREAKING!

Better approach:
v1: { "amount": 5000, "currency": "GBP" }
v2: { "amount": 5000, "currency": "GBP", "fee": 50 }    ← ADDITIVE (safe)

Rule: Only add fields. Never remove or rename.
Use a schema registry (Confluent) for enforcement.
```

---

## 🧪 Testing Scenarios

| Scenario | How to Test |
|----------|-------------|
| Happy path | POST a transaction, verify both consumers log it |
| Consumer failure | Send amount=666, verify DLQ receives it |
| High-value fraud | Send amount=-100000, verify fraud alert |
| Velocity check | Send 5 transactions rapidly for same account |
| Consumer restart | Kill a consumer, send messages, restart — verify it catches up |
| Partition ordering | Send multiple events for same account, verify order preserved |

---

## 📚 References

- **Kafka official documentation:** https://kafka.apache.org/documentation/
- **kafka-go library:** https://github.com/segmentio/kafka-go
- **Confluent Kafka 101 course:** https://developer.confluent.io/courses/apache-kafka/events/
- **Designing Event-Driven Systems (free book):** https://www.confluent.io/designing-event-driven-systems/
- **Kafka UI (for debugging):** https://github.com/provectus/kafka-ui
- **Dead Letter Queue pattern:** https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/dead-letter-queue.html
- **Monzo blog on event sourcing:** https://monzo.com/blog/2016/09/19/building-a-modern-bank-backend
- **Exactly-once semantics in Kafka:** https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/

---

## ✅ Definition of Done

- [ ] Docker Compose starts Kafka + Kafka UI
- [ ] Producer API accepts POST requests and publishes to Kafka
- [ ] Notification consumer processes events and logs notifications
- [ ] Fraud consumer detects high-value and velocity anomalies
- [ ] Failed messages go to DLQ with error metadata
- [ ] Can view topics and messages in Kafka UI (localhost:8090)
- [ ] Integration test proves end-to-end flow
- [ ] Graceful shutdown on SIGTERM
- [ ] README with setup and demo instructions
- [ ] Pushed to GitHub
