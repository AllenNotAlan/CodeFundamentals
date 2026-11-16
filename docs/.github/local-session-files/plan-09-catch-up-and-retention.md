# Plan 9 — Catch-up sections and retention aids

**Status:** DONE. All steps 1–6 are implemented. Checks: `node --check` passes, the build writes 47 pages (46 + Revision), 34 catch up blocks are collected, every block has ≤5 bullets, and `dotnet build` / `dotnet test` pass (15/15). Not done, by choice: the optional per-question "Key point" lines in the interview prep (D5), and converting the space-complexity guide's inline answers into a hidden Answers block (D2 said rename only).

**Problem:** A learner who steps away for a few weeks comes back and can't remember what a chapter covered. Nothing in the docs is built for that moment. Every chapter starts straight into Core Concepts, and the material that is recap-like is scattered:
- Chapter 14 has a signal → pattern cheat sheet.
- `extras/space-complexity-guide.md` has a "Summary Table" and "Check Your Understanding" questions.
- `personal-projects/04-coding-practice-plan.md` has a Progress Tracker with no review dates.
- The interview-prep docs are lists of questions with no summary.

**Goal:** Within about 15 minutes, a returning learner can find out what they knew, check whether they still know it, and see where to pick up again. The recaps must stay short and stay in sync with the chapters.

---

## Deliverables

### D1 — Catch-up block at the top of each coding chapter (`docs/code-learning/01–16`)
- **Position:** Directly after the H1 intro paragraph and the "Builds on" note, before `## Core Concepts`. A returning reader starts at the top, so the recap has to be there.
- **Format:** One blockquote with a fixed opening line, so the build script can detect it (see D4):

  ```markdown
  > **Catch up**
  > - **Idea:** <one sentence: what the technique does and the complexity it buys you>
  > - **Spot it:** <signal words / problem shapes>
  > - **Template:** <the core loop or recurrence in one line>
  > - **Cost:** <typical time / space>
  > - **#1 mistake:** <the most common bug, taken from the chapter's Common Mistakes section>
  ```
- **Rules:**
  - Exactly five bullets and no code blocks. Maximum 10 lines in total.
  - Every claim must already appear in the chapter body. The recap adds no new content.
  - Use the terms the chapter already uses (e.g. "window", "invariant", "visited set").
  - Chapter 14 is itself a recap. It gets a shorter block that points to its cheat sheet.

### D2 — "Check yourself" questions at the end of each coding chapter
- **Position:** A new `## Check Yourself` section placed **before** `## LeetCode Problems to Try Now`, so that recall comes before practice.
- **Content:** 3–5 questions that test recall without needing code. For example: "What is the window length formula?", "Why must you shrink inside a `while` and not an `if`?", "Which problem in this chapter uses a dictionary inside the window?"
- **Answers:** Hidden until clicked in `study.html` (see D4). In raw markdown they sit in a clearly labelled block directly below the questions.
- **Follow the existing example:** the "Check Your Understanding" section in `extras/space-complexity-guide.md`. Rename that section to `## Check Yourself` for consistency (wording change only, no content change).

### D3 — "Returning after a break" route in `docs/code-learning/README.md`
- Add a short section after "How to Use This Plan":
  1. Read the catch-up block of every chapter you've finished (or use the Revision page from D4).
  2. Answer the Check Yourself questions for each one without looking.
  3. Solve one ⭐ problem per chapter from scratch.
  4. Re-read the full chapter only for the chapters where step 2 or 3 failed.
- Add a suggested review schedule: 1 day, 1 week and 1 month after first finishing a chapter.
- **Tracking:** Add a "Last reviewed" column to the existing Progress Tracker in `personal-projects/04-coding-practice-plan.md` rather than creating a second tracker. Link to it from the README.

### D4 — Build script support (`study-html/_build/convert-v2.mjs`)
- **Collapsible answers:** The CSS for `details.solution` already exists (around line 874), but nothing generates that element. Add a markdown convention that the parser turns into `<details class="solution"><summary>Answers</summary><div>…</div></details>`. Options:
  - (a) A blockquote whose first line is `**Answers**`. This is the smallest parser change and reads fine in plain markdown.
  - (b) A fenced block such as ```` ```answers ````. This is easy to detect but displays as a code block on GitHub.
  - **Recommendation:** (a).
- **Catch-up styling:** Give blockquotes whose first line is `**Catch up**` a `recap` class, following the existing `blockquote.ddia` pattern. Add a light-theme and a dark-theme rule.
- **Revision page:** While building, collect every catch-up block and output one extra "Revision — all catch-ups" chapter at the start of the "Fundamentals — Coding Patterns" part. Group the entries by part (Coding Patterns, Extras, Interview Prep, Personal Projects), and link each entry back to its chapter. To cover "both" locations without generating the page twice, add a link to it in "Start Here": from the Learning Plan's "Returning after a break" section (D3), and as a line in the root `README.md` Documentation list. The recaps are written once and generated into this page, so the page can't drift out of sync.
- Link the Revision page to chapter 14's cheat sheet instead of copying the cheat sheet.

### D5 — Interview-prep and personal-project docs (lower priority)
- **`interview-prep-{generic,dotnet,monzo}/*`:** A catch-up block at the top of each file listing the 3–5 points most worth saying out loud. Optionally add a one-line "Key point" under each Question heading. Use the same `**Catch up**` marker so the blocks are picked up by D4. Apply the Plan 3 rule: the generic docs are the canonical source, and the dotnet/monzo blocks only state what differs.
- **`personal-projects/01–03`:** Add a "Where I left off" note at the top (the current step plus the next action) instead of a concept recap. The Definition of Done stays the checklist.

---

## Sequencing

| Step | Work | Commit |
|------|------|--------|
| 1 | D4 parser changes: answers `<details>`, `recap` class. No content yet. | 1 |
| 2 | **Trial:** D1 + D2 on ch02 (Hash Maps) and ch10 (Graphs). Regenerate the HTML and get user sign-off on format and length. | 1 |
| 3 | D1 + D2 on the rest of Phase 1 (ch01, 03–09). | 1 |
| 4 | D1 + D2 on the rest of Phase 2 (ch11–16) and the two extras. | 1 |
| 5 | D4 Revision page + D3 README route + tracker column. | 1 |
| 6 | D5 interview prep, then personal projects. | 1–2 |

ch02 and ch10 are the trial chapters because they cover both extremes. ch02 is short and Easy-level. ch10 is the longest chapter (23 KB) and has several sub-patterns (DFS/BFS, topological sort, Union-Find, Dijkstra), which tests whether five bullets are enough.

## Verification (each step)
- `node --check study-html/_build/convert-v2.mjs` after any script change.
- `node study-html/_build/convert-v2.mjs`. The chapter count should be unchanged until step 5, then increase by 1 for the Revision page.
- In `study.html`: the catch-up block renders with the `recap` style in both themes, the answers start collapsed and open on click, and the Revision page links resolve to the right chapter anchors.
- Content check for each chapter: every recap bullet and every answer can be traced to text in that chapter's body.
- Check the same files on GitHub's markdown preview to confirm they still read cleanly without the HTML build.
- `dotnet build` / `dotnet test` are not affected (docs only), but run them once at the end as a sanity check.

## Risks
- **Recap drift:** A chapter is edited and its recap isn't. Mitigation: the rule that recaps contain only body content, plus a "check the recap" line in the contributor note in `interview-prep-generic/README.md`.
- **Bloat:** The recaps get longer over time. Mitigation: a hard limit of five bullets, checked during review.
- **Two marker conventions:** Both are blockquote-based, so plain markdown still works if the build script is dropped.

## Decisions (confirmed by user)
1. **Label:** `**Catch up**`, plain text with no emoji. This exact string is the marker the build script detects.
2. **Answers:** Convention (a), a blockquote whose first line is `**Answers**`. It renders as a collapsed `<details class="solution">` in `study.html`.
3. **Revision page:** Generated once, at the start of the Fundamentals part. "Start Here" links to it (README + Learning Plan) rather than holding a second copy.
4. **D5:** In scope for this round (step 6), covering all three interview-prep sets and personal projects 01–03.
5. **Code in recaps:** None. The Template bullet describes the loop or recurrence in words or inline code only, with no code blocks and no Python examples.

## Scope summary (files to touch)
- Script: `study-html/_build/convert-v2.mjs` (parser + CSS + Revision page). `study.html` is regenerated, not hand-edited.
- Coding chapters: `docs/code-learning/01–16` (D1 + D2), `docs/extras/*.md` (D1 + D2, plus the section rename in the space-complexity guide).
- Navigation: `docs/code-learning/README.md` (D3), root `README.md` (one link), `docs/personal-projects/04-coding-practice-plan.md` (tracker column).
- D5: `docs/interview-prep-{generic,dotnet,monzo}/01–06` (catch-up block per file) and `docs/personal-projects/01–03` ("Where I left off").
- Contributor note: `docs/interview-prep-generic/README.md` (keep-recaps-in-sync line).
