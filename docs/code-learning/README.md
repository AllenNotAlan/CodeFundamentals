# 🧠 Coding Fundamentals Learning Plan

> **Goal:** Build the pattern fluency to confidently solve LeetCode **Easy** problems, then step up to the **Medium** patterns that decide most real interviews (including pairing-style interviews like Monzo's).
> **Primary language:** C# (with Python alternatives throughout)

---

## 📚 Topics (work through in order)

The plan runs in two phases. **Phase 1 (1–9)** builds the foundations and targets LeetCode **Easy**. **Phase 2 (10–14)** steps up to the **Medium** patterns and the recognition/communication skills that decide most interviews. The jump from 9 → 10 is a deliberate step up in difficulty — see the note below.

### Phase 1 — Foundations (LeetCode Easy)

| # | Topic | Key Concepts | Why It Matters |
|---|-------|-------------|----------------|
| 1 | [Arrays & Strings](./01-arrays-and-strings.md) | Indexing, iteration, common tricks | ~40% of Easy problems |
| 2 | [Hash Maps & Sets](./02-hash-maps-and-sets.md) | Lookups, frequency counts, deduplication | Turns O(n²) → O(n) constantly |
| 3 | [Two Pointers](./03-two-pointers.md) | Left/right pointers, fast/slow | Elegant solutions for sorted arrays |
| 4 | [Sliding Window](./04-sliding-window.md) | Fixed & variable windows | Subarray/substring problems |
| 5 | [Stacks & Queues](./05-stacks-and-queues.md) | LIFO/FIFO, monotonic stack | Matching, ordering, next-greater |
| 6 | [Sorting & Binary Search](./06-sorting-and-binary-search.md) | Built-ins, binary search pattern | Fast lookups, sorted-array problems |
| 7 | [Linked Lists](./07-linked-lists.md) | Traversal, pointer manipulation | Classic interview staple |
| 8 | [Trees & Recursion](./08-trees-and-recursion.md) | DFS, BFS, base cases | Unlocks medium problems too |
| 9 | [Dynamic Programming Intro](./09-dynamic-programming-intro.md) | Memoization, bottom-up tables | Easy DP problems, Fibonacci family |

### Phase 2 — Stepping up (LeetCode Medium & interview patterns)

> ⚠️ **Difficulty step-up.** Chapters 10–16 move from Easy into **Medium** territory (Union-Find, topological sort, Dijkstra, Edit Distance, N-Queens). Each chapter opens with a **"Builds on"** note pointing back to the Phase 1 foundations it depends on — don't skip ahead until those feel solid. Chapter 14 is the capstone (recognition + method); 15–16 add two more high-value patterns you can slot into the cheat sheet.

| # | Topic | Key Concepts | Why It Matters |
|---|-------|-------------|----------------|
| 10 | [Graphs](./10-graphs.md) | DFS/BFS, topological sort, Union-Find | Grids, dependencies, connectivity |
| 11 | [Heaps & Priority Queues](./11-heaps-priority-queues.md) | Heap invariant, top-K, merge-K, two-heap median | "Top K", "median", "merge K" problems |
| 12 | [Backtracking](./12-backtracking.md) | Choose/explore/un-choose, pruning | Subsets, permutations, combinations |
| 13 | [Dynamic Programming Patterns](./13-dynamic-programming-patterns.md) | Knapsack, subsequence, grid, two-string shapes | Recognising which DP table to build |
| 14 | [Pattern Recognition & Interview Method](./14-pattern-recognition.md) | Signal → pattern mapping, the 6-step method | **Capstone** — recognition & communication |
| 15 | [Greedy Algorithms](./15-greedy.md) | Interval scheduling, reach/jump, exchange argument | When a local choice is provably global |
| 16 | [Tries (Prefix Trees)](./16-tries.md) | Prefix tree, insert/search/startsWith, wildcard DFS | Autocomplete, "starts with", dictionary search |

### Related deep-dives (in [`../extras`](../extras/))

- [Two Pointers Mastery](../extras/two-pointers-mastery.md) — extended practice beyond chapter 3.
- [Space Complexity Guide](../extras/space-complexity-guide.md) — a focused tour of memory cost with diagrams.

---

## 🗺️ How to Use This Plan

1. **Read the concept** — understand the idea before any code.
2. **Study the examples** — trace through them mentally line by line.
3. **Try the practice problems yourself** before reading the solution.
4. **Re-implement from memory** — close the file and write it again.
5. **Go to LeetCode** — apply the pattern to real problems.

Work **Phase 1 in order first** — each chapter reuses the one before it. Only move into **Phase 2** once the Phase 1 patterns feel automatic; the later chapters assume them. Chapter 14 is the capstone — read it last, then keep it open as a cheat sheet while you drill.

---

## 🔑 Problem-Solving Framework (use this every time)

```
1. Understand   → Re-read the problem. What are the inputs/outputs? Constraints?
2. Examples     → Work through the given examples by hand.
3. Brute Force  → Can you solve it any way at all, even slowly?
4. Optimise     → What pattern applies? (see table above)
5. Code         → Write clean code. Name variables clearly.
6. Test         → Run through edge cases: empty input, single element, duplicates.
```

> This framework is expanded into an interview-ready, say-it-out-loud method in [Chapter 14 — Pattern Recognition & Interview Method](./14-pattern-recognition.md).

---

## ⚡ Quick Reference: Time Complexities

| Operation | Array | Dictionary/HashMap | Sorted Array |
|-----------|-------|--------------------|--------------|
| Access by index | O(1) | — | O(1) |
| Search | O(n) | O(1) avg | O(log n) |
| Insert | O(n) | O(1) avg | O(n) |
| Delete | O(n) | O(1) avg | O(n) |

---

## 🏁 LeetCode Problems to Try After Each Phase

**After Phase 1 (Easy):**

- Two Sum (#1)
- Valid Parentheses (#20)
- Merge Two Sorted Lists (#21)
- Best Time to Buy and Sell Stock (#121)
- Valid Palindrome (#125)
- Contains Duplicate (#217)
- Climbing Stairs (#70)
- Binary Search (#704)
- Reverse Linked List (#206)
- Maximum Depth of Binary Tree (#104)

**After Phase 2 (Medium):**

- Number of Islands (#200)
- Course Schedule (#207)
- Kth Largest Element in an Array (#215)
- Top K Frequent Elements (#347)
- Subsets (#78)
- Permutations (#46)
- Combination Sum (#39)
- Longest Increasing Subsequence (#300)
- Coin Change (#322)
- Word Search (#79)
