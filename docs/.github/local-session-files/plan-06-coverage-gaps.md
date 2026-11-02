# Plan 6 — Close coverage gaps (coding patterns + Monzo/fintech system design)

**Status:** PLAN ONLY — no source changes made for this item.
**Problem recap:** Two kinds of gaps.
- **Coding track:** no greedy chapter (only a contrast table in ch09), no tries/prefix-trees, no bit-manipulation, and Dijkstra/weighted shortest path explicitly deferred in ch10.
- **System-design track (Monzo-specific):** consensus/quorum is a one-liner despite Monzo's Cassandra/Kafka/consensus stack; no worked auth-vs-settlement (dual-message) lifecycle; no reversals/chargebacks modelled as ledger operations; thin on observability/on-call despite the "fix it at 3am" claim; multi-currency FX named but not modelled; regulatory (SCA/PSD2, KYC/AML) only touched in the delete section.

**Goal:** Fill the gaps that a Monzo-style coding + system-design interview actually probes, **prioritised by interview likelihood**, without bloating the set.

---

## Prioritisation (do high-impact first)

### Tier 1 — High interview value, do first
**Coding:**
1. **Greedy chapter (new ch15, or a section).** Interval scheduling, jump game, activity selection, greedy-vs-DP decision. Highest-value coding gap — greedy shows up constantly and currently has no home.
2. **Weighted shortest path / Dijkstra** — add as a section in ch10 (graphs) rather than a new chapter; ch10 already defers it, so close the loop. Include the "why a heap" link back to ch11.

**System design (fintech):**
3. **Auth-vs-settlement (dual-message) lifecycle** — a worked piece: card authorisation holds funds, settlement/presentment posts to the ledger later, with reversals/expiry. This is THE fintech-specific flow and is currently missing. Place in `monzo/01` or `monzo/05`.
4. **Reversals / chargebacks / refunds as ledger operations** — extend the double-entry ledger content to show compensating entries (never mutate/delete; post a reversing pair). Natural extension of existing ledger material.

### Tier 2 — Valuable, do next
**System design:**
5. **Consensus / quorum worked example** — Raft leader election or Cassandra quorum tuning (`R + W > N`), tied to "how does the ledger stay correct across nodes". Upgrades the current one-liner. Cross-link DDIA Ch. 9.
6. **Observability / on-call design** — metrics (RED/USE), structured logging, tracing, alerting on DLQ depth / replication lag; a short "how would on-call debug this at 3am" section. Backs up a claim the README already makes.

**Coding:**
7. **Tries / prefix trees (new short chapter or section)** — autocomplete/prefix-search framing; plausible for a fintech/search prompt.

### Tier 3 — Nice to have, lower likelihood
8. **Bit manipulation** — single number, power of two, masks. Common warm-up, low depth needed.
9. **Multi-currency FX in the ledger** — conversion, rounding, holding FX as explicit ledger legs.
10. **Regulatory primer** — brief SCA/PSD2, KYC/AML, Strong Customer Authentication context (a sidebar, not a chapter).

---

## Approach for each addition
- **Prefer extending an existing chapter over adding a new file** (honours the "minimise documents" constraint). New chapters only for genuinely standalone topics (greedy, tries).
- Match the target house style from Plan 4 ("Builds on" callout, decision table, dual-language, Try-Now with ⭐ stars).
- For fintech additions, reuse the existing ledger/payment schemas rather than inventing new ones — show them as extensions.
- Add DDIA cross-references where a theory anchor exists (consensus → Ch. 9; stream processing/CDC → Ch. 11).
- Update the relevant README TOC(s) for any new chapter (apply the Plan-3 generic=canonical rule — put shared system-design theory in the generic set, fintech deltas in monzo).

## Suggested sequencing
1. Tier 1 items 1–4 (one commit each, regen HTML between).
2. Tier 2 items 5–7.
3. Tier 3 as time allows.

## Verification per addition
- Regenerate HTML (`node study-html/_build/convert-v2.mjs`); confirm chapter count increments as expected and new anchors/links resolve.
- `node --check` on the generator if `PARTS`/config changed.
- Confirm any new cross-references (and DDIA chapter numbers) are correct.

## Decisions to confirm with user before executing
- Whether greedy and tries become **new chapters** (15, 16…) or **sections** inside existing chapters.
- Whether the consensus/observability depth is "interview-summary" or "deep dive".
- How much fintech-regulatory detail is in scope (sidebar vs full section).
