# CodeFundamentals

A personal repository for mastering software engineering fundamentals, algorithm implementations, and technical documentation.

## 🚀 Project Overview
This repository is a central hub for learning and implementing core computer science concepts in C# and .NET. It holds:
- a 16-chapter learning plan for algorithm patterns, from LeetCode Easy up to Medium;
- interview preparation for mid/senior engineering roles (general, .NET and Monzo-specific);
- a practice project with xUnit tests for writing your own solutions;
- a single-page study site (`study-html/study.html`) built from the docs.

## 🏗️ Technical Stack
- **Language:** C# 12.0
- **Runtime:** .NET 10.0 (Core Executable)
- **Environment:** Visual Studio / VS Code
- **Testing:** xUnit
- **Documentation:** Markdown (GitHub Flavored), built into HTML with Node.js

## 📖 Documentation
- [Learning plan](docs/code-learning/README.md): start here for the algorithm chapters.
- [Development Guide](DEVELOPMENT.md): how to add solutions and tests, and how to debug.
- [Cheat sheet](docs/code-learning/cheat-sheet.md): every coding pattern on one page (how to spot it, a C# template, its cost and its #1 mistake). Also in `study.html`, between Revision and chapter 1.
- [Returning after a break](docs/code-learning/README.md#-returning-after-a-break): how to catch up using each chapter's **Catch up** and **Check Yourself** sections, or the [Revision page](study-html/study.html#revision) in `study.html`.

## 📁 Repository Structure
- **/CodeFundamentals**: The C# project for your own algorithm solutions, one class per topic (see [DEVELOPMENT.md](DEVELOPMENT.md)).
  - `Program.cs`: Entry point for running code manually.
- **/Tests**: xUnit tests for the solutions.
- **/docs**: Learning resources.
  - `/code-learning`: The 16 pattern chapters and the learning plan, plus a one-page [cheat sheet](docs/code-learning/cheat-sheet.md).
  - `/extras`: Deep dives: [Two Pointers Mastery](docs/extras/two-pointers-mastery.md) and the [Space Complexity Guide](docs/extras/space-complexity-guide.md).
  - `/interview-prep-generic`: Canonical interview prep (system design, coding, behavioural, API design, databases, system design building blocks).
  - `/interview-prep-dotnet` and `/interview-prep-monzo`: Overlays that add .NET-specific and Monzo-specific material to the generic set.
  - `/personal-projects`: Suggested side projects and a coding practice plan.
  - `monzo-role-assessment.md`: Monzo role requirements compared with my experience.
- **/study-html**: `study.html`, the generated study site. Its build script is in `_build/`.
- **CodeFundamentals.sln**: Visual Studio solution file for multi-project management.

## 🧠 Patterns & Algorithms Covered
**Phase 1 — Foundations (LeetCode Easy)**
1. Arrays & Strings
2. Hash Maps & Sets
3. Two Pointers
4. Sliding Window
5. Stacks & Queues
6. Sorting & Binary Search
7. Linked Lists
8. Trees & Recursion
9. Dynamic Programming Intro

**Phase 2 — Stepping up (LeetCode Medium)**

10. Graphs
11. Heaps & Priority Queues
12. Backtracking
13. Dynamic Programming Patterns
14. Pattern Recognition & Interview Method (capstone)
15. Greedy Algorithms
16. Tries (Prefix Trees)

## 📊 Readiness Review (2026-11-16, updated 2026-11-27)
**Goal:** be interview ready for coding problems and interview questions.
**Overall score: 8.5/10.** The review covers the docs only, not the work-in-progress solutions or the personal projects.

| Section | Score | Reasoning |
|---|---|---|
| Coding chapters 01–16 | 8.5 | Sensible Easy → Medium order. Every chapter has Task/Example, Catch up, step comments, problems and Check Yourself. Ch14 teaches spotting the pattern and talking it through. All C# examples compile except one. Some Medium patterns are missing. |
| Coding interview prep | 8.5 | Design-style questions (LRU Cache, rate limiter, time-based key-value store, hit counter, serialise a tree, merge K lists), plus fintech versions in the Monzo set. |
| System design | 9 | Classic questions (URL shortener, chat, notifications, task queue) and Monzo ones (payments, card freeze, bill splitting). The building blocks chapter is a reusable toolkit mapped to DDIA. |
| API design & distributed systems | 9 | Idempotency, event-driven design, consistency, versioning and circuit breakers, in generic and banking versions. |
| Database & data modelling | 8.5 | Schema design, indexing, locking, soft deletes and scaling, plus a banking ledger in the Monzo set. |
| Behavioural (answer-structure guide) | 8.5 | STAR plus seven question types, each with what interviewers look for, follow-ups and red flags. |
| Cheat sheet | 8.5 | One page covering every pattern: spotting it, input size → target complexity, C# templates, a C# toolbox and the top mistakes. It also has short cards for Kadane, prefix sum + hash map and intervals. |
| Extras | 7.5 | Two useful guides. The cheat sheet now has complexity tables, but there is still no full Big-O primer. |
| README & study site | 8.5 | The README matches the repo. `study.html` puts everything in one place, with a Revision page and the Cheat sheet. |

**To reach 9.5:**
1. Turn the cheat sheet cards for Kadane / Maximum Subarray, prefix sum + hash map (Subarray Sum Equals K, #560) and intervals (Insert Interval, Meeting Rooms) into full chapters with practice problems. Quickselect and bit manipulation are lower priority.
2. Fix or label the ch04 `LongestValid` template. It looks like a runnable method but doesn't compile.
3. Add a short Big-O primer. The cheat sheet already has the input size → complexity and pattern cost tables, but not how to work out the complexity of your own code.

The rest of being interview ready is timed practice: solving problems against the clock and talking through system designs out loud.

## 🛠️ Commands
- **Build:** `dotnet build`
- **Test:** `dotnet test`
- **Run:** `dotnet run --project CodeFundamentals`
- **Rebuild the study site:** `node study-html/_build/convert-v2.mjs` (run after editing any doc)

## 🤖 Session Context (for AI assistants)
When starting a new session, treat this project as a **Learning & Implementation** environment.
- **Coding Style:** Idiomatic C# 12, focusing on performance and readability.
- **Workflow:** Add solutions as `public static` methods in a topic class under `/CodeFundamentals`, add xUnit tests under `/Tests`, and document findings in the relevant `/docs` file.
- **Doc conventions:** See the contributor note in [docs/interview-prep-generic/README.md](docs/interview-prep-generic/README.md#-maintaining-these-docs-contributor-note) (Catch up blocks, `public static` examples).
