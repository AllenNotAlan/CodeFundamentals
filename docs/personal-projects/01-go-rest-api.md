# Project 1 — Go Transaction API

> **Gap addressed:** No Go exposure
> **Timeline:** Weeks 1–3 (15–20 hours total)
> **Outcome:** A working REST API in Go that manages user accounts and transactions

---

## 🎯 Why This Project

Monzo's entire backend is written in Go. They say they don't require prior knowledge, but:
- Having a Go project on GitHub shows initiative and reduces perceived onboarding risk
- You'll understand Go idioms when discussing Monzo's architecture in interviews
- Go's concurrency model (goroutines, channels) is a common system design discussion point

---

## 📋 What You'll Build

A simple banking transaction API that supports:
- Creating accounts
- Depositing and withdrawing funds
- Transferring between accounts
- Viewing transaction history

This is deliberately simple — the goal is **learning Go**, not building a production bank.

---

## 🏗️ Architecture

```
┌──────────────┐     ┌─────────────────────────────────────────┐
│   Client     │     │           Go Transaction API              │
│  (curl/      │     │                                           │
│   Postman)   │     │  ┌───────────┐  ┌──────────────────┐    │
│              │────▶│  │  Router   │─▶│   Handlers        │    │
│              │     │  │  (Chi)    │  │  (HTTP layer)     │    │
│              │     │  └───────────┘  └────────┬──────────┘    │
│              │     │                           │               │
│              │     │                           ▼               │
│              │     │                 ┌──────────────────┐     │
│              │     │                 │   Service Layer   │     │
│              │     │                 │  (Business logic) │     │
│              │     │                 └────────┬──────────┘     │
│              │     │                          │                │
│              │     │                          ▼                │
│              │     │                 ┌──────────────────┐     │
│              │     │                 │   Repository      │     │
│              │     │                 │  (PostgreSQL)     │     │
│              │     │                 └──────────────────┘     │
│              │     │                                           │
└──────────────┘     └─────────────────────────────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │   PostgreSQL      │
                              │   (Docker)        │
                              └──────────────────┘
```

---

## 📁 Project Structure

```
go-transaction-api/
├── cmd/
│   └── server/
│       └── main.go              # Entry point
├── internal/
│   ├── handler/
│   │   ├── account.go           # Account HTTP handlers
│   │   ├── transaction.go       # Transaction HTTP handlers
│   │   └── middleware.go        # Logging, recovery, request ID
│   ├── service/
│   │   ├── account.go           # Account business logic
│   │   └── transaction.go       # Transaction business logic
│   ├── repository/
│   │   ├── account.go           # Account DB queries
│   │   └── transaction.go       # Transaction DB queries
│   ├── model/
│   │   ├── account.go           # Account struct
│   │   └── transaction.go       # Transaction struct
│   └── config/
│       └── config.go            # Environment config
├── migrations/
│   ├── 001_create_accounts.up.sql
│   └── 002_create_transactions.up.sql
├── docker-compose.yml
├── Makefile
├── go.mod
├── go.sum
└── README.md
```

---

## 🛠️ Tech Stack & Libraries

| Library | Purpose | Link |
|---------|---------|------|
| `net/http` (stdlib) | HTTP server | https://pkg.go.dev/net/http |
| `go-chi/chi` | Lightweight router | https://github.com/go-chi/chi |
| `jackc/pgx` | PostgreSQL driver | https://github.com/jackc/pgx |
| `golang-migrate/migrate` | DB migrations | https://github.com/golang-migrate/migrate |
| `rs/zerolog` | Structured logging | https://github.com/rs/zerolog |
| `google/uuid` | UUID generation | https://github.com/google/uuid |
| `stretchr/testify` | Test assertions | https://github.com/stretchr/testify |

---

## 📖 Learning Path (Before You Code)

### Week 1: Go Fundamentals (5–7 hours)

Complete these in order:

1. **A Tour of Go** (official, interactive) — https://go.dev/tour/
   - Focus on: types, structs, interfaces, error handling, goroutines
   - Time: ~3 hours

2. **Go by Example** — https://gobyexample.com/
   - Focus on: structs, interfaces, errors, JSON, HTTP server, context
   - Time: ~2 hours

3. **Effective Go** (skim) — https://go.dev/doc/effective_go
   - Focus on: naming conventions, error handling patterns, defer
   - Time: ~1 hour

### Key Go Concepts to Understand

```go
// 1. Error handling — Go doesn't have exceptions
result, err := doSomething()
if err != nil {
    return fmt.Errorf("failed to do something: %w", err)
}

// 2. Interfaces — implicit implementation (no "implements" keyword)
type Repository interface {
    GetAccount(ctx context.Context, id uuid.UUID) (*Account, error)
}

// 3. Structs + methods (no classes)
type Account struct {
    ID      uuid.UUID
    Balance int64
}

func (a *Account) Deposit(amount int64) error {
    if amount <= 0 {
        return errors.New("amount must be positive")
    }
    a.Balance += amount
    return nil
}

// 4. Context — passed through every function for cancellation/timeouts
func (s *Service) Transfer(ctx context.Context, from, to uuid.UUID, amount int64) error {
    // ctx carries deadlines, cancellation signals, request-scoped values
}

// 5. Goroutines + channels (for later — not needed in this project)
go func() {
    result <- processAsync()
}()
```

---

## 🔨 Implementation Steps

### Phase 1: Hello World API (Day 1)

```go
// cmd/server/main.go
package main

import (
    "fmt"
    "log"
    "net/http"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func main() {
    r := chi.NewRouter()
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)

    r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte(`{"status": "ok"}`))
    })

    fmt.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}
```

### Phase 2: Account CRUD (Days 2–3)

**API Endpoints:**
```
POST   /v1/accounts          → Create account
GET    /v1/accounts/{id}     → Get account by ID
GET    /v1/accounts          → List accounts
```

**Model:**
```go
// internal/model/account.go
package model

import (
    "time"
    "github.com/google/uuid"
)

type Account struct {
    ID        uuid.UUID `json:"id"`
    Name      string    `json:"name"`
    Balance   int64     `json:"balance"`   // stored in pence/cents
    Currency  string    `json:"currency"`
    CreatedAt time.Time `json:"created_at"`
}

type CreateAccountRequest struct {
    Name     string `json:"name"`
    Currency string `json:"currency"`
}
```

**Handler:**
```go
// internal/handler/account.go
package handler

import (
    "encoding/json"
    "net/http"

    "github.com/go-chi/chi/v5"
    "github.com/google/uuid"
)

type AccountHandler struct {
    service AccountService
}

type AccountService interface {
    Create(ctx context.Context, name, currency string) (*model.Account, error)
    GetByID(ctx context.Context, id uuid.UUID) (*model.Account, error)
}

func (h *AccountHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req model.CreateAccountRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, `{"error": "invalid request body"}`, http.StatusBadRequest)
        return
    }

    account, err := h.service.Create(r.Context(), req.Name, req.Currency)
    if err != nil {
        http.Error(w, `{"error": "internal error"}`, http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(account)
}

func (h *AccountHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    idStr := chi.URLParam(r, "id")
    id, err := uuid.Parse(idStr)
    if err != nil {
        http.Error(w, `{"error": "invalid account ID"}`, http.StatusBadRequest)
        return
    }

    account, err := h.service.GetByID(r.Context(), id)
    if err != nil {
        http.Error(w, `{"error": "account not found"}`, http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(account)
}
```

### Phase 3: Transactions (Days 4–5)

**API Endpoints:**
```
POST   /v1/transactions/deposit    → Deposit to account
POST   /v1/transactions/withdraw   → Withdraw from account
POST   /v1/transactions/transfer   → Transfer between accounts
GET    /v1/accounts/{id}/transactions → Transaction history
```

**Model:**
```go
type Transaction struct {
    ID            uuid.UUID `json:"id"`
    FromAccountID *uuid.UUID `json:"from_account_id,omitempty"`
    ToAccountID   *uuid.UUID `json:"to_account_id,omitempty"`
    Amount        int64     `json:"amount"`
    Type          string    `json:"type"` // "deposit", "withdrawal", "transfer"
    CreatedAt     time.Time `json:"created_at"`
}

type TransferRequest struct {
    FromAccountID uuid.UUID `json:"from_account_id"`
    ToAccountID   uuid.UUID `json:"to_account_id"`
    Amount        int64     `json:"amount"`
}
```

**Key implementation detail — atomic transfers:**
```go
func (r *TransactionRepo) Transfer(ctx context.Context, from, to uuid.UUID, amount int64) error {
    tx, err := r.db.Begin(ctx)
    if err != nil {
        return err
    }
    defer tx.Rollback(ctx)

    // Lock rows in consistent order to prevent deadlocks
    ids := orderIDs(from, to)
    for _, id := range ids {
        _, err := tx.Exec(ctx, "SELECT 1 FROM accounts WHERE id = $1 FOR UPDATE", id)
        if err != nil {
            return err
        }
    }

    // Debit sender
    _, err = tx.Exec(ctx,
        "UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1",
        amount, from)
    if err != nil {
        return err
    }

    // Credit receiver
    _, err = tx.Exec(ctx,
        "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
        amount, to)
    if err != nil {
        return err
    }

    // Record transaction
    _, err = tx.Exec(ctx,
        `INSERT INTO transactions (id, from_account_id, to_account_id, amount, type)
         VALUES ($1, $2, $3, $4, 'transfer')`,
        uuid.New(), from, to, amount)
    if err != nil {
        return err
    }

    return tx.Commit(ctx)
}
```

### Phase 4: Testing (Day 6)

```go
// internal/service/account_test.go
package service_test

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

type MockAccountRepo struct {
    mock.Mock
}

func (m *MockAccountRepo) Create(ctx context.Context, name, currency string) (*model.Account, error) {
    args := m.Called(ctx, name, currency)
    return args.Get(0).(*model.Account), args.Error(1)
}

func TestCreateAccount_Success(t *testing.T) {
    repo := new(MockAccountRepo)
    svc := service.NewAccountService(repo)

    repo.On("Create", mock.Anything, "Alice", "GBP").Return(&model.Account{
        Name:     "Alice",
        Currency: "GBP",
        Balance:  0,
    }, nil)

    account, err := svc.Create(context.Background(), "Alice", "GBP")

    assert.NoError(t, err)
    assert.Equal(t, "Alice", account.Name)
    assert.Equal(t, int64(0), account.Balance)
    repo.AssertExpectations(t)
}
```

### Phase 5: Docker + Polish (Day 7)

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/transactions?sslmode=disable
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: transactions
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d transactions"]
      interval: 5s
      timeout: 3s
      retries: 5
```

```dockerfile
# Dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server ./cmd/server

FROM alpine:3.19
COPY --from=builder /app/server /server
EXPOSE 8080
CMD ["/server"]
```

```makefile
# Makefile
.PHONY: run build test migrate-up docker-up

run:
	go run ./cmd/server

build:
	go build -o bin/server ./cmd/server

test:
	go test ./... -v

migrate-up:
	migrate -path migrations -database "$(DATABASE_URL)" up

docker-up:
	docker-compose up --build

lint:
	golangci-lint run ./...
```

---

## 🗄️ Database Migrations

```sql
-- migrations/001_create_accounts.up.sql
CREATE TABLE accounts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    balance    BIGINT NOT NULL DEFAULT 0,
    currency   CHAR(3) NOT NULL DEFAULT 'GBP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrations/002_create_transactions.up.sql
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_account_id UUID REFERENCES accounts(id),
    to_account_id   UUID REFERENCES accounts(id),
    amount          BIGINT NOT NULL,
    type            VARCHAR(20) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_from ON transactions(from_account_id, created_at DESC);
CREATE INDEX idx_transactions_to ON transactions(to_account_id, created_at DESC);
```

---

## 🧪 Manual Testing Script

```bash
# Create accounts
curl -X POST http://localhost:8080/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "currency": "GBP"}'

curl -X POST http://localhost:8080/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob", "currency": "GBP"}'

# Deposit
curl -X POST http://localhost:8080/v1/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{"account_id": "<alice-id>", "amount": 10000}'

# Transfer
curl -X POST http://localhost:8080/v1/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{"from_account_id": "<alice-id>", "to_account_id": "<bob-id>", "amount": 2500}'

# Check balances
curl http://localhost:8080/v1/accounts/<alice-id>
curl http://localhost:8080/v1/accounts/<bob-id>

# Transaction history
curl http://localhost:8080/v1/accounts/<alice-id>/transactions
```

---

## 🎓 Go Concepts You'll Learn

| Concept | Where You'll Use It |
|---------|-------------------|
| Structs & methods | Models, services |
| Interfaces | Service/repository boundaries |
| Error handling (`if err != nil`) | Everywhere |
| Context propagation | Every function |
| JSON marshalling/unmarshalling | Handlers |
| Database transactions | Transfer logic |
| Dependency injection (manual) | Service constructors |
| Table-driven tests | Unit tests |
| Goroutines | Graceful shutdown |

---

## 📚 References

- **Go official docs:** https://go.dev/doc/
- **A Tour of Go:** https://go.dev/tour/
- **Go by Example:** https://gobyexample.com/
- **Effective Go:** https://go.dev/doc/effective_go
- **Chi router docs:** https://go-chi.io/
- **pgx documentation:** https://pkg.go.dev/github.com/jackc/pgx/v5
- **How Monzo uses Go:** https://monzo.com/blog/2016/09/19/building-a-modern-bank-backend
- **Go project layout:** https://github.com/golang-standards/project-layout
- **Go testing patterns:** https://go.dev/doc/tutorial/add-a-test

---

## ✅ Definition of Done

- [ ] API starts and responds to `/health`
- [ ] Can create accounts and query them
- [ ] Can deposit, withdraw, and transfer funds
- [ ] Transfers are atomic (no partial state)
- [ ] Insufficient balance returns proper error
- [ ] Unit tests for service layer
- [ ] Docker Compose runs the full stack
- [ ] README with setup instructions
- [ ] Pushed to GitHub
