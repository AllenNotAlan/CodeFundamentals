# 15 — Greedy Algorithms

A **greedy** algorithm builds an answer one step at a time, always taking the choice that looks best *right now*, and never reconsidering. When that local optimum also gives the global optimum, greedy is the simplest and fastest tool you have — often turning an exponential search into a single `O(n)` or `O(n log n)` pass.

> **Builds on:** [06 — Sorting & Binary Search](./06-sorting-and-binary-search.md) (most greedy solutions start by sorting) and [09 — Dynamic Programming Intro](./09-dynamic-programming-intro.md) (the contrast that tells you *when greedy is safe*).

---

## Core idea — commit and never look back

DP explores *every* choice and keeps the best; greedy makes *one* choice at each step and moves on. That's why greedy is dramatically cheaper — and also why it's dangerous: if an early choice was wrong, greedy can't undo it.

```
Greedy  : pick best-looking option now → never revisit  → fast, sometimes wrong
DP      : try all options, keep the best combination     → slower, always correct
```

The whole skill is knowing **when the greedy choice is provably safe**. Two properties must hold:

1. **Greedy-choice property** — a globally optimal solution can be reached by making a locally optimal choice at each step.
2. **Optimal substructure** — after making that choice, what remains is a smaller instance of the same problem.

If you can't convince yourself both hold, reach for DP instead.

---

## When to reach for greedy vs DP

| Signal | Likely tool | Why |
|--------|-------------|-----|
| "Maximum number of non-overlapping …" / scheduling | **Greedy** | Sort by end time; earliest finish leaves the most room |
| "Minimum number of … to cover/reach" | **Greedy** (often) | Reach as far as possible each step |
| "Number of ways" / "count the combinations" | **DP** | Greedy can't count; it commits to one path |
| "Min/max cost" where a locally bad step enables a better future | **DP** | Greedy's no-takebacks rule fails here |
| Coins/amounts with *arbitrary* denominations (min coins) | **DP** | Greedy fails (see Common Mistakes) |
| Coins with *canonical* denominations (real currency) | **Greedy** works | Largest-coin-first is provably optimal for these sets |

> **Interview tell:** greedy problems almost always begin with **"sort by something"**. If sorting by a clever key makes the right choice obvious at each step, you're likely in greedy territory.

---

## Essential Patterns

### Pattern 1 — Interval scheduling (sort by end)
To fit the **most** non-overlapping intervals, always keep the one that **finishes earliest** — it frees the timeline soonest.

### Pattern 2 — Reach / jump (track the furthest reachable)
For "can I reach the end?" / "fewest jumps", sweep left to right tracking the furthest index reachable so far.

### Pattern 3 — Exchange argument (prove by swapping)
To justify a greedy order, argue that swapping any two elements out of greedy order never improves (and often worsens) the result. This is the proof interviewers want to hear — even informally.

---

## Practice Problems

### Problem 1 — Assign Cookies (LeetCode #455)
**Task:** Each child `i` has greed `g[i]`; each cookie `j` has size `s[j]`. A child is content if `s[j] >= g[i]`. Maximise content children (one cookie each).

**Example:** `g = [1,2,3]`, `s = [1,1]` → `1`

**Key insight:** Sort both. Give the smallest adequate cookie to the least greedy child — wasting the least capacity.

**Solution:**
```csharp
int FindContentChildren(int[] g, int[] s)
{
    Array.Sort(g);
    Array.Sort(s);
    int child = 0, cookie = 0;
    while (child < g.Length && cookie < s.Length)
    {
        if (s[cookie] >= g[child]) child++;  // this cookie satisfies this child
        cookie++;                            // either way, move past this cookie
    }
    return child;
}
```
```python
def find_content_children(g, s):
    g.sort(); s.sort()
    child = cookie = 0
    while child < len(g) and cookie < len(s):
        if s[cookie] >= g[child]:
            child += 1
        cookie += 1
    return child
```
⏱ Time: O(n log n) | Space: O(1)

---

### Problem 2 — Non-overlapping Intervals (LeetCode #435)
**Task:** Given intervals, return the minimum number to remove so the rest don't overlap.

**Example:** `[[1,2],[2,3],[3,4],[1,3]]` → `1`

**Key insight:** The classic interval-scheduling greedy. Sort by **end**; keep an interval only if it starts at or after the last kept interval's end. Everything you skip is a removal.

**Solution:**
```csharp
int EraseOverlapIntervals(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[1].CompareTo(b[1]));  // by end time
    int kept = 0, lastEnd = int.MinValue;
    foreach (var iv in intervals)
    {
        if (iv[0] >= lastEnd)   // no overlap → keep it
        {
            kept++;
            lastEnd = iv[1];
        }
    }
    return intervals.Length - kept;   // the rest had to be removed
}
```
```python
def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda iv: iv[1])   # by end time
    kept, last_end = 0, float('-inf')
    for s, e in intervals:
        if s >= last_end:
            kept += 1
            last_end = e
    return len(intervals) - kept
```
⏱ Time: O(n log n) | Space: O(1)

---

### Problem 3 — Jump Game (LeetCode #55)
**Task:** `nums[i]` is the max jump length from index `i`. Can you reach the last index?

**Example:** `[2,3,1,1,4]` → `true`

**Key insight:** Track the furthest index reachable. If you ever stand beyond it, you're stuck. No DP needed.

**Solution:**
```csharp
bool CanJump(int[] nums)
{
    int furthest = 0;
    for (int i = 0; i < nums.Length; i++)
    {
        if (i > furthest) return false;            // can't even get here
        furthest = Math.Max(furthest, i + nums[i]); // extend our reach
    }
    return true;
}
```
```python
def can_jump(nums):
    furthest = 0
    for i, n in enumerate(nums):
        if i > furthest:
            return False
        furthest = max(furthest, i + n)
    return True
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 4 — Jump Game II (LeetCode #45)
**Task:** Same array, but return the **minimum** number of jumps to reach the last index (assume it's reachable).

**Example:** `[2,3,1,1,4]` → `2`

**Key insight:** A greedy BFS "by level": within the current jump's reach, pre-compute the furthest you could reach with one more jump. When you hit the end of the current reach, you *must* spend a jump.

**Solution:**
```csharp
int Jump(int[] nums)
{
    int jumps = 0, curEnd = 0, farthest = 0;
    for (int i = 0; i < nums.Length - 1; i++)   // no need to jump from the last index
    {
        farthest = Math.Max(farthest, i + nums[i]);
        if (i == curEnd)        // consumed the current jump's range
        {
            jumps++;
            curEnd = farthest;  // commit to the best next range
        }
    }
    return jumps;
}
```
```python
def jump(nums):
    jumps = cur_end = farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == cur_end:
            jumps += 1
            cur_end = farthest
    return jumps
```
⏱ Time: O(n) | Space: O(1)

---

## Common Mistakes

- **Assuming greedy works for min-coin-change.** For coins `[1, 3, 4]` and amount `6`, greedy takes `4 + 1 + 1 = 3` coins, but `3 + 3 = 2` coins is optimal. Arbitrary denominations need **DP** ([09](./09-dynamic-programming-intro.md)); greedy is only safe for canonical currency systems.
- **Sorting by the wrong key.** Interval scheduling sorts by **end**, not start. Sorting by start maximises nothing.
- **No proof.** "It felt right" isn't an argument. Have a one-line exchange argument ready, or you can't trust the answer.
- **Using greedy to count.** "Number of ways" is never greedy — greedy commits to a single path and can't enumerate.
- **Forgetting the edge where greedy leaves you stranded.** In reach problems, always check "am I now standing beyond the furthest reachable point?"

---

## LeetCode Problems to Try Now

- #455 — Assign Cookies ⭐ (sort both, two pointers)
- #55 — Jump Game ⭐ (furthest-reach sweep)
- #435 — Non-overlapping Intervals ⭐⭐ (sort by end)
- #45 — Jump Game II ⭐⭐ (greedy BFS by level)
- #621 — Task Scheduler ⭐⭐ (greedy by most-frequent)
- #134 — Gas Station ⭐⭐ (single-pass greedy with a proof)
- #763 — Partition Labels (greedy by last-occurrence)

---

## Where to go next

Greedy and DP are the two answers to optimisation problems — always ask "is the greedy choice provably safe?" before committing. If it isn't, fall back to [13 — DP Patterns](./13-dynamic-programming-patterns.md). Then let [14 — Pattern Recognition](./14-pattern-recognition.md) drill the signal → tool mapping until it's instant.
