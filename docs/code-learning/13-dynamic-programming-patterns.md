# 13 — Dynamic Programming Patterns

Chapter 09 taught the *machinery* of DP: define a subproblem, write a recurrence, pick base cases, choose an iteration order. This chapter teaches **recognition** — the handful of recurring *shapes* that most interview DP problems fall into, so you can spot which one you're looking at and reach for the matching template.

> **Builds on:** the memoisation/tabulation foundations from [Dynamic Programming (Introduction)](./09-dynamic-programming-intro.md). If "what does `dp[i]` mean?" isn't yet second nature, go back first — here we assume it is and focus on the patterns.

---

## Core Concepts

### The four DP shapes you'll meet most
| Shape | The decision at each step | Canonical problem |
|-------|---------------------------|-------------------|
| **0/1 choice** | Take this item or skip it | 0/1 Knapsack |
| **Sequence / subsequence** | Extend or restart a run | Longest Increasing Subsequence |
| **Grid / 2D** | Come from above or from the left | Unique Paths, Min Path Sum |
| **Two-string** | Characters match or they don't | Longest Common Subsequence, Edit Distance |

Recognising the shape tells you the *dimensions of your `dp` table* and the *form of the recurrence* before you write a line of code.

### The recognition question
When you suspect DP (from chapter 09: "number of ways", "min/max cost", "is it possible"), ask **"what is the decision being made repeatedly, and what does the answer depend on?"** The answer defines your state:
- Depends on *an index and a remaining capacity* → 0/1 knapsack shape (2D: item × capacity).
- Depends on *the best run ending here* → subsequence shape (1D over positions).
- Depends on *a position in a grid* → grid shape (2D over rows × cols).
- Depends on *two positions, one in each string* → two-string shape (2D).

---

## Patterns with Code

### Pattern 1: 0/1 Knapsack — take-it-or-leave-it with a budget
**Task:** Given items with a weight and a value, and a bag with a weight limit, choose items (each at most once) to get the highest total value.

**Example:** `weights = [1, 3, 4]`, `values = [15, 20, 30]`, `capacity = 4` → `35` (take the items with weights 1 and 3)

You have items with weights and values and a capacity. Each item is used **at most once**. Maximise value without exceeding capacity. The state is `dp[i][w]` = best value using the first `i` items with capacity `w`.

```csharp
int Knapsack(int[] weights, int[] values, int capacity)
{
    int n = weights.Length;
    // dp[i, w] = max value using first i items within capacity w
    int[,] dp = new int[n + 1, capacity + 1];

    for (int i = 1; i <= n; i++)
        for (int w = 0; w <= capacity; w++)
        {
            // Option A: skip item i → inherit the value without it.
            dp[i, w] = dp[i - 1, w];

            // Option B: take item i (if it fits) → its value + best of remaining capacity.
            if (weights[i - 1] <= w)
                dp[i, w] = Math.Max(dp[i, w],
                                    values[i - 1] + dp[i - 1, w - weights[i - 1]]);
        }

    return dp[n, capacity];
}
```
```python
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]                     # skip item i
            if weights[i - 1] <= w:                      # or take it if it fits
                dp[i][w] = max(dp[i][w],
                               values[i - 1] + dp[i - 1][w - weights[i - 1]])
    return dp[n][capacity]
```
**The shape:** a 2D table indexed by *which items* × *how much budget*. The recurrence is always "best of (skip) vs (take, if it fits)". Subset-sum, partition-equal-subset, and target-sum are all this shape in disguise.

### Pattern 2: Subsequence — "best run so far" (LIS)
**Task:** Find the length of the longest strictly increasing subsequence (the numbers don't have to be next to each other).

**Example:** `nums = [10, 9, 2, 5, 3, 7]` → `3` (for example `2, 5, 7`)

*(Full walkthrough: Problem 2 below.)*

For Longest Increasing Subsequence, `dp[i]` = length of the longest increasing subsequence **ending at index i**. Each position looks back at all smaller-value predecessors and extends the best one.

```csharp
int LengthOfLIS(int[] nums)
{
    if (nums.Length == 0) return 0;
    // dp[i] = length of the longest increasing subsequence ending at i.
    int[] dp = new int[nums.Length];
    Array.Fill(dp, 1);          // each element alone is a subsequence of length 1
    int best = 1;

    for (int i = 1; i < nums.Length; i++)
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i])                 // can we extend the run ending at j?
            {
                dp[i] = Math.Max(dp[i], dp[j] + 1);
                best = Math.Max(best, dp[i]);
            }

    return best;
}
```
```python
def length_of_lis(nums):
    if not nums:
        return 0
    dp = [1] * len(nums)        # each element is an LIS of length 1 by itself
    best = 1
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:                   # extend the run ending at j
                dp[i] = max(dp[i], dp[j] + 1)
                best = max(best, dp[i])
    return best
```
**The shape:** 1D table over positions, where `dp[i]` summarises "the best thing ending here". The answer is often the *max over all `dp[i]`*, not `dp[last]`. (This is `O(n²)`; an `O(n log n)` version using binary search exists — a nice follow-up that reuses chapter 06.)

### Pattern 3: Grid — accumulate from neighbours (Min Path Sum)
**Task:** In a grid of costs, find the cheapest path from the top-left to the bottom-right, moving only right or down.

**Example:** `grid = [[1,3,1],[1,5,1],[4,2,1]]` → `7` (the path `1 → 3 → 1 → 1 → 1`)

On a grid, `dp[i][j]` is the best cost to *reach* cell `(i,j)`, built from the cells you could have come from (above or left). This generalises Unique Paths from chapter 09 (counting) to *optimising* a cost.

```csharp
int MinPathSum(int[][] grid)
{
    int rows = grid.Length, cols = grid[0].Length;
    int[,] dp = new int[rows, cols];
    dp[0, 0] = grid[0][0];

    // First row: can only come from the left.
    for (int c = 1; c < cols; c++) dp[0, c] = dp[0, c - 1] + grid[0][c];
    // First column: can only come from above.
    for (int r = 1; r < rows; r++) dp[r, 0] = dp[r - 1, 0] + grid[r][0];

    // Interior: cheaper of (from above) vs (from left), plus this cell.
    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            dp[r, c] = grid[r][c] + Math.Min(dp[r - 1, c], dp[r, c - 1]);

    return dp[rows - 1, cols - 1];
}
```
```python
def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    dp[0][0] = grid[0][0]

    for c in range(1, cols):                    # first row: from the left only
        dp[0][c] = dp[0][c - 1] + grid[0][c]
    for r in range(1, rows):                    # first column: from above only
        dp[r][0] = dp[r - 1][0] + grid[r][0]

    for r in range(1, rows):
        for c in range(1, cols):
            dp[r][c] = grid[r][c] + min(dp[r - 1][c], dp[r][c - 1])  # best neighbour
    return dp[rows - 1][cols - 1]
```
**The shape:** 2D table matching the grid; fill the edges as base cases, then each interior cell combines its reachable neighbours. Watch for the base-case edges — they're where grid DP usually breaks.

### Pattern 4: Two strings — match or mismatch (Edit Distance)
**Task:** Find the minimum number of insert, delete or replace steps needed to turn one string into another.

**Example:** `"horse"` → `"ros"` takes `3` steps

When a problem compares two sequences, the state is `dp[i][j]` over *a prefix of each*. Edit Distance: minimum insert/delete/replace operations to turn string `a` into string `b`.

```csharp
int EditDistance(string a, string b)
{
    int m = a.Length, n = b.Length;
    // dp[i, j] = edits to turn a[0..i) into b[0..j)
    int[,] dp = new int[m + 1, n + 1];

    // Base cases: turning a prefix into "" costs that many deletions/insertions.
    for (int i = 0; i <= m; i++) dp[i, 0] = i;
    for (int j = 0; j <= n; j++) dp[0, j] = j;

    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
        {
            if (a[i - 1] == b[j - 1])
                dp[i, j] = dp[i - 1, j - 1];            // characters match → no cost
            else
                dp[i, j] = 1 + Math.Min(dp[i - 1, j - 1],      // replace
                                 Math.Min(dp[i - 1, j],        // delete from a
                                          dp[i, j - 1]));      // insert into a
        }

    return dp[m, n];
}
```
```python
def edit_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):      # base: delete all of a's prefix
        dp[i][0] = i
    for j in range(n + 1):      # base: insert all of b's prefix
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]             # match → carry over
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1],    # replace
                                   dp[i - 1][j],        # delete
                                   dp[i][j - 1])        # insert
    return dp[m][n]
```
**The shape:** 2D table over prefixes of two strings; the recurrence always splits into "last characters match" vs "they don't" (and in the mismatch case, the three edit operations). Longest Common Subsequence is the same skeleton with a different recurrence.

---

## Practice Problems

---

### Problem 1 — Partition Equal Subset Sum (LeetCode #416)
**Task:** Can the array be split into two subsets with equal sum?

**Example:** `[1, 5, 11, 5]` → `true` (`[1,5,5]` and `[11]`)

**Key insight:** This is 0/1 knapsack in disguise. If the total is odd, it's impossible. Otherwise the question becomes: "can we pick a subset that sums to `total / 2`?" — a take-it-or-leave-it decision per element.

**Solution:**
```csharp
bool CanPartition(int[] nums)
{
    int total = nums.Sum();
    if (total % 2 != 0) return false;          // odd total can't split evenly
    int target = total / 2;

    // dp[s] = can we form sum s using some subset seen so far?
    var dp = new bool[target + 1];
    dp[0] = true;                               // empty subset sums to 0

    foreach (int num in nums)
        // Iterate downward so each item is used at most once (0/1, not unbounded).
        for (int s = target; s >= num; s--)
            dp[s] = dp[s] || dp[s - num];

    return dp[target];
}
```
```python
def can_partition(nums):
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2

    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for s in range(target, num - 1, -1):   # downward → use each item once
            dp[s] = dp[s] or dp[s - num]
    return dp[target]
```
⏱ Time: O(n × target) | Space: O(target)

---

### Problem 2 — Longest Increasing Subsequence (LeetCode #300)
**Task:** Return the length of the longest strictly increasing subsequence.

**Example:** `[10, 9, 2, 5, 3, 7, 101, 18]` → `4` (`[2, 3, 7, 101]`)

**Solution:** (Pattern 2 directly.)
```csharp
int LengthOfLIS(int[] nums)
{
    int[] dp = new int[nums.Length];
    Array.Fill(dp, 1);
    int best = 1;
    for (int i = 1; i < nums.Length; i++)
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i])
            {
                dp[i] = Math.Max(dp[i], dp[j] + 1);
                best = Math.Max(best, dp[i]);
            }
    return nums.Length == 0 ? 0 : best;
}
```
```python
def length_of_lis(nums):
    if not nums:
        return 0
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)
```
⏱ Time: O(n²) | Space: O(n)

---

### Problem 3 — Longest Common Subsequence (LeetCode #1143)
**Task:** Return the length of the longest subsequence common to two strings.

**Example:** `"abcde"`, `"ace"` → `3` (`"ace"`)

**Key insight:** Two-string shape. `dp[i][j]` = LCS length of the first `i` chars of `a` and first `j` of `b`. If the current characters match, extend the diagonal; otherwise take the best of dropping one character from either string.

**Solution:**
```csharp
int LongestCommonSubsequence(string a, string b)
{
    int m = a.Length, n = b.Length;
    int[,] dp = new int[m + 1, n + 1];          // dp[0, *] and dp[*, 0] = 0 (empty)

    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            if (a[i - 1] == b[j - 1])
                dp[i, j] = dp[i - 1, j - 1] + 1;        // match → extend diagonal
            else
                dp[i, j] = Math.Max(dp[i - 1, j], dp[i, j - 1]);  // drop one char

    return dp[m, n];
}
```
```python
def longest_common_subsequence(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1          # match → extend
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])  # drop a char
    return dp[m][n]
```
⏱ Time: O(m × n) | Space: O(m × n)

---

### Problem 4 — Coin Change II (LeetCode #518)
**Task:** Given coin denominations and an amount, return the **number of combinations** that make up that amount (unlimited coins each).

**Example:** `amount = 5`, `coins = [1, 2, 5]` → `4`

**Key insight:** Contrast with chapter 09's Coin Change (fewest coins). This counts *combinations*, and the loop order matters: iterate **coins on the outside** so you count each combination once (not every ordering). This is the unbounded-knapsack counting variant.

**Solution:**
```csharp
int Change(int amount, int[] coins)
{
    // dp[a] = number of combinations that sum to a.
    var dp = new int[amount + 1];
    dp[0] = 1;                      // one way to make 0: use nothing

    // Coins OUTSIDE, amount inside → combinations, not permutations.
    foreach (int coin in coins)
        for (int a = coin; a <= amount; a++)
            dp[a] += dp[a - coin];

    return dp[amount];
}
```
```python
def change(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1                       # one way to make 0
    for coin in coins:              # coins outer loop = count combinations once
        for a in range(coin, amount + 1):
            dp[a] += dp[a - coin]
    return dp[amount]
```
⏱ Time: O(amount × coins) | Space: O(amount)

---

## From Recurrence to Code: a repeatable recipe

1. **Name the state** in a sentence: "`dp[i][j]` = …". If you can't, you don't understand the problem yet.
2. **Match it to a shape** (0/1 choice, subsequence, grid, two-string) → that fixes the table dimensions.
3. **Write the recurrence** as "best/count of the choices available at this state".
4. **Fill base cases** — usually the empty prefix / first row / first column.
5. **Pick the order** so every value you read is already computed.
6. **Optimise space last** — many 2D tables collapse to 1D (as in Partition Equal Subset Sum).

---

## Common Mistakes

- **Wrong loop direction for 0/1 vs unbounded** — iterate capacity *downward* to use an item once (0/1); *upward* to reuse it (unbounded). Getting this backwards silently changes the problem.
- **Coins/amount loop order** — for *counting combinations*, coins must be the outer loop; swapping counts permutations instead.
- **Answer is `max over dp`, not `dp[last]`** — true for LIS and similar "best ending here" problems.
- **Off-by-one on string DP** — size tables `(m+1) × (n+1)` and index the string with `i-1`/`j-1`.
- **Skipping base cases** — the first row/column is where grid and string DP most often break.

---

## LeetCode Problems to Try Now

- #416 — Partition Equal Subset Sum ⭐ (0/1 knapsack)
- #300 — Longest Increasing Subsequence ⭐ (subsequence shape)
- #1143 — Longest Common Subsequence ⭐⭐ (two-string shape)
- #518 — Coin Change II ⭐⭐ (unbounded counting)
- #64 — Minimum Path Sum (grid shape)
- #72 — Edit Distance ⭐⭐ (two-string, three operations)
- #1049 — Last Stone Weight II (subset-sum in disguise)
