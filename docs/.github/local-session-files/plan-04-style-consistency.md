# Plan 4 — Resolve the style seam between coding chapters 01–09 and 10–14

**Status:** PLAN ONLY — no source changes made for this item.
**Problem recap:** Chapters 10–14 (newer) added devices that 01–09 lack: a "Builds on" callout, decision/selection tables, and ⭐/⭐⭐ difficulty stars on "Try Now" lists. 01–09 are also more siloed (they forward-hint but rarely link back) and sometimes have partial dual-language coverage (e.g. ch07 #876 is C#-only). The additions are all improvements — the fix is to **level 01–09 up to the 10–14 house style**, not to strip 10–14 down.

**Goal:** One coherent house style across all 14 chapters, so the collection reads as a single progression rather than two eras.

---

## Target house style (derived from 10–14, the stronger set)
Every chapter should have, in order:
1. `# NN — Title`
2. Short intro paragraph.
3. **"> Builds on:"** blockquote linking the prior chapters it depends on (skip only for ch01).
4. `## Core Concepts`
5. `## Patterns` / `## Essential Patterns`
6. At least one **decision/selection table** ("when do I reach for X vs Y?").
7. `## Practice Problems` — each with Task / Example / Solution, **dual C# + Python**, and a `⏱ Time / Space` footer.
8. `## Common Mistakes`
9. `## LeetCode Problems to Try Now` — with ⭐ (starter) / ⭐⭐ (stretch) difficulty stars.
10. Optional `## Where to go next` with forward links.

---

## Step-by-step

### Phase A — Audit (cheap, do first)
1. Build a small checklist matrix: rows = chapters 01–09, columns = the 10 house-style elements above. Mark present/absent/partial. (Known gaps: no "Builds on" callouts in 01–09; inconsistent ⭐ usage; no ⭐⭐; some decision tables missing; ch07 #876 Python missing.)

### Phase B — Add the connective tissue to 01–09 (highest value)
2. **Add a "> Builds on:" callout** to chapters 02–09 (ch01 is the root). Examples:
   - 02 → 01 (iteration), 03 → 02 (hash set) + 01, 04 → 03, 05 → (standalone, forward-links 08), 06 → 01, 07 → 01, 08 → 05 (BFS/queue) + recursion, 09 → 08 (recursion).
3. **Add back-links** where 01–09 currently only forward-hint, so navigation is bidirectional (e.g. ch01's hash-map/two-pointer previews should link forward; ch03/ch08 should link back to the concepts they reuse).

### Phase C — Normalise tables and difficulty markers
4. **Add one decision/selection table** to any 01–09 chapter missing one (e.g. ch03 "two-pointers vs hash map", ch06 "sort-first vs binary-search", ch09 already has DP-vs-Greedy — keep).
5. **Standardise difficulty stars** across ALL 14 chapters: ⭐ = starter, ⭐⭐ = stretch. Apply consistently in every "Try Now" list, including 01–09.

### Phase D — Fill dual-language gaps
6. Sweep 01–09 for solutions that are C#-only or Python-only (known: ch07 #876; check ch11/ch14 one-liner Python like `heapq.nlargest` → consider a parallel full implementation for consistency, or explicitly mark it a "shortcut" note).
7. Ensure every Practice Problem has the `⏱ Time / Space` footer.

### Phase E — Scope decision (confirm with user before doing)
8. Decide whether the **capstone forward-reference** style (ch14 linking everything) should be mirrored by a short "where this leads" footer in 01–09. Optional polish, not required.

---

## Explicitly NOT doing
- Not rewriting the teaching content of any chapter.
- Not downgrading 10–14 to match 01–09.
- Not renumbering chapters (the 1→14 order is already clean).

## Verification
- Re-run the house-style matrix from Phase A — every cell should be present.
- Regenerate the HTML app and confirm all "Builds on" links resolve to valid in-app anchors.
- Spot-check that ⭐/⭐⭐ render consistently in the app.

## Risk / effort
- Low risk, purely additive. Phase B is the highest value (connective tissue). Phases C/D are mechanical polish. ~1–2 sittings total.
