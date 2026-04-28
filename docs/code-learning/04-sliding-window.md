# 04 — Sliding Window

The sliding window technique maintains a contiguous subarray (or substring) as you slide it across the input. It transforms O(n²) nested-loop solutions into O(n).

---

## Core Concepts

Think of a window frame sliding across your data:
```
[1, 3, 2, 6, 4, 5]
 [---]               window at start
    [---]            slide right...
       [---]
```

### Two types of windows

**Fixed size window** — the window has a set width `k`.
- Move both start and end together after the initial window is established.

**Variable size window** — the window grows/shrinks based on a condition.
- Use two pointers: expand `right`, shrink from `left` when the condition is violated.

---

## Patterns with Code

### Fixed window — sliding max sum of size k
```csharp
int MaxSumSubarray(int[] nums, int k)
{
    // Build first window
    int windowSum = 0;
    for (int i = 0; i < k; i++)
        windowSum += nums[i];

    int maxSum = windowSum;

    // Slide: add new element on right, remove old element on left
    for (int i = k; i < nums.Length; i++)
    {
        windowSum += nums[i] - nums[i - k];
        maxSum = Math.Max(maxSum, windowSum);
    }
    return maxSum;
}
```
```python
def max_sum_subarray(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum
```

### Variable window — longest subarray satisfying a condition
```csharp
// Template: find longest subarray with all elements ≤ limit
int LongestValid(int[] nums, int limit)
{
    int left = 0, maxLen = 0;
    for (int right = 0; right < nums.Length; right++)
    {
        // Expand window to include nums[right]
        // ... update window state ...

        // Shrink from left until window is valid again
        while (/* window is invalid */)
        {
            // ... undo nums[left] from window state ...
            left++;
        }

        maxLen = Math.Max(maxLen, right - left + 1);
    }
    return maxLen;
}
```

---

## Practice Problems

---

### Problem 1 — Maximum Average Subarray I (LeetCode #643)
**Task:** Find the maximum average of a contiguous subarray of length exactly k.

**Example:** `[1, 12, -5, -6, 50, 3]`, `k = 4` → `12.75` (subarray `[12, -5, -6, 50]`)

**Solution:**
```csharp
double FindMaxAverage(int[] nums, int k)
{
    double windowSum = 0;
    for (int i = 0; i < k; i++)
        windowSum += nums[i];

    double maxSum = windowSum;
    for (int i = k; i < nums.Length; i++)
    {
        windowSum += nums[i] - nums[i - k];
        maxSum = Math.Max(maxSum, windowSum);
    }
    return maxSum / k;
}
```
```python
def find_max_average(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum / k
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 2 — Best Time to Buy and Sell Stock (LeetCode #121)
**Task:** Given daily prices, find the maximum profit from one buy and one sell (buy before sell).

**Example:** `[7, 1, 5, 3, 6, 4]` → `5` (buy at 1, sell at 6)

**Key insight:** Track the minimum price seen so far (your best buy day). At each day, check if selling today gives a better profit.

**Solution:**
```csharp
int MaxProfit(int[] prices)
{
    int minPrice = int.MaxValue;
    int maxProfit = 0;

    foreach (int price in prices)
    {
        if (price < minPrice)
            minPrice = price;           // found a better buy day
        else if (price - minPrice > maxProfit)
            maxProfit = price - minPrice; // found a better profit
    }
    return maxProfit;
}
```
```python
def max_profit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 3 — Longest Substring Without Repeating Characters (LeetCode #3)
**Task:** Return the length of the longest substring with all unique characters.

**Example:** `"abcabcbb"` → `3` (substring `"abc"`)

**Solution (variable window):**
```csharp
int LengthOfLongestSubstring(string s)
{
    var charIndex = new Dictionary<char, int>(); // char → last seen index
    int left = 0, maxLen = 0;

    for (int right = 0; right < s.Length; right++)
    {
        char c = s[right];
        // If we've seen c and it's inside our current window, shrink from left
        if (charIndex.ContainsKey(c) && charIndex[c] >= left)
            left = charIndex[c] + 1;

        charIndex[c] = right;
        maxLen = Math.Max(maxLen, right - left + 1);
    }
    return maxLen;
}
```
```python
def length_of_longest_substring(s):
    char_index = {}
    left = max_len = 0
    for right, c in enumerate(s):
        if c in char_index and char_index[c] >= left:
            left = char_index[c] + 1
        char_index[c] = right
        max_len = max(max_len, right - left + 1)
    return max_len
```
⏱ Time: O(n) | Space: O(1) — at most 128 ASCII chars

---

### Problem 4 — Minimum Size Subarray Sum (LeetCode #209)
**Task:** Return the minimum length of a contiguous subarray whose sum ≥ target. Return 0 if impossible.

**Example:** `target = 7`, `[2, 3, 1, 2, 4, 3]` → `2` (subarray `[4, 3]`)

**Solution:**
```csharp
int MinSubArrayLen(int target, int[] nums)
{
    int left = 0, windowSum = 0;
    int minLen = int.MaxValue;

    for (int right = 0; right < nums.Length; right++)
    {
        windowSum += nums[right];

        // Window is valid: try to shrink it
        while (windowSum >= target)
        {
            minLen = Math.Min(minLen, right - left + 1);
            windowSum -= nums[left++];
        }
    }
    return minLen == int.MaxValue ? 0 : minLen;
}
```
```python
def min_subarray_len(target, nums):
    left = window_sum = 0
    min_len = float('inf')
    for right in range(len(nums)):
        window_sum += nums[right]
        while window_sum >= target:
            min_len = min(min_len, right - left + 1)
            window_sum -= nums[left]
            left += 1
    return 0 if min_len == float('inf') else min_len
```
⏱ Time: O(n) | Space: O(1)

---

## Recognising Sliding Window Problems

Ask yourself:
> *"Does the problem ask about a contiguous subarray/substring with some condition on its contents?"*

If yes → **sliding window**.

Signal words: *"maximum/minimum subarray"*, *"longest/shortest substring"*, *"all distinct characters"*, *"sum equal to / at least"*.

---

## Common Mistakes

- **Forgetting to shrink** the window when the condition is violated.
- **Window size formula:** `right - left + 1` (both inclusive).
- **Fixed vs variable confusion** — re-read the problem to confirm whether `k` is fixed.

---

## LeetCode Problems to Try Now

- #121 — Best Time to Buy and Sell Stock ⭐
- #3 — Longest Substring Without Repeating Characters ⭐
- #643 — Maximum Average Subarray I
- #209 — Minimum Size Subarray Sum
- #1004 — Max Consecutive Ones III (variable window with a budget)
