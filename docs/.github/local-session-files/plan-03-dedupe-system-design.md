# Plan 3 — Fix duplication & drift in the system-design track

**Status:** PLAN ONLY — no source changes made for this item.
**Problem recap:** `generic/04` ≈ `monzo/04` (~85–90% identical: idempotency, Outbox, API-versioning, the entire `CircuitBreaker` class). `generic/05` ≈ `monzo/05` (same skeleton, indexing/locking prose, common-mistakes list). Already drifting: three divergent latency tables (generic/01, generic/06, monzo/01) and two scaling-threshold frameworks (generic/05 = 50M/500M, monzo/05 = 100M/1B). Any future fix must currently be made in up to three places.

**Goal:** Single source of truth for shared material; each track keeps only its genuine domain deltas. Model to emulate: `generic/06`, which is already the de-duplicated toolkit.

---

## Guiding principle

Generic = canonical, reusable theory. Monzo = thin fintech overlay that *links to* the canonical content and adds only payments/ledger/card-specific deltas. Never copy-paste a concept into both tracks.

---

## Step-by-step

### Phase A — Establish canonical homes (low risk, do first)
1. **Pick the canonical owner per shared concept:**
   - Idempotency keys → `generic/04` (with a payments example callout).
   - Outbox pattern → `generic/04` (and cross-linked from `generic/06 §7`).
   - API versioning / non-breaking-change rules → `generic/04`.
   - `CircuitBreaker` reference implementation → `generic/04` (single copy).
   - Latency "know your numbers" table → `generic/06 §9` (already the fullest). Make this THE table.
   - Scaling row-count thresholds → `generic/05` canonical; monzo/05 may state a fintech-adjusted variant *but must label it as deliberately different and say why* (higher retention/row counts).
2. **Add a short "canonical source" banner** at the top of each shared section in the generic files so future edits know this is the owner.

### Phase B — Convert Monzo duplicates into links + deltas
3. In `monzo/04`: replace the duplicated idempotency / Outbox / versioning / CircuitBreaker bodies with:
   - a one-line summary,
   - a link to the generic section,
   - the fintech delta only (e.g. 202-Accepted for payments, fraud-service circuit-breaker fallback). Keep the *delta*, drop the *copy*.
4. In `monzo/05`: keep the genuinely fintech-specific Q1/Q2 (double-entry ledger, ledger-vs-transactions separation) and the FCA/PSD2+GDPR delete content. Replace the shared indexing/locking/common-mistakes prose with links to `generic/05` plus any fintech note.
5. In `monzo/01`: keep all five worked fintech designs (these are the point). Replace the shared 5-step framework and "know your numbers" block with a link to the generic framework + `generic/06 §9` table. (Partially done already: monzo/01 now links to §9 and carries a disclaimer — finish by trimming the figures to a short "fintech-relevant subset" or removing the local copy entirely.)

### Phase C — Reconcile the known drift
6. **Latency numbers:** make `generic/06 §9` authoritative; delete or link-replace the copies in `generic/01` and `monzo/01`. Reconcile cross-region to one value (recommend ~100–150ms; drop the 50–150ms variant).
7. **Scaling thresholds:** state the generic thresholds once; in monzo/05 present the fintech variant explicitly as "adjusted for financial-data retention" so the difference reads as intentional, not a contradiction.

### Phase D — Prevent regression
8. Add a short `CONTRIBUTING`-style note (or a comment block in each README) stating the generic=canonical / monzo=overlay rule, so new content doesn't re-introduce copies.
9. Optional: a tiny link-check script (the repo already has a Node generator) that fails if a monzo file re-duplicates a canonical section heading verbatim.

---

## Verification
- After edits, regenerate the HTML app (`node study-html/_build/convert-v2.mjs`) and confirm chapter count unchanged and no broken in-app anchors.
- Grep for the `CircuitBreaker` class body — it should appear once.
- Grep the three latency tables — only `generic/06 §9` should contain the full table; others link to it.
- Diff `generic/04` vs `monzo/04` — shared prose should now be near-zero; only domain deltas remain.

## Risk / sequencing
- Low risk, content-only. Do Phase A+C first (cheap, high drift-prevention value), then B (larger edit), then D.
- Keep each phase a separate commit so the HTML regen diff stays reviewable.

## Effort estimate
- Phase A+C: ~1 sitting. Phase B: the bulk (rewriting two monzo files to link-and-delta). Phase D: minor.
