# 14 — Pattern Recognition & Interview Method

This is the capstone. Chapters 01–13 each taught a *tool*. This chapter teaches the two skills that actually decide a coding interview: **recognising which tool a new problem needs**, and **communicating your way through it**. Owning twelve patterns is worthless if you freeze when a fresh prompt doesn't announce which one applies — and it never does.

> **Builds on:** every prior chapter. Keep them open; this chapter constantly points back to them.

---

## Why this matters more than solving more problems

In a Monzo-style **pairing** interview, the interviewer is watching *how you think*, not whether you've memorised a solution. They want to see you:
- turn a vague prompt into a precise problem,
- recognise the underlying pattern quickly,
- reason about trade-offs out loud,
- write clean code and test it yourself.

A candidate who deeply owns ~13 patterns and talks through them clearly beats one who has "seen" 300 problems but goes silent. So this chapter is about **recognition speed** and **a repeatable method**, not more volume.

---

## The Recognition Cheat Sheet

Train yourself to read a problem and map its *signals* to a pattern. These signals are the single most useful thing to memorise.

| If the problem says / looks like… | Reach for | Chapter |
|-----------------------------------|-----------|---------|
| "sum/pair/duplicate", fast lookups needed | **Hash map / set** | [02](./02-hash-maps-and-sets.md) |
| **Sorted** array, find a pair/triplet, or remove in place | **Two pointers** | [03](./03-two-pointers.md) · [mastery](../extras/two-pointers-mastery.md) |
| **Contiguous** subarray/substring with a condition | **Sliding window** | [04](./04-sliding-window.md) |
| Matching/nesting, "most recent", next-greater | **Stack** (monotonic) | [05](./05-stacks-and-queues.md) |
| **Sorted** input + "find/search", or "minimise the max" | **Binary search** | [06](./06-sorting-and-binary-search.md) |
| Reorder/detect-cycle in a chain, "in place" pointers | **Linked-list pointers** | [07](./07-linked-lists.md) |
| Tree shape, "depth/path/validate", mirror | **Tree DFS/BFS + recursion** | [08](./08-trees-and-recursion.md) |
| "number of ways", "min/max cost", "is it possible" | **Dynamic programming** | [09](./09-dynamic-programming-intro.md) · [13](./13-dynamic-programming-patterns.md) |
| Nodes & edges, grid, "connected"/"reachable"/"shortest unweighted" | **Graph BFS/DFS / Union-Find** | [10](./10-graphs.md) |
| "top/K largest/smallest", "median", "merge K" | **Heap / priority queue** | [11](./11-heaps-priority-queues.md) |
| "all combinations/permutations/subsets", "generate every" | **Backtracking** | [12](./12-backtracking.md) |
| "maximum non-overlapping", "fewest jumps", "sort then pick" | **Greedy** | [15](./15-greedy.md) |
| "starts with", "autocomplete", "prefix", "dictionary of words" | **Trie (prefix tree)** | [16](./16-tries.md) |

### Secondary tells
- **"Shortest path, unweighted"** → BFS specifically (not DFS) — BFS reaches nodes in distance order ([10](./10-graphs.md)).
- **"Shortest/cheapest path with weights"** (no negatives) → Dijkstra = BFS with a min-heap ([10](./10-graphs.md)).
- **"Greedy feels right"** → check it's *provably* safe (exchange argument); otherwise it's probably DP ([15](./15-greedy.md) vs [13](./13-dynamic-programming-patterns.md)).
- **"Top K" with `k ≪ n`** → a size-K heap, not a full sort ([11](./11-heaps-priority-queues.md)).
- **"Contiguous"** → sliding window; **"any order / subsequence"** → usually DP or backtracking. That one word changes the pattern.
- **"Sorted"** appearing anywhere is a loud hint for two pointers or binary search.
- **A grid** is almost always a graph in disguise ([10](./10-graphs.md)).

---

## The Interview Method (say this out loud, every time)

This is the framework from the interview-prep track, made into muscle memory. Narrate each step — the interviewer scores your reasoning, not just your final code.

```
1. CLARIFY      Restate the problem. Ask about input size, ranges, duplicates,
                empty/null, sorted?, return value. Never start coding blind.
2. EXAMPLES     Walk a concrete example by hand. Then an edge case
                (empty, single element, all-same, negative).
3. BRUTE FORCE  State the naive approach and its complexity — out loud.
                "I could do this in O(n²) by…". Shows you can always ship *something*.
4. OPTIMISE     Name the pattern. "Since the array is sorted, two pointers
                gets this to O(n)." This is where chapters 01–13 pay off.
5. CODE         Write it cleanly, talking as you go. Good names, no dead code.
6. TEST         Trace your own code on the example. Check the edge cases from step 2.
                Fix bugs before they tell you.
```

**Golden rule:** a working brute force you can explain beats an optimal solution you get stuck halfway through. Always secure *an* answer, then improve it.

---

## Worked Walkthrough — applying the method cold

Let's run the method on a prompt as if seeing it for the first time.

> **Prompt:** "Given an array of integers, return the length of the longest substring… I mean subarray… whose elements sum to at most `k`. All numbers are positive."

**1. Clarify.** "Positive integers only — good. Contiguous subarray, not subsequence? (yes.) Can `k` be negative or zero? If all numbers are positive and `k ≥ 0`, an empty subarray trivially sums to 0. Return the *length*, not the subarray itself?"

**2. Examples.** `nums = [2, 1, 1, 3]`, `k = 4` → `[2, 1, 1]` sums to 4, length 3. Edge: `k = 0` → length 0 (positives can't fit). Single element bigger than `k` → 0.

**3. Brute force.** "I could check every subarray — `O(n²)` pairs, each summed in `O(1)` with running totals. That works but it's quadratic."

**4. Optimise — recognise the pattern.** The word **"contiguous"** + "a condition on the sum" is the sliding-window tell (chapter 04). Because all numbers are **positive**, the sum grows as the window expands and shrinks as it contracts — so a variable window is valid. "I'll expand `right`, and while the sum exceeds `k`, shrink from `left`. `O(n)`."

**5. Code.**
```csharp
int LongestSubarrayAtMostK(int[] nums, int k)
{
    int left = 0, sum = 0, best = 0;
    for (int right = 0; right < nums.Length; right++)
    {
        sum += nums[right];                 // expand the window
        while (sum > k && left <= right)    // shrink while invalid
            sum -= nums[left++];
        best = Math.Max(best, right - left + 1);
    }
    return best;
}
```

**6. Test.** Trace `[2,1,1,3], k=4`: window grows to `[2,1,1]` (sum 4, len 3); adding 3 → sum 7 > 4, shrink until valid. `best = 3`. ✓ Edge `k=0`: the `while` empties every window → `best = 0`. ✓

Notice the pattern was *never named in the prompt* — "contiguous" + "sum condition" + "positive numbers" is what pointed to sliding window. That inference is the skill.

---

## How to practise recognition (not just solving)

Solving problems one by one builds *tools*; this routine builds *recognition*:

1. **Read 10 problems without solving them.** For each, write only: "Pattern = ___, because ___." Check against editorials. You'll be wrong early — that's the point.
2. **Group by pattern, not by difficulty.** Do five sliding-window problems in a row; the shared structure becomes obvious and the tell sticks.
3. **Re-derive, don't re-memorise.** After solving, close the editorial and rewrite from the *pattern*, not from memory of that specific solution.
4. **Time the recognition, not the coding.** Give yourself 60 seconds per prompt to name the pattern and the target complexity out loud. Interviews are won or lost in that first minute.
5. **Keep a "signals" log.** Each time a problem surprises you, add its tell to your own version of the cheat sheet above.

---

## Reading complexity out loud

Interviewers expect you to state complexity unprompted. A quick reference tied to the patterns:

| Pattern | Typical time | Typical space |
|---------|-------------|---------------|
| Hash map / set | O(n) | O(n) |
| Two pointers / sliding window | O(n) | O(1) |
| Binary search | O(log n) | O(1) |
| Tree/graph BFS/DFS | O(V + E) | O(V) |
| Heap (top-K) | O(n log k) | O(k) |
| Backtracking | exponential (prune!) | O(depth) |
| DP | O(states × transition) | O(states) |

If your approach is worse than these for its pattern, that's usually the hint you've missed the intended optimisation.

---

## Common Mistakes (interview behaviour, not just code)

- **Coding before clarifying** — you solve the wrong problem. Always run step 1.
- **Silent thinking** — the interviewer can't score what they can't hear. Narrate.
- **Jumping to "the clever trick"** — state the brute force first; it's your safety net.
- **Not testing your own code** — trace an example before they ask. Catching your own bug is a strong signal.
- **Pattern-forcing** — not everything is DP. Match signals to patterns honestly; sometimes a hash map is the whole answer.
- **Giving up at the optimisation** — a clear `O(n²)` you can explain is a pass; a half-written `O(n)` you abandoned is not.

---

## Where to go next

- Drill by pattern using the 50-problem plan in the [Personal Projects — Coding Practice Plan](../personal-projects/04-coding-practice-plan.md).
- For the interview conversation itself, see the interview-prep **Coding & Algorithms** chapters, which apply this exact method to fintech-flavoured prompts.
- Then shift to **System Design** — a separate skill with its own method, covered in the interview-prep track and the System Design Building Blocks chapter.
