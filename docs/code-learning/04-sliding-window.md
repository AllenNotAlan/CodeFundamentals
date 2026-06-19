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
    // 1. Build the initial window sum of size 'k'.
    int windowSum = 0;
    for (int i = 0; i < k; i++)
        windowSum += nums[i];

    // 2. Initialize 'maxSum' with our first window's sum.
    int maxSum = windowSum;

    // 3. Slide the window from index 'k' to the end of the array.
    for (int i = k; i < nums.Length; i++)
    {
        // 4. Update window sum: add the 'new' element on the right (nums[i])
        //    and subtract the 'old' element on the left (nums[i - k]).
        windowSum += nums[i] - nums[i - k];
        
        // 5. Update maxSum if the new window is larger.
        maxSum = Math.Max(maxSum, windowSum);
    }
    
    return maxSum;
}
```
```python
def max_sum_subarray(nums, k):
    # 1. Calculate sum of the first 'k' elements.
    window_sum = sum(nums[:k])
    max_sum = window_sum
    
    # 2. Iterate from the first element after the initial window.
    for i in range(k, len(nums)):
        # 3. Add current element and subtract the element that just left the window.
        window_sum += nums[i] - nums[i - k]
        
        # 4. Keep track of the highest sum seen.
        max_sum = max(max_sum, window_sum)
        
    return max_sum
```

### Variable window — longest subarray satisfying a condition
```csharp
// Template: find longest subarray with all elements ≤ limit
int LongestValid(int[] nums, int limit)
{
    int left = 0, maxLen = 0;
    
    // 1. 'right' pointer expands the window one element at a time.
    for (int right = 0; right < nums.Length; right++)
    {
        // 2. Update window state with nums[right]
        // (e.g., windowSum += nums[right])

        // 3. If window becomes invalid, shrink from the 'left' until it's valid again.
        while (/* window is invalid */)
        {
            // 4. Undo the effect of nums[left] from the window state.
            // (e.g., windowSum -= nums[left])
            left++;
        }

        // 5. Now that the window is valid, update the maximum length found so far.
        //    Length formula: (right - left + 1)
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
    // 1. Calculate sum for the first 'k' elements.
    double windowSum = 0;
    for (int i = 0; i < k; i++)
        windowSum += nums[i];

    double maxSum = windowSum;
    
    // 2. Slide across the rest of the array.
    for (int i = k; i < nums.Length; i++)
    {
        // 3. Shift window: add new, subtract old.
        windowSum += nums[i] - nums[i - k];
        maxSum = Math.Max(maxSum, windowSum);
    }
    
    // 4. Return the maximum average (sum divided by k).
    return maxSum / k;
}
```
```python
def find_max_average(nums, k):
    # 1. Sum up the first window.
    window_sum = sum(nums[:k])
    max_sum = window_sum
    
    # 2. Loop through the array starting after the first window.
    for i in range(k, len(nums)):
        # 3. Sliding: subtract the 'leftmost' element and add the 'rightmost'.
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
        
    # 4. Result is the maximum sum divided by the number of elements.
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
    // 1. Initialize tracker for the lowest price seen so far.
    int minPrice = int.MaxValue;
    int maxProfit = 0;

    foreach (int price in prices)
    {
        // 2. If current price is lower than our min, update our 'best buy day'.
        if (price < minPrice)
            minPrice = price;           
        
        // 3. Otherwise, check if selling today would result in a higher profit.
        else if (price - minPrice > maxProfit)
            maxProfit = price - minPrice; 
    }
    return maxProfit;
}
```
```python
def max_profit(prices):
    # 1. Start with an infinitely high price and zero profit.
    min_price = float('inf')
    max_profit = 0
    
    for price in prices:
        # 2. Update minimum price whenever we find a lower one.
        if price < min_price:
            min_price = price
            
        # 3. Calculate profit if we sold at the current price.
        #    Update max_profit if this sale is better than previous ones.
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
    // 1. Store the last seen index of each character to jump the left pointer quickly.
    var charIndex = new Dictionary<char, int>(); 
    int left = 0, maxLen = 0;

    for (int right = 0; right < s.Length; right++)
    {
        char c = s[right];
        
        // 2. If 'c' was seen before and its last position is inside our current window...
        if (charIndex.ContainsKey(c) && charIndex[c] >= left)
            // 3. ...move 'left' pointer past the previous occurrence of 'c'.
            //    This effectively removes the duplicate from our window.
            left = charIndex[c] + 1;

        // 4. Update the character's most recent position.
        charIndex[c] = right;
        
        // 5. Update max length based on the current valid window.
        maxLen = Math.Max(maxLen, right - left + 1);
    }
    return maxLen;
}
```
```python
def length_of_longest_substring(s):
    # 1. Dictionary to keep track of character indices.
    char_index = {}
    left = max_len = 0
    
    for right, c in enumerate(s):
        # 2. If character is already in window, move the left boundary.
        if c in char_index and char_index[c] >= left:
            left = char_index[c] + 1
            
        # 3. Record/update the position of the character.
        char_index[c] = right
        
        # 4. Calculate window size and update max.
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

    // 1. Expand the window by moving the 'right' pointer.
    for (int right = 0; right < nums.Length; right++)
    {
        windowSum += nums[right];

        // 2. While the current window sum satisfies the target...
        while (windowSum >= target)
        {
            // 3. ...record the minimum length found so far.
            minLen = Math.Min(minLen, right - left + 1);
            
            // 4. Shrink the window from the left to see if a smaller one also works.
            windowSum -= nums[left++];
        }
    }
    
    // 5. If minLen never changed, no valid subarray was found.
    return minLen == int.MaxValue ? 0 : minLen;
}
```
```python
def min_subarray_len(target, nums):
    # 1. Initialize variables for two pointers and the running sum.
    left = window_sum = 0
    min_len = float('inf')
    
    for right in range(len(nums)):
        # 2. Add current element to window sum.
        window_sum += nums[right]
        
        # 3. Try shrinking the window from the left while the sum is still enough.
        while window_sum >= target:
            # 4. Update the smallest length found.
            min_len = min(min_len, right - left + 1)
            
            # 5. Remove the leftmost element and move the pointer.
            window_sum -= nums[left]
            left += 1
            
    # 6. Return 0 if no valid subarray exists, otherwise the minimum length.
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
