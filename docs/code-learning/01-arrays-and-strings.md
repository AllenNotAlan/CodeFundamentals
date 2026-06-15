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
int[] nums = { 1, 2, 3, 4, 5 };
for (int i = 0; i < nums.Length; i++)
{
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

// Prefix Sums
int[] prefix = new int[n];
prefix[0] = nums[0];
for (int i = 1; i < n; i++)
    prefix[i] = prefix[i - 1] + nums[i];

// Suffix Sums
int[] suffix = new int[n];
suffix[n - 1] = nums[n - 1];
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
    int left = 0, right = arr.Length - 1;
    while (left < right)
    {
        (arr[left], arr[right]) = (arr[right], arr[left]);
        left++;
        right--;
    }
}
```

### 4. StringBuilder for string building
```csharp
var sb = new StringBuilder();
for (int i = 0; i < 1000; i++)
    sb.Append(i);           // O(n) total — no repeated allocation
string result = sb.ToString();
```

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
    int max = nums[0];          // start with first element
    for (int i = 1; i < nums.Length; i++)
    {
        if (nums[i] > max)
            max = nums[i];
    }
    return max;
}
```
```python
def find_max(nums):
    max_val = nums[0]
    for n in nums[1:]:
        if n > max_val:
            max_val = n
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
    int left = 0, right = s.Length - 1;
    while (left < right)
    {
        (s[left], s[right]) = (s[right], s[left]);
        left++;
        right--;
    }
}
```
```python
def reverse_string(s):
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
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
    for (int i = 1; i < nums.Length; i++)
        nums[i] += nums[i - 1];     // each element becomes its own prefix sum
    return nums;
}
```
```python
def running_sum(nums):
    for i in range(1, len(nums)):
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
    // Keep only alphanumeric, lowercase
    var filtered = new string(s.Where(char.IsLetterOrDigit).ToArray()).ToLower();
    int left = 0, right = filtered.Length - 1;
    while (left < right)
    {
        if (filtered[left] != filtered[right]) return false;
        left++;
        right--;
    }
    return true;
}
```
```python
def is_palindrome(s):
    filtered = [c.lower() for c in s if c.isalnum()]
    left, right = 0, len(filtered) - 1
    while left < right:
        if filtered[left] != filtered[right]:
            return False
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
    left[0] = 1; 
    for (int i = 1; i < n; i++)
        left[i] = left[i-1] * nums[i-1];

    // 2. Build the suffix array (products of everything to the right)
    right[n-1] = 1;
    for (int i = n-2; i >= 0; i--)
        right[i] = right[i+1] * nums[i+1];

    // 3. The answer is simply left * right
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
