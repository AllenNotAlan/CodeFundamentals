# 🚀 Personal Projects — Interview Gap Closure Plan

> **Goal:** Build tangible, demonstrable projects that address the gaps identified in my Monzo/senior engineering interview preparation.
> **Timeline:** 8–10 weeks (evenings & weekends)
> **Outcome:** A portfolio of working code that proves hands-on experience with Go, Kafka, resilience patterns, and algorithmic problem-solving.

---

## 🎯 Gaps Being Addressed

| # | Gap | Project | Why It Matters |
|---|-----|---------|----------------|
| 1 | No Go exposure | [Go Transaction API](./01-go-rest-api.md) | Monzo's primary language; shows initiative |
| 2 | No event-driven/Kafka practice | [Event-Driven Transaction System](./02-event-driven-kafka.md) | Monzo uses Kafka heavily; need hands-on experience |
| 3 | No resilience patterns implemented | [Resilient Payment Service](./03-resilient-payment-service.md) | "Interested in writing resilient software" is a core requirement |
| 4 | Thin coding practice | [Coding Challenge Tracker](./04-coding-practice-plan.md) | Need 40+ solved problems to pass live coding rounds |

---

## 🗺️ Roadmap

```
Week 1–3:  Project 1 — Go REST API (learn Go fundamentals + build something)
Week 3–5:  Project 2 — Kafka Event System (can overlap with Project 1)
Week 5–7:  Project 3 — Resilient Payment Service (builds on Projects 1 & 2)
Week 1–10: Project 4 — Coding Practice (ongoing, 30–45 min daily)

         Week 1    Week 2    Week 3    Week 4    Week 5    Week 6    Week 7    Week 8
Proj 1:  ████████████████████████████
Proj 2:                    ████████████████████████
Proj 3:                                          ████████████████████████████
Proj 4:  ─────────────────────────────────────────────────────────────────────── (daily)
```

---

## 🏗️ Architecture Overview (How Projects Connect)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Personal Project Ecosystem                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────────────┐          │
│  │  Project 1       │         │  Project 2                │          │
│  │  Go REST API     │────────▶│  Kafka Event System       │          │
│  │  (Transactions)  │ events  │  (Consumer/Producer)      │          │
│  └────────┬─────────┘         └────────────┬─────────────┘          │
│           │                                 │                         │
│           │ calls                            │ processes               │
│           ▼                                 ▼                         │
│  ┌──────────────────────────────────────────────────────┐           │
│  │  Project 3 — Resilient Payment Service                │           │
│  │  (Circuit breakers, retries, idempotency, DLQ)        │           │
│  └──────────────────────────────────────────────────────┘           │
│                                                                       │
│  ┌──────────────────────────────────────────────────────┐           │
│  │  Project 4 — Coding Practice (daily, independent)     │           │
│  └──────────────────────────────────────────────────────┘           │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack Across Projects

| Technology | Project | Purpose |
|-----------|---------|---------|
| Go 1.22+ | 1, 2, 3 | Primary language (Monzo's stack) |
| PostgreSQL | 1, 3 | Persistent storage, ACID transactions |
| Apache Kafka | 2, 3 | Event streaming, async processing |
| Docker / Docker Compose | 1, 2, 3 | Local development environment |
| Redis | 3 | Idempotency key store, rate limiting |
| C# / .NET 8 | 4 | Coding practice (your strongest language) |

---

## ✅ Definition of Done (per project)

Each project is "done" when you can:

1. **Demo it** — run it locally and walk someone through what it does
2. **Explain the design** — draw the architecture from memory
3. **Discuss trade-offs** — why you chose X over Y
4. **Identify improvements** — what you'd change at 100x scale
5. **Push to GitHub** — clean README, clear commit history

---

## 💡 Interview Talking Points (what these projects give you)

After completing these projects, you can confidently say:

- "I built a REST API in Go with proper error handling, middleware, and testing"
- "I implemented a Kafka producer/consumer pipeline for transaction events"
- "I added circuit breakers and retry logic with exponential backoff"
- "I designed an idempotency layer to prevent duplicate payments"
- "I've solved 50+ coding problems across multiple pattern categories"

These directly map to Monzo's requirements:
- ✅ "Some experience with strongly-typed languages (Go)"
- ✅ "Interested in distributed systems and writing resilient software"
- ✅ "Strong experience working on the backend of a technology product"
