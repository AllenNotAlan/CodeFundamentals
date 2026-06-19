# 01 — Arrays & Strings

Arrays and strings are the bread and butter of LeetCode. Almost every problem touches them.

---

## Core Concepts

### Arrays
- Contiguous block of memory; **O(1) access by index**.
- Searching without sorting: **O(n)**.
- Inserting/removing in the middle: **O(n)** (elements shift).

### Strings
- In C#, strings are **immutable** — every `+` creates a new string. Use `StringBuilder` when building strings in a loop.
- Common operations: `Length`, `Substring`, `IndexOf`, `ToCharArray`, `Split`, `Trim`.

---

## Essential Patterns

### 1. Iterate with index
```csharp
// Step-by-step:
// 1. Initialize an array of integers.
int[] nums = { 1, 2, 3, 4, 5 };

// 2. Start a loop from index 0 up to (but not including) the length of the array.
//    We use 'i < nums.Length' to stay within the array's bounds (0 to 4).
for (int i = 0; i < nums.Length; i++)
{
    // 3. Access the element at the current index 'i' and print it.
    Console.WriteLine(nums[i]);
}
```

### 2. Prefix & Suffix Patterns — Precompute totals for fast lookups

These patterns are used to avoid repeated work. Instead of recalculating a sum or product for every index (which is slow), you "pre-calculate" it once.

- **Prefix:** Information about everything *before* or *up to* the current index (left-to-right).
- **Suffix:** Information about everything *after* or *from* the current index (right-to-left).

**Visualization (Sum example):**
```text
nums:      [ 1,  2,  3,  4 ]
--------------------------
Prefix:    [ 1,  3,  6, 10 ]  (Summing left to right: 1, 1+2, 1+2+3, ...)
Suffix:    [10,  9,  7,  4 ]  (Summing right to left: 4+3+2+1, 4+3+2, 4+3, 4)
```

**C# Implementation:**
```csharp
int[] nums = { 1, 2, 3, 4 };
int n = nums.Length;

// Prefix Sums: Building sums from left to right
int[] prefix = new int[n];
// 1. The first prefix sum is just the first number.
prefix[0] = nums[0];
// 2. For each following index, add the current number to the previous prefix sum.
for (int i = 1; i < n; i++)
    prefix[i] = prefix[i - 1] + nums[i];

// Suffix Sums: Building sums from right to left
int[] suffix = new int[n];
// 1. The last suffix sum is just the last number.
suffix[n - 1] = nums[n - 1];
// 2. Loop backwards: add the current number to the 'next' suffix sum (to the right).
for (int i = n - 2; i >= 0; i--)
    suffix[i] = suffix[i + 1] + nums[i];
```

**Why use this?**
- **Range Queries:** To find the sum of `nums[1..3]`, you can just do `prefix[3] - prefix[0]` in **O(1)** time instead of looping.
- **Context:** At any index `i`, you now know everything about the "left side" and "right side" instantly.

---

### 3. Reverse in-place
```csharp
void Reverse(int[] arr)
{
    // 1. Initialize two pointers: one at the start, one at the end.
    int left = 0, right = arr.Length - 1;

    // 2. Continue as long as pointers haven't met or crossed.
    while (left < right)
    {
        // 3. Swap elements at left and right using a tuple (C# 7+).
        //    This effectively moves the 'end' element to the 'front' and vice versa.
        (arr[left], arr[right]) = (arr[right], arr[left]);

        // 4. Move pointers towards the center.
        left++;
        right--;
    }
}
```

**Why use this?**
- **Memory Optimization:** You reverse the data using only **O(1)** extra space. No need to allocate a second array.
- **Two-Pointer Foundation:** This is the simplest example of the "Two-Pointer" pattern, which is used for many complex problems (like Palindromes).

### 4. StringBuilder for string building
```csharp
// 1. Initialize StringBuilder which uses an internal buffer.
var sb = new StringBuilder();

// 2. Append 1000 integers to the buffer.
for (int i = 0; i < 1000; i++)
    sb.Append(i);           // Efficiently adds to existing memory

// 3. Convert the completed buffer into a single string.
string result = sb.ToString();
```

**Why use this?**
- **Avoid "O(N²)" Performance Traps:** In C#, strings are immutable. Every `str += "x"` creates a brand new string, copying all previous characters. In a loop, this becomes extremely slow.
- **Efficiency:** `StringBuilder` uses a single, expandable buffer to store characters, making it **O(N)** total time.

---

## Practice Problems

---

### Problem 1 — Find Maximum in Array
**Task:** Return the largest number in an array of integers.

**Example:** `[3, 7, 1, 9, 4]` → `9`

**Think first:** You need to look at every element — no shortcut.

**Solution:**
```csharp
int FindMax(int[] nums)
{
    // 1. Assume the first number is the maximum initially.
    int max = nums[0];          
    
    // 2. Iterate through the rest of the array (starting at index 1).
    for (int i = 1; i < nums.Length; i++)
    {
        // 3. If we find a larger number, update our 'max' tracker.
        if (nums[i] > max)
            max = nums[i];
    }
    
    // 4. After checking everything, 'max' holds the largest value.
    return max;
}
```
```python
def find_max(nums):
    # 1. Start by tracking the first element as the max.
    max_val = nums[0]
    
    # 2. Iterate through every element starting from the second one.
    for n in nums[1:]:
        # 3. Compare current element with our current max; update if larger.
        if n > max_val:
            max_val = n
            
    # 4. Return the largest value found.
    return max_val
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 2 — Reverse a String (LeetCode #344)
**Task:** Reverse a char array in-place.

**Example:** `['h','e','l','l','o']` → `['o','l','l','e','h']`

**Solution:**
```csharp
void ReverseString(char[] s)
{
    // 1. Set pointers at both boundaries.
    int left = 0, right = s.Length - 1;
    
    // 2. Swap elements while moving pointers toward the middle.
    while (left < right)
    {
        // 3. Swap values at left and right indices.
        (s[left], s[right]) = (s[right], s[left]);
        
        // 4. Shrink the window.
        left++;
        right--;
    }
}
```
```python
def reverse_string(s):
    # 1. Initialize two pointers for the start and end of the string.
    left, right = 0, len(s) - 1
    
    # 2. Loop until the pointers meet in the middle.
    while left < right:
        # 3. Swap the characters at the left and right positions.
        s[left], s[right] = s[right], s[left]
        
        # 4. Move pointers inward to process the next pair of characters.
        left += 1
        right -= 1
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 3 — Running Sum of Array (LeetCode #1480)
**Task:** Return an array where each element is the sum of all elements up to that index.

**Example:** `[1, 2, 3, 4]` → `[1, 3, 6, 10]`

**Solution:**
```csharp
int[] RunningSum(int[] nums)
{
    // 1. Start from index 1 (the second element).
    for (int i = 1; i < nums.Length; i++)
        // 2. Add the value of the previous element to the current one.
        //    This effectively accumulates the sum as we move forward.
        nums[i] += nums[i - 1];     
        
    return nums;
}
```
```python
def running_sum(nums):
    # 1. Iterate through the array starting from the second index.
    for i in range(1, len(nums)):
        # 2. Update the current element by adding the previous element's value.
        #    This creates a cumulative total at each position.
        nums[i] += nums[i - 1]
        
    return nums
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 4 — Check if Palindrome (LeetCode #125 simplified)
**Task:** Return true if a string reads the same forwards and backwards (ignore case, letters only).

**Example:** `"racecar"` → `true`, `"hello"` → `false`

**Solution:**
```csharp
bool IsPalindrome(string s)
{
    // 1. Filter out non-alphanumeric characters and convert to lowercase.
    //    This ensures we only compare relevant characters consistently.
    var filtered = new string(s.Where(char.IsLetterOrDigit).ToArray()).ToLower();
    
    // 2. Initialize pointers at both ends of the cleaned string.
    int left = 0, right = filtered.Length - 1;
    
    // 3. Compare characters moving inward.
    while (left < right)
    {
        // 4. If characters don't match, it's not a palindrome.
        if (filtered[left] != filtered[right]) return false;
        
        left++;
        right--;
    }
    
    // 5. If we reach the middle without a mismatch, it's a palindrome.
    return true;
}
```
```python
def is_palindrome(s):
    # 1. Clean the string: keep only letters/numbers and normalize to lowercase.
    filtered = [c.lower() for c in s if c.isalnum()]
    
    # 2. Use two pointers to compare the start and end.
    left, right = 0, len(filtered) - 1
    
    while left < right:
        # 3. Mismatch means it's not the same forwards and backwards.
        if filtered[left] != filtered[right]:
            return False
            
        # 4. Move pointers toward each other.
        left += 1
        right -= 1
        
    return True
```
⏱ Time: O(n) | Space: O(n)

---

### Problem 5 — Product of Array Except Self (LeetCode #238)
**Task:** Given an array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.

**Example:** `[1, 2, 3, 4]` → `[24, 12, 8, 6]`

**The "Aha!" Moment:**
If you can't use division, how do you know what the product of "everything else" is? 
For any index `i`, "everything else" is just:
1. Everything to the **left** of `i`.
2. Everything to the **right** of `i`.

If we pre-calculate these two sides, the answer for `i` is simply `left_product * right_product`.

**Step-by-Step Walkthrough (`nums = [1, 2, 3, 4]`):**

1. **Calculate Left Products (Prefix):**
   - At index 0, there's nothing to the left, so we use `1`.
   - Each subsequent index is `previous_left_product * previous_num`.
   - Result: `[1, 1, 2, 6]`
   *(Note: `6` at the end is `1 * 2 * 3`)*

2. **Calculate Right Products (Suffix):**
   - We go backwards! At the last index, there's nothing to the right, so we use `1`.
   - Each previous index is `next_right_product * next_num`.
   - Result: `[24, 12, 4, 1]`
   *(Note: `24` at the start is `4 * 3 * 2`)*

3. **Combine them:**
   - Multiply `left[i] * right[i]` for every index.
   - `1*24=24`, `1*12=12`, `2*4=8`, `6*1=6`.
   - Final Result: `[24, 12, 8, 6]`

**Solution:**
```csharp
int[] ProductExceptSelf(int[] nums) {
    int n = nums.Length;
    int[] left = new int[n];
    int[] right = new int[n];
    int[] res = new int[n];

    // 1. Build the prefix array (products of everything to the left)
    //    Initially, there is nothing to the left of the first element, so set to 1.
    left[0] = 1; 
    for (int i = 1; i < n; i++)
        // Each spot stores the product of all elements to its left.
        left[i] = left[i-1] * nums[i-1];

    // 2. Build the suffix array (products of everything to the right)
    //    There is nothing to the right of the last element, so set to 1.
    right[n-1] = 1;
    for (int i = n-2; i >= 0; i--)
        // Working backwards, each spot stores the product of all elements to its right.
        right[i] = right[i+1] * nums[i+1];

    // 3. The answer for any index is simply (product of left) * (product of right)
    for (int i = 0; i < n; i++)
        res[i] = left[i] * right[i];

    return res;
}
```
⏱ Time: O(n) | Space: O(n)


---

## Common Mistakes

- **Off-by-one errors** — double check `< Length` vs `<= Length - 1`.
- **Mutating while iterating** — don't add/remove from a collection you're looping over.
- **String concatenation in loops** — use `StringBuilder` in C#.
- **Not handling empty input** — always ask: what if the array has 0 or 1 elements?

---

## LeetCode Problems to Try Now

- #1480 — Running Sum of 1d Array ⭐ (easy warm-up)
- #344 — Reverse String
- #1 — Two Sum (preview of hash maps, try brute force first)
- #238 — Product of Array Except Self (great prefix/suffix challenge)
