# 03 — Behavioural & Culture Fit (.NET Focus)

Behavioural interviews for .NET roles often probe your experience with the ecosystem — how you've handled migrations, legacy code, performance issues, and team decisions around architecture.

---

## The STAR Framework

```
S — Situation: Set the scene (1–2 sentences)
T — Task: What was your responsibility?
A — Action: What did YOU specifically do? (bulk of your answer)
R — Result: What was the measurable outcome?
```

---

## Question 1 — Legacy Migration

> "Tell me about a time you migrated a legacy .NET Framework application to .NET Core/modern .NET."

### What They're Looking For
- Pragmatic approach (not "rewrite everything")
- Risk management (incremental migration)
- Stakeholder communication

### Example Answer Structure

```
Situation: "We had a .NET Framework 4.7 monolith — 200K lines, MVC + Web API,
tightly coupled to System.Web and WCF services."

Task: "Migrate to .NET 6 to enable containerisation and reduce hosting costs."

Action:
- "Ran the .NET Upgrade Assistant to identify blockers — 40+ NuGet packages
  needed replacement, 3 had no .NET Core equivalent"
- "Proposed a strangler fig approach: new features in .NET 6 microservices,
  old app stays until traffic migrates"
- "Created a shared contracts library (netstandard2.0) so both could coexist"
- "Migrated the highest-traffic API first as a proof of concept"
- "Replaced WCF with gRPC for internal service communication"
- "Set up dual-running with feature flags to validate behaviour parity"

Result: "Migrated 70% of traffic in 6 months. Hosting costs dropped 40%
(Linux containers vs Windows VMs). Cold start improved from 8s to 1.2s.
Remaining 30% migrated over the next quarter."
```

### Follow-up Questions
- "What was the hardest part?" → Usually: replacing `HttpContext.Current` usage, `System.Web` dependencies
- "What would you do differently?" → Start with better test coverage before migrating

---

## Question 2 — Performance Investigation

> "Tell me about a time you diagnosed and fixed a performance problem in a .NET application."

### What They're Looking For
- Systematic approach (measure, don't guess)
- Knowledge of .NET profiling tools
- Understanding of common .NET performance pitfalls

### Key Points to Hit

```
Tools you should mention:
- dotnet-counters / dotnet-trace (runtime diagnostics)
- BenchmarkDotNet (micro-benchmarks)
- Application Insights / OpenTelemetry (distributed tracing)
- PerfView / dotMemory (memory profiling)
- SQL Server Profiler / EF Core logging (query analysis)

Common .NET performance issues:
- N+1 queries in EF Core
- Large Object Heap (LOH) fragmentation
- Excessive allocations in hot paths
- Synchronous blocking on async code
- Missing indexes (slow DB queries)
- Thread pool starvation (blocking calls in async context)
```

### Example Structure

```
Situation: "API response times spiked from 50ms to 2s under load."

Action:
- "Added distributed tracing (OpenTelemetry) — identified the slow span"
- "Found EF Core was generating N+1 queries (lazy loading in a loop)"
- "Used .Include() for eager loading, reducing 200 queries to 1"
- "Also found thread pool starvation — a sync HTTP call was blocking threads"
- "Replaced with async HttpClient call"

Result: "P95 latency dropped from 2s to 80ms. Thread pool queue depth
went from 500+ to near zero."
```

---

## Question 3 — Architecture Decision

> "Tell me about a significant architecture decision you made. How did you evaluate the options?"

### What They're Looking For
- Structured decision-making (ADR — Architecture Decision Record)
- Consideration of trade-offs
- Team alignment

### .NET-Specific Decisions to Draw From
- Monolith vs microservices
- EF Core vs Dapper vs raw ADO.NET
- MediatR/CQRS vs simple service layer
- Azure Functions vs Worker Services
- REST vs gRPC vs GraphQL
- Minimal APIs vs Controllers

### Example Structure

```
Situation: "Team debated whether to use MediatR + CQRS or a simple service layer
for our new order management system."

Action:
- "Wrote an ADR comparing both approaches against our requirements"
- "Built a spike: same feature implemented both ways"
- "Evaluated: team familiarity, testing ease, debugging complexity"
- "CQRS added value for our read-heavy, complex-domain use case"
- "But acknowledged: simpler services would be fine for our CRUD-heavy admin panel"

Result: "Adopted CQRS for the order domain, simple services for admin.
ADR documented the boundary criteria for when to use which pattern."
```

---

## Question 4 — Handling Technical Debt

> "How do you approach technical debt in a .NET codebase?"

### What They're Looking For
- You don't ignore it, but you don't gold-plate either
- You can quantify the cost of debt
- You have strategies for incremental improvement

### Framework

```
1. Identify: What's causing pain? (slow builds, frequent bugs, hard to change)
2. Quantify: "This costs us X hours/week" or "caused Y incidents"
3. Prioritise: Impact vs effort matrix
4. Propose: Incremental plan (not "stop everything and rewrite")
5. Execute: Boy Scout Rule + dedicated debt sprints
```

### .NET-Specific Debt Examples
- Outdated .NET version (missing security patches, no LTS support)
- No nullable reference types enabled (NullReferenceExceptions in prod)
- Synchronous database calls in async pipeline
- God classes / service locator anti-pattern
- Missing integration tests (only unit tests that mock everything)
- Tightly coupled to specific cloud provider without abstraction

---

## Question 5 — Mentoring on .NET

> "How have you helped junior developers become productive in the .NET ecosystem?"

### Points to Cover
- **Code review as teaching** — explain *why* `IAsyncDisposable` matters, not just "add `await using`"
- **Pairing on debugging** — show how to use `dotnet-trace`, read stack traces, interpret GC metrics
- **Architecture guidance** — when to use which pattern, avoiding over-engineering
- **Documentation** — decision records, runbooks, "how we do X" guides
- **Safe experimentation** — feature flags, PR environments for trying new approaches

---

## Question 6 — Incident Response (.NET Specific)

> "Describe a production incident in a .NET application. How did you diagnose it?"

### .NET-Specific Incident Patterns

| Symptom | Likely Cause | Diagnosis Tool |
|---------|-------------|----------------|
| Memory growing continuously | Memory leak (event handlers, static collections) | dotnet-dump, dotMemory |
| Requests timing out under load | Thread pool starvation | dotnet-counters (ThreadPool queue) |
| Intermittent 500 errors | Disposed DbContext / race condition | Structured logging + correlation IDs |
| High CPU, low throughput | GC pressure (Gen2 collections) | dotnet-counters (GC metrics) |
| Slow cold start | Large assembly loading, DI container build | Startup profiling, ReadyToRun |

---

## Question 7 — Working with Product/Business

> "Tell me about a time you translated a business requirement into a technical solution."

### Example Structure

```
Situation: "Business wanted 'real-time inventory updates' for the warehouse team."

Task: "Define what 'real-time' actually meant and build it within constraints."

Action:
- "Clarified: they needed updates within 5 seconds, not true real-time"
- "Proposed SignalR for the dashboard (push-based, no polling)"
- "Designed event-driven flow: inventory change → domain event → SignalR broadcast"
- "Built a prototype in 3 days to validate the approach with stakeholders"
- "Iterated based on feedback: added filtering by warehouse location"

Result: "Shipped in 2 weeks. Warehouse team reduced manual stock checks by 60%.
The 'real-time' requirement that seemed complex was actually straightforward
once we clarified the actual need."
```

---

## Questions to Ask the Interviewer (.NET Specific)

- "What .NET version are you on? Any plans to upgrade?"
- "How do you handle EF Core migrations in production?"
- "What's your testing strategy? Integration tests against real databases?"
- "Do you use any specific architectural patterns (CQRS, Clean Architecture, Vertical Slices)?"
- "How do you handle cross-cutting concerns (logging, auth, validation)?"
- "What's your deployment pipeline? Containers, App Service, or something else?"

---

## Common Mistakes

1. **Being too abstract** — use specific .NET technologies and version numbers
2. **Not mentioning tooling** — profilers, analyzers, and diagnostics show depth
3. **Ignoring the ecosystem** — NuGet packages, community libraries, Microsoft guidance
4. **Over-engineering stories** — sometimes the right answer is "we kept it simple"
5. **Not quantifying results** — "faster" → "P95 dropped from 2s to 80ms"
