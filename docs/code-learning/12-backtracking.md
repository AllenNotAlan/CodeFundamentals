# 12 — Backtracking

Backtracking is **recursion (chapter 08) plus an undo step**. You build a solution one choice at a time; when a path can't work (or you've recorded it), you *undo the last choice* and try a different one. It's how you systematically explore every possibility without getting lost.

> **Builds on:** the recursion mental model from [Trees & Recursion](./08-trees-and-recursion.md). The new idea here is the **un-choose** step — the "backtrack" that gives the technique its name. You already saw it once in the wild: the debt-settlement answer in the Monzo coding prep undoes `balances[i] += balances[start]` after exploring — that's backtracking.

---

## Core Concepts

### The shape of every backtracking solution
Think of it as walking a tree of decisions. At each node you:

```
1. CHOOSE   — make a choice (add to current path)
2. EXPLORE  — recurse with that choice in place
3. UN-CHOOSE— undo the choice (remove from path), then try the next option
```

That three-line rhythm — choose / explore / un-choose — is the whole technique. The "un-choose" is what lets one shared `path` variable be reused across every branch instead of copying state everywhere.

### The universal template
```csharp
void Backtrack(State path, Options remaining)
{
    // Base case: is this a complete solution? Record it.
    if (IsComplete(path))
    {
        results.Add(Copy(path));   // copy! path keeps mutating after this
        return;
    }

    foreach (var choice in remaining)
    {
        if (!IsValid(choice, path)) continue;  // prune dead branches early

        path.Add(choice);                       // 1. CHOOSE
        Backtrack(path, Narrow(remaining, choice)); // 2. EXPLORE
        path.RemoveLast();                      // 3. UN-CHOOSE (the backtrack)
    }
}
```

### When to reach for it
Signal words: **"all combinations/permutations/subsets"**, **"generate every …"**, **"find all paths"**, **"is there any arrangement that …"**, puzzles with constraints (Sudoku, N-Queens).

The giveaway: the problem asks for **every** valid configuration, or asks whether *some* configuration exists among many — and a greedy/DP shortcut isn't available because choices interact.

### Backtracking vs brute force
Brute force generates everything then filters. Backtracking **prunes as it goes** — it abandons a partial path the moment it can't lead to a valid solution (`IsValid` / `continue` above). Same answers, far less work.

---

## Patterns with Code

### Pattern 1: Subsets — include or exclude each element
Every element is a binary choice: take it or don't. The decision tree has `2ⁿ` leaves = all subsets.

```csharp
IList<IList<int>> Subsets(int[] nums)
{
    var results = new List<IList<int>>();
    var path = new List<int>();

    void Backtrack(int start)
    {
        // Every node in the tree is itself a valid subset — record a copy.
        results.Add(new List<int>(path));

        // Try adding each remaining element (start.. avoids duplicates/reorderings).
        for (int i = start; i < nums.Length; i++)
        {
            path.Add(nums[i]);        // 1. CHOOSE
            Backtrack(i + 1);         // 2. EXPLORE (only elements after i)
            path.RemoveAt(path.Count - 1);  // 3. UN-CHOOSE
        }
    }

    Backtrack(0);
    return results;
}
```
```python
def subsets(nums):
    results, path = [], []

    def backtrack(start):
        results.append(path[:])          # record a copy of the current subset
        for i in range(start, len(nums)):
            path.append(nums[i])         # 1. choose
            backtrack(i + 1)             # 2. explore
            path.pop()                   # 3. un-choose
    backtrack(0)
    return results
```
**The `start` index** is how you avoid generating `[1,2]` and `[2,1]` as different subsets — you only ever look *forward*.

### Pattern 2: Permutations — order matters, track what's used
Here every ordering is distinct, so you consider *all* remaining elements at each step and mark which are already in the path.

```csharp
IList<IList<int>> Permute(int[] nums)
{
    var results = new List<IList<int>>();
    var path = new List<int>();
    var used = new bool[nums.Length];

    void Backtrack()
    {
        // Complete when the path uses every element.
        if (path.Count == nums.Length)
        {
            results.Add(new List<int>(path));
            return;
        }
        for (int i = 0; i < nums.Length; i++)
        {
            if (used[i]) continue;    // skip elements already in this permutation
            used[i] = true;           // 1. CHOOSE
            path.Add(nums[i]);
            Backtrack();              // 2. EXPLORE
            path.RemoveAt(path.Count - 1);  // 3. UN-CHOOSE
            used[i] = false;
        }
    }

    Backtrack();
    return results;
}
```
```python
def permute(nums):
    results, path = [], []
    used = [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):
            results.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True            # 1. choose
            path.append(nums[i])
            backtrack()               # 2. explore
            path.pop()                # 3. un-choose
            used[i] = False
    backtrack()
    return results
```
**Subsets vs permutations:** subsets use a `start` index (look forward only); permutations use a `used[]` flag (any unused element, order matters). That single difference changes everything.

### Pattern 3: Pruning — abandon dead branches early
The real power of backtracking is quitting a path as soon as it's hopeless. In Combination Sum, once the running total exceeds the target, every deeper choice is wasted — so we `break`/`return` instead of exploring.

```csharp
IList<IList<int>> CombinationSum(int[] candidates, int target)
{
    var results = new List<IList<int>>();
    var path = new List<int>();

    void Backtrack(int start, int remaining)
    {
        if (remaining == 0)                      // exact hit → record
        {
            results.Add(new List<int>(path));
            return;
        }
        for (int i = start; i < candidates.Length; i++)
        {
            if (candidates[i] > remaining) continue;  // PRUNE: can't fit
            path.Add(candidates[i]);             // 1. CHOOSE
            // reuse allowed → pass i (not i+1); subtract from remaining
            Backtrack(i, remaining - candidates[i]);  // 2. EXPLORE
            path.RemoveAt(path.Count - 1);       // 3. UN-CHOOSE
        }
    }

    Backtrack(0, target);
    return results;
}
```
**Why pruning matters:** without the `candidates[i] > remaining` check you'd explore enormous useless subtrees. Good pruning is the difference between "works" and "times out".

---

## Practice Problems

---

### Problem 1 — Subsets (LeetCode #78)
**Task:** Return all possible subsets (the power set) of a set of distinct integers.

**Example:** `[1, 2, 3]` → `[[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]`

**Solution:** (This is Pattern 1 directly.)
```csharp
IList<IList<int>> Subsets(int[] nums)
{
    var results = new List<IList<int>>();
    var path = new List<int>();

    void Backtrack(int start)
    {
        results.Add(new List<int>(path));   // every node is a subset
        for (int i = start; i < nums.Length; i++)
        {
            path.Add(nums[i]);               // choose
            Backtrack(i + 1);                // explore forward only
            path.RemoveAt(path.Count - 1);   // un-choose
        }
    }

    Backtrack(0);
    return results;
}
```
```python
def subsets(nums):
    results, path = [], []

    def backtrack(start):
        results.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1)
            path.pop()
    backtrack(0)
    return results
```
⏱ Time: O(n · 2ⁿ) | Space: O(n) recursion depth

---

### Problem 2 — Permutations (LeetCode #46)
**Task:** Return all permutations of distinct integers.

**Example:** `[1, 2, 3]` → six orderings: `[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]`

**Solution:** (Pattern 2 directly.)
```csharp
IList<IList<int>> Permute(int[] nums)
{
    var results = new List<IList<int>>();
    var path = new List<int>();
    var used = new bool[nums.Length];

    void Backtrack()
    {
        if (path.Count == nums.Length)
        {
            results.Add(new List<int>(path));
            return;
        }
        for (int i = 0; i < nums.Length; i++)
        {
            if (used[i]) continue;
            used[i] = true; path.Add(nums[i]);
            Backtrack();
            path.RemoveAt(path.Count - 1); used[i] = false;
        }
    }

    Backtrack();
    return results;
}
```
```python
def permute(nums):
    results, path = [], []
    used = [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):
            results.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True; path.append(nums[i])
            backtrack()
            path.pop(); used[i] = False
    backtrack()
    return results
```
⏱ Time: O(n · n!) | Space: O(n)

---

### Problem 3 — Combination Sum (LeetCode #39)
**Task:** Given distinct candidates and a target, return all unique combinations summing to the target. The same number may be reused unlimited times.

**Example:** `candidates = [2, 3, 6, 7]`, `target = 7` → `[[2,2,3], [7]]`

**Key insight:** Pattern 3 with reuse — pass `i` (not `i+1`) so a candidate can be chosen again, and prune when a candidate exceeds the remaining target.

**Solution:**
```csharp
IList<IList<int>> CombinationSum(int[] candidates, int target)
{
    var results = new List<IList<int>>();
    var path = new List<int>();

    void Backtrack(int start, int remaining)
    {
        if (remaining == 0)
        {
            results.Add(new List<int>(path));
            return;
        }
        for (int i = start; i < candidates.Length; i++)
        {
            if (candidates[i] > remaining) continue;      // prune
            path.Add(candidates[i]);
            Backtrack(i, remaining - candidates[i]);      // i, not i+1 → reuse
            path.RemoveAt(path.Count - 1);
        }
    }

    Backtrack(0, target);
    return results;
}
```
```python
def combination_sum(candidates, target):
    results, path = [], []

    def backtrack(start, remaining):
        if remaining == 0:
            results.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                continue                      # prune
            path.append(candidates[i])
            backtrack(i, remaining - candidates[i])   # reuse allowed
            path.pop()
    backtrack(0, target)
    return results
```
⏱ Time: O(exponential in target/candidates) | Space: O(target / min candidate)

---

### Problem 4 — Word Search (LeetCode #79)
**Task:** Given a grid of letters, return whether a word exists as a path of adjacent (up/down/left/right) cells, each cell used once.

**Example:** grid of `A B C E / S F C S / A D E E`, word `"ABCCED"` → `true`

**Key insight:** DFS from each cell with backtracking — mark a cell used before recursing, then **un-mark it** so other paths can reuse it. This is the grid-graph idea from chapter 10 *plus* the undo step.

**Solution:**
```csharp
bool Exist(char[][] board, string word)
{
    int rows = board.Length, cols = board[0].Length;

    bool Dfs(int r, int c, int idx)
    {
        if (idx == word.Length) return true;              // matched the whole word
        if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
        if (board[r][c] != word[idx]) return false;        // letter mismatch

        char temp = board[r][c];
        board[r][c] = '#';        // 1. CHOOSE: mark visited (sentinel)

        // 2. EXPLORE the four neighbours for the next letter.
        bool found = Dfs(r + 1, c, idx + 1) || Dfs(r - 1, c, idx + 1)
                  || Dfs(r, c + 1, idx + 1) || Dfs(r, c - 1, idx + 1);

        board[r][c] = temp;       // 3. UN-CHOOSE: restore for other paths
        return found;
    }

    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (Dfs(r, c, 0)) return true;
    return false;
}
```
```python
def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, idx):
        if idx == len(word):
            return True
        if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != word[idx]:
            return False

        temp, board[r][c] = board[r][c], '#'     # 1. choose (mark visited)
        found = (dfs(r + 1, c, idx + 1) or dfs(r - 1, c, idx + 1) or
                 dfs(r, c + 1, idx + 1) or dfs(r, c - 1, idx + 1))  # 2. explore
        board[r][c] = temp                       # 3. un-choose (restore)
        return found

    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0):
                return True
    return False
```
⏱ Time: O(rows × cols × 4^len) | Space: O(len) recursion depth

---

## The Backtracking Checklist

When you spot a backtracking problem, answer these before coding:
1. **What is a "complete" solution?** (your base case)
2. **What are the choices at each step?** (the `for` loop)
3. **How do I prevent reusing/reordering?** (`start` index vs `used[]` flag)
4. **Can I prune?** (skip choices that can't lead anywhere)
5. **What do I undo after exploring?** (the un-choose)

---

## Common Mistakes

- **Forgetting to un-choose** — the single most common bug; without it, state leaks between branches and results are wrong.
- **Storing the path by reference, not a copy** — `results.Add(path)` stores a pointer that keeps mutating; always add a *copy* (`new List<int>(path)` / `path[:]`).
- **`start` vs `used[]` confusion** — `start` for combinations/subsets (forward only), `used[]` for permutations (order matters).
- **No pruning** — correct but times out; add validity checks to abandon dead branches early.
- **Off-by-one in the base case** — trace tiny inputs (empty set, single element) by hand.

---

## LeetCode Problems to Try Now

- #78 — Subsets ⭐ (choose/skip template)
- #46 — Permutations ⭐ (`used[]` flag)
- #39 — Combination Sum ⭐⭐ (reuse + pruning)
- #79 — Word Search ⭐⭐ (grid DFS + undo)
- #77 — Combinations
- #22 — Generate Parentheses (pruning by valid-so-far)
- #51 — N-Queens (classic constraint backtracking)
