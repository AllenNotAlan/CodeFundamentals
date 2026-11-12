# Plan 7 — Add a simple "problem + example" lead-in to every Essential Pattern

**Status:** PLAN ONLY — no chapter files have been changed.
**Scope:** `docs/code-learning/01` to `16` (plus regenerating `study-html/study.html`).

**Problem recap:** Each chapter opens with "Essential Patterns" / "Patterns with Code". Many of them show code straight away, or only describe the *technique* ("keep a min-heap of size K") without saying what *problem* it solves. The reader sees the pattern before they know why they would want it. Example: `02 → #3 Complement / Pair Lookup` and `#4 Grouping with a Dictionary` use variables (`nums`, `target`, `words`) that are never introduced.

**Goal:** Before each pattern's code, give a 2–3 line plain-English problem and a tiny input → output example, so the pattern reads as the answer to a question.

---

## Hard constraints (from the user)
- Do **not** change any existing code, comments, examples, ordering, headings or the practice problems.
- Only **add** short lead-in text immediately under each pattern heading (and, at most, re-point existing sentences that now sit below it).
- Keep each lead-in to ~2–3 lines. This is a hook, not a second Practice Problem.

---

## The lead-in format (one house style)
Reuse the labels already used in Practice Problems so the chapters feel consistent:

```markdown
### 3. Complement / Pair Lookup
**Task:** Given a list of numbers and a target, find the two numbers that add up to the target.
**Example:** `nums = [2, 7, 11, 15]`, `target = 9` → `[0, 1]` (because 2 + 7 = 9)

Store what you *need* so far, check if the current element satisfies it.   <-- existing text, untouched
```csharp
...existing code...
```
```

Rules:
1. **Task** is one sentence, concrete, no jargon from the pattern itself (don't say "complement" in the task).
2. **Example** is the smallest input that shows the idea. Where the existing code already has sample data (e.g. `{ 1, 5, 3, 5, 2 }` in 02 #2), **reuse that data** so the lead-in matches the code below it.
3. Where the pattern *is* a Practice Problem (e.g. 02 #3 = Problem 1 Two Sum), keep the lead-in to the above two lines and add: `*(Full walkthrough: Problem 1 below.)*` instead of re-explaining.
4. Where a pattern's text already states the problem well (e.g. 12 "Pruning" names Combination Sum), only add the missing **Example** line.
5. If the code uses undefined variables (`nums`, `target`, `words`), the **Example** line defines them.

---

## Audit — what each chapter needs

Legend: **A** = code with no intro at all → add Task + Example.
**B** = has a technique description but no concrete problem → add Task + Example above it.
**C** = already names the problem → add Example line only (or nothing).

| Ch | Pattern (line in current file) | Now | Action |
|----|-------------------------------|-----|--------|
| 01 | 1. Iterate with index (22) | A | Task + Example |
| 01 | 2. Prefix & Suffix (37) | C | Has rich prose; add a 1-line Example only (e.g. running total) |
| 01 | 3. Reverse in-place (106) | A | Task + Example |
| 01 | 4. StringBuilder (131) | A | Task + Example (why: build a string from many parts) |
| 02 | 1. Frequency Count (28) | B | Add Task + Example (data `{1,2,2,3,3,3}` already in code) |
| 02 | 2. "Have I seen this before?" (65) | A | Task + Example (data `{1,5,3,5,2}` already in code) |
| 02 | 3. Complement / Pair Lookup (94) | B | Task + Example; link to Problem 1 |
| 02 | 4. Grouping with a Dictionary (115) | A | Task + Example (anagram groups) |
| 03 | Pattern 1: Opposite-end (36) | A | Task + Example; link to Problem 2 (Two Sum II) |
| 03 | Pattern 2: Fast/slow dedupe (89) | A | Task + Example |
| 04 | Fixed window (31) | A | Task + Example; link to Problem 1 |
| 04 | Variable window (74) | A | Task + Example |
| 05 | Matching brackets (44) | A | Task + Example; link to Problem 1 |
| 05 | Monotonic stack (81) | B | Task + Example; link to Problem 4 |
| 05 | Queue: BFS level-by-level (113) | A | Task + Example |
| 06 | Built-in sorting (11) | A | Short Task + Example (sort by a key) |
| 06 | Standard template (78) | A | Task + Example; link to Problem 1 |
| 06 | Leftmost / rightmost (136) | B | Task + Example (duplicates in array) |
| 07 | 1. Traversal (46) | A | Task + Example |
| 07 | 2. Dummy head (62) | B | Task + Example (delete head / merge) |
| 07 | 3. Fast & slow (78) | B | Task + Example (find the middle) |
| 08 | DFS three orders (70) | A | Task + Example (print the tree in each order) |
| 08 | BFS level order (117) | B | Task + Example |
| 09 | — | n/a | No pattern blocks (concepts + thought process). **Skip** unless the user wants it. |
| 10 | P1 DFS (59) | B | Task + Example (can A reach B?); link to Problem 1 |
| 10 | P2 BFS (91) | B | Task + Example (fewest steps) |
| 10 | P3 Topological Sort (134) | B | Task + Example (course order); link to Problem 2 |
| 10 | P4 Union-Find (166) | B | Task + Example (count groups); link to Problem 4 |
| 11 | P1 Top-K (84) | B | Task + Example; link to Problem 1/2 |
| 11 | P2 Merge K sorted (111) | B | Task + Example; link to Problem 4 |
| 11 | P3 Running median (141) | B | Task + Example (stream of numbers) |
| 12 | P1 Subsets (56) | B | Task + Example (`[1,2,3]`) |
| 12 | P2 Permutations (98) | B | Task + Example |
| 12 | P3 Pruning (153) | C | Example only (target 7, candidates `[2,3,5]`) |
| 13 | P1 Knapsack (32) | B | Task + Example (small weights/values) |
| 13 | P2 LIS (72) | C | Add Example (`[10,9,2,5,3,7]` → 3) |
| 13 | P3 Min Path Sum (110) | C | Add small grid Example |
| 13 | P4 Edit Distance (151) | C | Add Example (`"horse"` → `"ros"` = 3) |
| 14 | — | n/a | Method chapter, no pattern blocks. **Skip.** |
| 15 | P1 Interval scheduling (44) | B | Task + Example; stub with no code, so point to Problem 2 |
| 15 | P2 Reach / jump (47) | B | Task + Example; point to Problem 3/4 |
| 15 | P3 Exchange argument (50) | B | Example only — it is a proof technique, not a coding task |
| 16 | Build the node once (40) | B | Task + Example (autocomplete by prefix) |

Totals: ~40 patterns across 14 chapters. About 17 are type A (highest value), ~19 type B, ~6 type C.

---

## Suggested drafts for the two the user called out (Hash Maps & Sets)

**#3 Complement / Pair Lookup**
> **Task:** Given a list of numbers and a target, find the two numbers that add up to the target and return their positions.
> **Example:** `nums = [2, 7, 11, 15]`, `target = 9` → `[0, 1]` (2 + 7 = 9)
> *(Full walkthrough: Problem 1 below.)*

**#4 Grouping with a Dictionary**
> **Task:** Given a list of words, group together the words that are anagrams of each other.
> **Example:** `words = ["eat", "tea", "tan", "ate", "nat", "bat"]` → `[["eat","tea","ate"], ["tan","nat"], ["bat"]]`

(Both match the variables the existing code already assumes: `nums`, `target`, `words`.)

---

## Execution phases

Work is split into **one phase per chapter** (the "section" unit). Each phase is small enough to review on its own and ends at a **review gate**: nothing in the next chapter starts until the user approves the current one. Chapter 02 goes first as the pilot so the format is settled before it is repeated.

### Standard steps (apply inside every chapter phase)
1. **Read** the chapter's pattern blocks (code + comments) so the Task/Example matches the variables and sample data already used.
2. **Draft** the lead-ins per the format rules above and show them to the user (or apply them if the user has said "just do it" for that phase).
3. **Insert** only new lines directly under each pattern heading. No existing line is edited or deleted.
4. **Check** with `git diff docs/code-learning/NN-*.md`: only `+` lines. Any `-` line (other than blank-line shuffles) is a bug and gets reverted.
5. **Gate:** user reviews the diff; wording tweaks are fed back into the template before the next phase.

### Phase 0 — Pilot: `02-hash-maps-and-sets.md`  *(do first)*
| Pattern | Action |
|---------|--------|
| 1. Frequency Count | Task + Example (reuse `{1,2,2,3,3,3}`) |
| 2. "Have I seen this before?" | Task + Example (reuse `{1,5,3,5,2}`) |
| 3. Complement / Pair Lookup | Task + Example, link to Problem 1 (drafts above) |
| 4. Grouping with a Dictionary | Task + Example (drafts above) |

Gate: confirm label wording (`Task`/`Example`), length, and the link-to-Problem style. Answers to the open questions below are applied to the template here.

### Phase 1 — `01-arrays-and-strings.md`
- 1. Iterate with index (A): Task + Example
- 2. Prefix & Suffix (C): one-line Example only (existing prose is already rich)
- 3. Reverse in-place (A): Task + Example
- 4. StringBuilder (A): Task + Example
- Extra check: patterns 1, 3 relate to Practice Problems 1–2; link rather than repeat.

### Phase 2 — `03-two-pointers.md`
- Pattern 1 Opposite-end (A): Task + Example, link to Problem 2 (Two Sum II)
- Pattern 2 Fast/slow dedupe (A): Task + Example
- Extra check: don't reuse the exact Problem 2 example; keep the lead-in smaller.

### Phase 3 — `04-sliding-window.md`
- Fixed window (A): Task + Example, link to Problem 1
- Variable window (A): Task + Example
- Extra check: make the fixed vs variable contrast obvious from the two Tasks alone.

### Phase 4 — `05-stacks-and-queues.md`
- Matching brackets (A): Task + Example, link to Problem 1
- Monotonic stack (B): Task + Example above the existing sentence, link to Problem 4
- Queue: BFS level-by-level (A): Task + Example (small tree/levels)

### Phase 5 — `06-sorting-and-binary-search.md`
- Built-in sorting (A): short Task + Example (sort by a key)
- Standard template (A): Task + Example, link to Problem 1
- Leftmost / rightmost (B): Task + Example with duplicates in the array
- Extra check: the sorting section is reference material, so keep its lead-in to a single line if a full Task feels forced (flag to user).

### Phase 6 — `07-linked-lists.md`
- 1. Traversal (A): Task + Example
- 2. Dummy head (B): Task + Example (e.g. remove a value that may be the head)
- 3. Fast & slow (B): Task + Example (find the middle)
- Extra check: show the list as `1 → 2 → 3` in Examples for readability.

### Phase 7 — `08-trees-and-recursion.md`
- DFS three orders (A): Task + Example (print a small tree in each order)
- BFS level order (B): Task + Example
- Extra check: reuse the tree already drawn in "Tree vocabulary" so the reader sees one consistent tree.

### Phase 8 — `10-graphs.md`
- P1 DFS (B): Task + Example (is B reachable from A?), link to Problem 1
- P2 BFS (B): Task + Example (fewest steps), link to Problem 5
- P3 Topological Sort (B): Task + Example (course order), link to Problem 2
- P4 Union-Find (B): Task + Example (count groups), link to Problem 4
- Extra check: use one small shared graph across P1–P2 if it fits the existing code.

### Phase 9 — `11-heaps-priority-queues.md`
- P1 Top-K (B): Task + Example, link to Problems 1/2
- P2 Merge K sorted (B): Task + Example, link to Problem 4
- P3 Running median (B): Task + Example (stream of numbers, median after each)

### Phase 10 — `12-backtracking.md`
- P1 Subsets (B): Task + Example (`[1,2,3]`)
- P2 Permutations (B): Task + Example
- P3 Pruning (C): Example only (target 7, candidates `[2,3,5]`); keep the existing Combination Sum wording
- Extra check: Examples list full outputs, so keep inputs to 3 elements max.

### Phase 11 — `13-dynamic-programming-patterns.md`
- P1 Knapsack (B): Task + Example (small weights/values/capacity)
- P2 LIS (C): Example only (`[10,9,2,5,3,7]` → 3)
- P3 Min Path Sum (C): Example only (small grid)
- P4 Edit Distance (C): Example only (`"horse"` → `"ros"` = 3)
- Extra check: confirm each Example's answer by hand (or a quick run) before writing it.

### Phase 12 — `15-greedy.md`
- P1 Interval scheduling (B): Task + Example, point to Problem 2
- P2 Reach / jump (B): Task + Example, point to Problems 3/4
- P3 Exchange argument (B): Example only (proof technique, not a coding task)
- Extra check: these patterns have no code blocks, so lead-ins must not duplicate the Practice Problems.

### Phase 13 — `16-tries.md`
- Build the node once (B): Task + Example (autocomplete by prefix), link to Problem 1

### Skipped chapters
- `09-dynamic-programming-intro.md` and `14-pattern-recognition.md` have no pattern blocks. Revisit only if the user answers "yes" to open question 3.

### Final Phase — Regenerate HTML and verify
1. Run `study-html/_build/convert-v2.mjs` with Node to regenerate `study-html/study.html` (command to be confirmed on first run). Regenerate once at the end by default; if the user wants to preview a chapter earlier, regenerate after Phase 0 as well.
2. Spot-check in the browser: lead-ins render in every changed chapter, and code blocks, copy buttons and the per-chapter TOC are unchanged.
3. Run a full `git diff --stat` across `docs/code-learning/` and confirm additions-only.
4. If `Tests/` covers any of the doc code samples, run `dotnet test` (expected: no impact, prose-only change).
5. Record the final status in this plan file (chapters done / skipped / deferred).

### Progress tracker (update as phases complete)
| Phase | Chapter | Status |
|-------|---------|--------|
| 0 | 02 Hash Maps & Sets (pilot) | **done** (old one-line descriptions on patterns 1 and 3 dropped per user decision) |
| 1 | 01 Arrays & Strings | **done** |
| 2 | 03 Two Pointers | **done** |
| 3 | 04 Sliding Window | **done** |
| 4 | 05 Stacks & Queues | **done** |
| 5 | 06 Sorting & Binary Search | **done** |
| 6 | 07 Linked Lists | **done** |
| 7 | 08 Trees & Recursion | **done** |
| 8 | 10 Graphs | **done** |
| 9 | 11 Heaps & Priority Queues | **done** |
| 10 | 12 Backtracking | **done** |
| 11 | 13 DP Patterns | **done** |
| 12 | 15 Greedy | **done** |
| 13 | 16 Tries | **done** |
| Final | Regenerate HTML + verify | **done** (study.html regenerated via `node study-html/_build/convert-v2.mjs`; 41 lead-ins render; diffs additions-only apart from the 2 intentional removals in ch02) |

---

## Open questions for the user
1. **Review gates:** The plan stops for review after every chapter. Do you want that, or fewer stops (e.g. review after each group of chapters)?
2. **Labels:** Is `**Task:** / **Example:**` the right wording, or would you prefer something friendlier such as `**Scenario:**`?
3. **Chapters 09 and 14:** Skip (no pattern blocks), or add a lead-in to the 09 "Two approaches" section too?
4. **Pattern 3 vs Problem 1 overlap (ch02):** Is a short lead-in plus a link acceptable, or should the pattern use a *different* example from Two Sum to avoid duplication?
5. **Python snippets:** Where a pattern shows both C# and Python, the single lead-in sits above both. Confirm that's what you want.

---

## Explicitly NOT doing
- Not changing, reordering or rewording any existing code, comments, explanations or Practice Problems.
- Not adding new practice problems or new patterns.
- Not editing `study.html` by hand; it is regenerated from the markdown only.
- Not touching `README.md`, `DEVELOPMENT.md`, or the interview-prep / personal-projects docs.


---
## Execution notes (all phases)
- 41 lead-ins added across 14 chapters (ch02: 4, 01: 4, 03: 2, 04: 2, 05: 3, 06: 3, 07: 3, 08: 2, 10: 4, 11: 3, 12: 3, 13: 4, 15: 3, 16: 1).
- Decisions applied: labels `Task`/`Example` kept; old one-line descriptions on ch02 patterns 1 and 3 removed. No other existing line was changed.
- Deviation from plan: type-C patterns (01 #2, 12 P3, 13 P2-P4) got a short Task as well as the Example, so the Example does not appear without context.
- Chapters 09 and 14 skipped (no pattern blocks).
- `dotnet` build/tests not run: only markdown and the generated HTML changed.
