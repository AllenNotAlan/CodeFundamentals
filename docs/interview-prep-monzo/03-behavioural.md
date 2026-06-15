# 03 — Behavioural & Culture Fit

Fintech companies like Monzo weight behavioural interviews heavily. They're hiring people who'll own production systems handling real money — they need to trust your judgement, communication, and values.

---

## The STAR Framework

Structure every answer using STAR:

```
S — Situation: Set the scene (1–2 sentences)
T — Task: What was your responsibility?
A — Action: What did YOU specifically do? (bulk of your answer)
R — Result: What was the measurable outcome?
```

**Pro tip:** End with what you learned or would do differently. This shows growth mindset.

---

## Question 1 — Ownership & Accountability

> "Tell me about a time you owned a system or feature end-to-end. What happened when something went wrong?"

### What They're Looking For
- You don't throw problems over the wall
- You take responsibility for production issues
- You proactively improve things, not just react

### Example Answer Structure

```
Situation: "I owned the payment reconciliation service — it matched our internal
ledger against bank statements daily."

Task: "One Monday morning, reconciliation flagged £200K in unmatched transactions
from the weekend."

Action:
- "I immediately raised an incident (P2) and communicated to the team in Slack"
- "Investigated: a schema migration on Friday had changed a column type,
  causing the matching logic to silently skip certain transactions"
- "Wrote a backfill script to reprocess the weekend's transactions"
- "Added monitoring: alert if unmatched rate exceeds 0.1%"
- "Proposed a pre-merge checklist for schema changes affecting downstream consumers"

Result: "All transactions reconciled within 4 hours. The new alert caught a
similar issue 3 weeks later before it affected customers. The checklist became
team standard."
```

### Follow-up Questions to Expect
- "What would you do differently?"
- "How did you communicate the issue to stakeholders?"
- "How did you prevent it from happening again?"

---

## Question 2 — Incident Response

> "Describe a production incident you were involved in. How did you handle it?"

### What They're Looking For
- Calm under pressure
- Structured debugging approach
- Clear communication during the incident
- Blameless postmortem thinking

### Key Points to Hit

```
During the incident:
  1. Assess impact (who's affected? how many users?)
  2. Communicate early (status page, Slack, stakeholders)
  3. Mitigate first, root-cause later (rollback, feature flag, redirect)
  4. Keep a timeline of actions

After the incident:
  1. Blameless postmortem
  2. Timeline of events
  3. Root cause (5 Whys)
  4. Action items with owners and deadlines
```

### Red Flags (what NOT to say)
- "It was the other team's fault"
- "I waited for someone senior to tell me what to do"
- "We didn't have monitoring so we didn't know"

---

## Question 3 — Collaboration & Disagreement

> "Tell me about a time you disagreed with a technical decision. How did you handle it?"

### What They're Looking For
- You can disagree constructively
- You use data/evidence, not authority or emotion
- You can commit to a decision even if you disagree (disagree and commit)

### Example Answer Structure

```
Situation: "The team wanted to use MongoDB for our new transaction store.
I believed PostgreSQL was the better choice."

Task: "I needed to either convince the team or accept their decision."

Action:
- "I wrote a short RFC comparing both options against our requirements:
  ACID transactions, query patterns, operational complexity"
- "Ran a proof-of-concept: modelled our access patterns in both databases"
- "Presented findings at team meeting — Postgres was 3x faster for our
  read-heavy, join-heavy workload"
- "Acknowledged MongoDB's strengths (schema flexibility for our config store)"

Result: "Team chose Postgres for the transaction store, MongoDB for config.
The RFC became a template for future tech decisions."
```

### If You Lost the Argument

```
"Ultimately the team chose the other approach. I committed to making it work,
helped implement it, and it turned out fine. I learned that [specific insight]."
```

This is a STRONG answer — it shows maturity.

---

## Question 4 — Product Thinking

> "Tell me about a time you pushed back on a product requirement or suggested a better approach."

### What They're Looking For
- You understand the *why* behind features, not just the *what*
- You can identify when a simpler solution achieves the same goal
- You collaborate with product, not just take orders

### Example Answer Structure

```
Situation: "Product wanted to build a full transaction search with 15 filters,
date ranges, and export to CSV."

Task: "Estimate was 6 weeks. I thought we could deliver 80% of the value faster."

Action:
- "Looked at analytics: 90% of searches used only amount, merchant, or date"
- "Proposed: ship the top 3 filters in 2 weeks, measure usage, then iterate"
- "Worked with product to define success metrics before building"

Result: "Shipped in 2 weeks. Usage data confirmed only 4% of users needed
advanced filters. We built those later as a lower-priority enhancement."
```

---

## Question 5 — Mentoring & Growing Others

> "How have you helped other engineers grow?" (Senior-level question)

### What They're Looking For
- You multiply your impact through others
- You give constructive feedback
- You create systems/processes, not just 1:1 help

### Points to Cover
- Code review as a teaching tool (explain *why*, not just *what*)
- Pairing sessions on complex problems
- Writing documentation that unblocks others
- Creating runbooks for on-call
- Sponsoring someone for a stretch project

---

## Question 6 — Working Under Constraints

> "Tell me about a time you had to deliver something with tight constraints (time, resources, technical debt)."

### What They're Looking For
- You can scope ruthlessly
- You communicate trade-offs to stakeholders
- You don't gold-plate under pressure
- You document what you cut and plan to revisit

### Framework for Answering

```
1. What was the constraint? (deadline, team size, legacy system)
2. What did you cut? (and how did you decide what to cut?)
3. What did you ship?
4. What was the plan for the cut scope?
5. Did you follow through on that plan?
```

---

## Question 7 — Failure & Learning

> "Tell me about a time you made a mistake that affected users or the business."

### What They're Looking For
- Honesty and self-awareness
- You take responsibility (not "the process failed")
- You learned something concrete
- You changed your behaviour as a result

### Structure

```
"I [specific mistake]. It caused [specific impact].
I [how I fixed it]. I learned [specific lesson].
Since then, I [concrete behaviour change]."
```

**Good example:** "I deployed a migration without testing the rollback path. It corrupted 200 user records. I wrote a data repair script, communicated to affected users, and now I always test rollbacks in staging first."

---

## Monzo-Specific Values to Demonstrate

Based on public information about Monzo's engineering culture:

| Value | How to demonstrate |
|-------|-------------------|
| **Default to transparency** | "I shared the incident timeline publicly with the team" |
| **Think big, start small** | "We shipped an MVP in 2 weeks, then iterated" |
| **Make Monzo a great place to work** | Mentoring, inclusive practices, documentation |
| **Move fast with confidence** | Feature flags, gradual rollouts, monitoring |
| **Customer obsession** | "I looked at support tickets to understand the real problem" |

---

## Questions to Ask the Interviewer

Always have 2–3 prepared. Good ones for fintech:

- "How does the on-call rotation work? What's the typical incident frequency?"
- "How do you balance speed of delivery with regulatory requirements?"
- "What does the RFC/design review process look like?"
- "How do teams decide what to build next? How much autonomy do engineers have?"
- "What's the biggest technical challenge the team is facing right now?"
- "How do you handle tech debt? Is there dedicated time for it?"

---

## Common Mistakes in Behavioural Interviews

1. **Being too vague** — use specific numbers, dates, outcomes
2. **"We" instead of "I"** — they want to know YOUR contribution
3. **No result** — always quantify the outcome
4. **Only positive stories** — showing vulnerability and learning is stronger
5. **Rehearsed scripts** — have bullet points, not memorised paragraphs
6. **Not asking questions** — signals disinterest
