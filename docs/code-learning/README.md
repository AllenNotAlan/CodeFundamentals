# 🧠 Coding Fundamentals Learning Plan

> **Goal:** Build the foundational skills to confidently solve LeetCode Easy problems.
> **Primary language:** C# (with Python alternatives throughout)

---

## 📚 Topics (work through in order)

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

---

## 🗺️ How to Use This Plan

1. **Read the concept** — understand the idea before any code.
2. **Study the examples** — trace through them mentally line by line.
3. **Try the practice problems yourself** before reading the solution.
4. **Re-implement from memory** — close the file and write it again.
5. **Go to LeetCode** — apply the pattern to real problems.

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

---

## ⚡ Quick Reference: Time Complexities

| Operation | Array | Dictionary/HashMap | Sorted Array |
|-----------|-------|--------------------|--------------|
| Access by index | O(1) | — | O(1) |
| Search | O(n) | O(1) avg | O(log n) |
| Insert | O(n) | O(1) avg | O(n) |
| Delete | O(n) | O(1) avg | O(n) |

---

## 🏁 LeetCode Easy Problems to Try After Each Section

After finishing all topics, attempt these classic Easy problems:

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
