# 09 — Dynamic Programming (Introduction)

Dynamic programming (DP) sounds scary but at its core it's simple: **solve a big problem by breaking it into smaller subproblems and caching the results so you don't recompute them.**

---

## Core Concepts

### When to use DP
Ask: *"Can this problem be broken into overlapping subproblems?"*

Signal words: *"number of ways"*, *"minimum/maximum cost"*, *"can you reach / is it possible"*, *"how many combinations"*.

### Two approaches

**1. Top-down (Memoization)** — recursive, cache results in a dictionary/array.
```
fib(5)
  fib(4) + fib(3)
    fib(3) + fib(2)   ← fib(3) computed TWICE without memoization
```
With memo: store `fib(3) = 2` after first compute, return it instantly the second time.

**2. Bottom-up (Tabulation)** — iterative, fill a table from smallest subproblem upward.
```
fib[0] = 0
fib[1] = 1
fib[2] = fib[1] + fib[0] = 1
fib[3] = fib[2] + fib[1] = 2
...
```

Both have **O(n) time** (each subproblem solved once). Bottom-up usually has better constant factors and no recursion stack overhead.

---

## The DP Thought Process

1. **Define the subproblem:** What does `dp[i]` mean?
2. **Write the recurrence:** How does `dp[i]` relate to smaller subproblems?
3. **Identify base cases:** What are the smallest inputs?
4. **Determine iteration order:** Smaller subproblems must be solved first.

---

## Practice Problems

---

### Problem 1 — Fibonacci Number (LeetCode #509)
**Task:** Return the nth Fibonacci number (0, 1, 1, 2, 3, 5, 8, ...).

**Naive recursion (exponential — don't do this):**
```csharp
int Fib(int n)
{
    // 1. Base cases: return n if it is 0 or 1
    if (n <= 1) return n;
    
    // 2. Recursive step: calculate sum of two preceding numbers
    //    Warning: This recalculates the same subproblems many times!
    return Fib(n - 1) + Fib(n - 2);
}
```

**Top-down with memo:**
```csharp
int Fib(int n, Dictionary<int, int> memo = null)
{
    // 1. Initialize the cache if it doesn't exist
    memo ??= new Dictionary<int, int>();
    
    // 2. Base cases
    if (n <= 1) return n;
    
    // 3. Check the cache: If we've solved this 'n' before, return it instantly
    if (memo.ContainsKey(n)) return memo[n];
    
    // 4. Solve and store: Compute the result and save it in the memo before returning
    memo[n] = Fib(n - 1, memo) + Fib(n - 2, memo);
    return memo[n];
}
```

**Bottom-up (most efficient):**
```csharp
int Fib(int n)
{
    // 1. Base cases
    if (n <= 1) return n;
    
    // 2. Instead of a full array, we only need the last two values
    int prev2 = 0, prev1 = 1;
    
    // 3. Build the solution from 2 up to n
    for (int i = 2; i <= n; i++)
    {
        // 4. Current is the sum of previous two
        int curr = prev1 + prev2;
        
        // 5. Shift pointers forward for the next iteration
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}
```
```python
def fib(n):
    if n <= 1: return n
    
    # 1. Initialize base values
    prev2, prev1 = 0, 1
    
    # 2. Iterate from 2 to n
    for _ in range(2, n + 1):
        # 3. Update pointers (Python allows simultaneous assignment)
        prev2, prev1 = prev1, prev1 + prev2
        
    return prev1
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 2 — Climbing Stairs (LeetCode #70)
**Task:** You can climb 1 or 2 stairs at a time. How many distinct ways to reach the top of n stairs?

**Example:** `n = 4` → `5` ways: (1+1+1+1), (2+1+1), (1+2+1), (1+1+2), (2+2)

**Key insight:** To reach stair `n`, you either came from stair `n-1` (took 1 step) or stair `n-2` (took 2 steps). So `dp[n] = dp[n-1] + dp[n-2]` — it's Fibonacci!

**Solution:**
```csharp
int ClimbStairs(int n)
{
    // 1. Base cases: 1 way for 1 step, 2 ways for 2 steps
    if (n <= 2) return n;
    
    // 2. We only need the results of the two previous stairs
    int prev2 = 1, prev1 = 2;
    
    // 3. Iteratively calculate ways for each stair from 3 to n
    for (int i = 3; i <= n; i++)
    {
        // 4. Current stair's ways = ways(i-1) + ways(i-2)
        int curr = prev1 + prev2;
        
        // 5. Shift pointers
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}
```
```python
def climb_stairs(n):
    if n <= 2: return n
    
    # 1. Base values for n=1 and n=2
    prev2, prev1 = 1, 2
    
    # 2. Compute upward to n
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
        
    return prev1
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 3 — House Robber (LeetCode #198)
**Task:** You're a robber along a street of houses. You can't rob two adjacent houses. Maximise the total.

**Example:** `[2, 7, 9, 3, 1]` → `12` (rob houses 0, 2, 4: 2+9+1=12)

**Subproblem:** `dp[i]` = max money robbing houses `0..i`

**Recurrence:**
```
dp[i] = max(
    dp[i-1],          // skip house i
    dp[i-2] + nums[i] // rob house i (can't have robbed i-1)
)
```

**Solution:**
```csharp
int Rob(int[] nums)
{
    // 1. Edge case: Only one house to rob
    if (nums.Length == 1) return nums[0];

    // 2. Base cases:
    //    prev2: max money up to the house before last
    //    prev1: max money up to the last house
    int prev2 = nums[0];
    int prev1 = Math.Max(nums[0], nums[1]);

    for (int i = 2; i < nums.Length; i++)
    {
        // 3. For current house i, we decide:
        //    - Skip it: keep the max money from prev1
        //    - Rob it: add its value to the max money from prev2
        int curr = Math.Max(prev1, prev2 + nums[i]);
        
        // 4. Update previous states for next house
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}
```
```python
def rob(nums):
    if len(nums) == 1: return nums[0]
    
    # 1. Initialize max money for first two houses
    prev2, prev1 = nums[0], max(nums[0], nums[1])
    
    # 2. Iterate through the rest of the houses
    for i in range(2, len(nums)):
        # 3. Decision: rob current house or skip it
        prev2, prev1 = prev1, max(prev1, prev2 + nums[i])
        
    return prev1
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 4 — Coin Change (LeetCode #322)
**Task:** Given coin denominations and a target amount, return the fewest coins needed, or -1 if impossible.

**Example:** `coins = [1, 5, 11]`, `amount = 15` → `3` (5+5+5, not 11+1+1+1+1)

**Subproblem:** `dp[i]` = min coins to make amount `i`

**Recurrence:**
```
dp[i] = min over all coins c where c <= i:
    1 + dp[i - c]
```

**Solution:**
```csharp
int CoinChange(int[] coins, int amount)
{
    // 1. Create a DP table where dp[i] is the min coins for amount i
    int[] dp = new int[amount + 1];
    
    // 2. Initialize with "infinity" (amount + 1 is safe because the 
    //    maximum number of coins possible is 'amount' using 1-cent coins)
    Array.Fill(dp, amount + 1);  
    
    // 3. Base case: It takes 0 coins to make an amount of 0
    dp[0] = 0;                    

    // 4. Outer loop: Iterate through every amount from 1 to target
    for (int i = 1; i <= amount; i++)
    {
        // 5. Inner loop: Try every coin to see if it can contribute to amount i
        foreach (int coin in coins)
        {
            // If the coin is smaller than or equal to the current amount i
            if (coin <= i)
            {
                // Decision: Min(current value, 1 + coins needed for the remainder)
                dp[i] = Math.Min(dp[i], 1 + dp[i - coin]);
            }
        }
    }
    
    // 6. If dp[amount] is still "infinity", it means the amount is impossible
    return dp[amount] > amount ? -1 : dp[amount];
}
```
```python
def coin_change(coins, amount):
    # 1. Initialize DP table with float('inf')
    dp = [float('inf')] * (amount + 1)
    
    # 2. Base case: 0 coins for amount 0
    dp[0] = 0
    
    # 3. Build up from smallest amount to target
    for i in range(1, amount + 1):
        # 4. Check every coin denomination
        for coin in coins:
            if coin <= i:
                # 5. Update min coins needed for amount i
                dp[i] = min(dp[i], 1 + dp[i - coin])
                
    # 6. Return -1 if the target amount is still infinity
    return dp[amount] if dp[amount] != float('inf') else -1
```
⏱ Time: O(amount × coins) | Space: O(amount)

---

### Problem 5 — Unique Paths (LeetCode #62)
**Task:** A robot on an `m × n` grid can only move right or down. How many paths from top-left to bottom-right?

**Subproblem:** `dp[i][j]` = number of paths to reach cell `(i,j)`

**Recurrence:** You can only come from above or from the left:
```
dp[i][j] = dp[i-1][j] + dp[i][j-1]
```
**Base cases:** Top row and left column all have exactly 1 path.

**Solution:**
```csharp
int UniquePaths(int m, int n)
{
    // 1. Create a 2D table to store path counts for each cell
    int[,] dp = new int[m, n];

    // 2. Base cases: There is only 1 way to reach any cell in the 
    //    first column (only moving down) or first row (only moving right).
    for (int i = 0; i < m; i++) dp[i, 0] = 1;
    for (int j = 0; j < n; j++) dp[0, j] = 1;

    // 3. Fill the rest of the grid
    for (int i = 1; i < m; i++)
    {
        for (int j = 1; j < n; j++)
        {
            // 4. Logic: Paths to cell (i,j) = paths from above + paths from left
            dp[i, j] = dp[i - 1, j] + dp[i, j - 1];
        }
    }

    // 5. The answer is in the bottom-right corner
    return dp[m - 1, n - 1];
}
```
```python
def unique_paths(m, n):
    # 1. Initialize a 2D grid with 1s (this covers the base cases automatically)
    dp = [[1] * n for _ in range(m)]
    
    # 2. Iterate through the grid starting from (1, 1)
    for i in range(1, m):
        for j in range(1, n):
            # 3. Sum paths from top and left neighbors
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
            
    # 4. Return result for the target cell
    return dp[m-1][n-1]
```
⏱ Time: O(m×n) | Space: O(m×n)

---

## Spotting DP vs Greedy

| | Greedy | DP |
|-|--------|----|
| Approach | Always make the locally optimal choice | Consider all choices, cache results |
| Example | "Always take the largest coin" | "Find the minimum coins regardless of order" |
| Coin change | **Fails** for `[1,5,11]`, amount 15 | **Works** |

---

## Common Mistakes

- **Not defining `dp[i]` clearly** — write it as a sentence before coding.
- **Wrong base cases** — trace through small examples (n=0, n=1, n=2) manually.
- **Accessing out of bounds** — make sure `dp` is sized `n+1` when you index by `n`.
- **Forgetting to initialise "infinity"** — use `amount + 1` or `int.MaxValue / 2` (not `MaxValue` — adding 1 overflows!).

---

## LeetCode Problems to Try Now

- #509 — Fibonacci Number ⭐
- #70 — Climbing Stairs ⭐
- #198 — House Robber ⭐
- #322 — Coin Change
- #62 — Unique Paths
- #746 — Min Cost Climbing Stairs (very similar to Climbing Stairs)
