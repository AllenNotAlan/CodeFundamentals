# 🎯 Interview Prep — Mid/Senior Engineering Roles

> Generic preparation for software engineering interviews at top tech companies.
> Level: Mid to Senior Software Engineer (IC3–IC5)

---

## 📚 Contents

> 💡 **New here? Read [System Design Building Blocks](./06-system-design-building-blocks.md) first.** It's the reusable toolkit (load balancing, caching, replication, partitioning, consistency, messaging, resilience) that the worked questions below assemble. Learn the blocks once, then the question-driven chapters show you how to compose them.

| # | Topic | Focus |
|---|-------|-------|
| 1 | [System Design](./01-system-design.md) | Scalable architectures, data flow, trade-offs |
| 2 | [Coding & Algorithms](./02-coding-algorithms.md) | Live coding, problem decomposition, optimal solutions |
| 3 | [Behavioural & Culture](./03-behavioural.md) | Ownership, collaboration, incident response, leadership |
| 4 | [API Design & Distributed Systems](./04-api-design-distributed-systems.md) | RESTful APIs, event-driven architecture, consistency |
| 5 | [Database & Data Modelling](./05-database-data-modelling.md) | Schema design, transactions, scaling patterns |
| 6 | [System Design Building Blocks](./06-system-design-building-blocks.md) | **Foundational toolkit** — the reusable components + DDIA reading map |

> 📖 Chapter 6 doubles as a reading map for *Designing Data-Intensive Applications* (Kleppmann), pointing each building block to the DDIA chapter that explains the theory beneath it.

---

## 🏢 What Top Tech Companies Look For

**Technical Bar:**
- Strong fundamentals (data structures, algorithms, complexity)
- System design at scale (millions of users, high throughput)
- API-first thinking — clean contracts, versioning, backward compatibility
- Understanding of distributed systems trade-offs (CAP, eventual consistency)

**Engineering Culture:**
- Ownership — you build it, you run it
- Collaboration — pairing, code review, RFCs
- Impact orientation — delivering measurable outcomes
- Incident response — structured debugging, clear communication under pressure
- Simplicity — prefer well-understood solutions over clever ones

**Interview Format (typical):**
1. **Phone screen** — 30–45 min coding or system design
2. **Take-home or live coding** — 60–90 min practical problem
3. **System design** — 45–60 min whiteboard/virtual
4. **Behavioural** — 45 min values & collaboration
5. **Bar raiser / team fit** — cross-team assessment

---

## 🗺️ How to Use This Guide

1. **Start with System Design** if you're senior — it's weighted heavily
2. **Start with Coding** if you're mid-level — it's the gatekeeper
3. **Don't skip Behavioural** — every company cares about culture fit
4. Work through each doc's questions, attempt answers before reading the solutions
5. Practice explaining your reasoning out loud — interviewers assess communication as much as correctness

---

## 🧭 Maintaining these docs (contributor note)

This set is the **canonical home** for general interview-prep theory. Domain tracks (e.g. `interview-prep-monzo`) are **thin overlays**: they link back to the canonical section here and add only domain-specific deltas.

**Rules to prevent duplication drift:**
- A concept lives in **one** place. If it's general (idempotency, Outbox, circuit breaker, versioning, index-selection rules, locking strategies, the latency table), it belongs here and carries a `📌 Canonical source` banner.
- Domain tracks must **link** to the canonical section, not copy it, and add only what's genuinely domain-specific (marked as a "delta").
- If you fix a canonical section, you fix it once — no parallel copies to chase.
- Deliberately different domain values (e.g. fintech scaling thresholds) must be **labelled as intentional** with a one-line reason, so they don't read as contradictions.
