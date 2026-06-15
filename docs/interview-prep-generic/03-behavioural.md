# 03 — Behavioural & Culture Fit

Every strong tech company weights behavioural interviews heavily. They're hiring people who'll own production systems, collaborate effectively, and grow with the team.

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
Situation: "I owned the search indexing pipeline — it processed updates from
our main database and kept the search index in sync."

Task: "One morning, users reported search results were 6 hours stale."

Action:
- "I immediately checked monitoring — the consumer had stopped processing
  due to a schema change in an upstream event"
- "Raised an incident, communicated impact to stakeholders in Slack"
- "Deployed a fix to handle the new schema, then backfilled the gap"
- "Added schema validation at the consumer boundary with clear error alerts"
- "Proposed a contract-testing approach between producer and consumer teams"

Result: "Index caught up within 2 hours. The schema validation caught 3 similar
issues in the following month before they affected users. Contract testing
became a team standard."
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
Situation: "The team wanted to build a custom event bus. I believed we should
use a managed service like Kafka or SQS."

Task: "I needed to either convince the team or accept their decision."

Action:
- "I wrote a short RFC comparing both options: build cost, maintenance burden,
  reliability guarantees, and team expertise"
- "Ran a spike: estimated 3 months to build vs 2 weeks to integrate managed service"
- "Presented findings at team meeting — highlighted the ongoing ops cost of
  maintaining a custom solution"
- "Acknowledged the custom approach's advantage (full control over semantics)"

Result: "Team chose the managed service. We shipped 10 weeks earlier than the
custom approach would have allowed. The RFC became a template for future
build-vs-buy decisions."
```

### If You Lost the Argument

```
"Ultimately the team chose the other approach. I committed to making it work,
helped implement it, and it turned out fine. I learned that [specific insight]."
```

This is a STRONG answer — it shows maturity.

---

## Question 4 — Product Thinking

> "Tell me about a time you pushed back on a requirement or suggested a better approach."

### What They're Looking For
- You understand the *why* behind features, not just the *what*
- You can identify when a simpler solution achieves the same goal
- You collaborate with product/stakeholders, not just take orders

### Example Answer Structure

```
Situation: "Product wanted to build a full admin dashboard with 20+ filters,
export functionality, and real-time updates."

Task: "Estimate was 8 weeks. I thought we could deliver 80% of the value faster."

Action:
- "Looked at support tickets: 85% of admin queries used only 3 filters"
- "Proposed: ship the top 3 filters in 2 weeks, measure usage, then iterate"
- "Worked with product to define success metrics before building"

Result: "Shipped in 2 weeks. Usage data confirmed only 5% of admins needed
advanced filters. We built those later as a lower-priority enhancement,
freeing the team to work on higher-impact features."
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
- Giving feedback that's specific, actionable, and kind

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

**Good example:** "I deployed a config change without testing the rollback path. It caused 15 minutes of downtime for 10% of users. I rolled forward with a fix, wrote a postmortem, and now I always test rollbacks in staging and use feature flags for risky changes."

---

## Values Most Tech Companies Share

| Value | How to demonstrate |
|-------|-------------------|
| **Ownership** | "I didn't wait to be asked — I saw the problem and fixed it" |
| **Bias for action** | "We shipped an MVP in 2 weeks, then iterated based on data" |
| **Customer focus** | "I looked at support tickets / user feedback to understand the real problem" |
| **Collaboration** | "I paired with the other team to understand their constraints" |
| **Continuous improvement** | "After the incident, I set up monitoring so we'd catch it earlier next time" |
| **Simplicity** | "I chose the boring, well-understood approach over the clever one" |

---

## Questions to Ask the Interviewer

Always have 2–3 prepared:

- "How does the on-call rotation work? What's the typical incident frequency?"
- "What does the RFC/design review process look like?"
- "How do teams decide what to build next? How much autonomy do engineers have?"
- "What's the biggest technical challenge the team is facing right now?"
- "How do you handle tech debt? Is there dedicated time for it?"
- "What does career progression look like for engineers here?"
- "How do you measure engineering productivity or success?"

---

## Common Mistakes in Behavioural Interviews

1. **Being too vague** — use specific numbers, dates, outcomes
2. **"We" instead of "I"** — they want to know YOUR contribution
3. **No result** — always quantify the outcome
4. **Only positive stories** — showing vulnerability and learning is stronger
5. **Rehearsed scripts** — have bullet points, not memorised paragraphs
6. **Not asking questions** — signals disinterest
