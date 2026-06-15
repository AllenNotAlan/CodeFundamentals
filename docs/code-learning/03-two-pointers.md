# 03 — Two Pointers

A technique where you maintain two indices (pointers) into an array or string, typically moving toward each other or in the same direction. Eliminates the need for nested loops in many situations.

---

## Core Concepts

### When to use it
- Array/string is **sorted** (or you sort it first)
- You need to find **pairs**, **triplets**, or a **subarray** matching a condition
- You're working with a **palindrome**-style problem

### The two flavours

**1. Opposite ends** — start at both ends, move inward:
```
[1, 2, 3, 4, 5]
 ^           ^
left       right
```

**2. Same direction (fast & slow)** — both start at the beginning, move at different speeds:
```
[1, 2, 2, 3, 4]
 ^  ^
slow fast
```

---

## Patterns with Code

### Pattern 1: Opposite-end pointers (sorted array pair sum)
```csharp
// Does any pair in a sorted array sum to target?
bool HasPairSum(int[] sorted, int target)
{
    int left = 0, right = sorted.Length - 1;
    while (left < right)
    {
        int sum = sorted[left] + sorted[right];
        if (sum == target) return true;
        else if (sum < target) left++;   // need bigger sum → move left right
        else right--;                     // need smaller sum → move right left
    }
    return false;
}
```
```python
def has_pair_sum(sorted_arr, target):
    left, right = 0, len(sorted_arr) - 1
    while left < right:
        s = sorted_arr[left] + sorted_arr[right]
        if s == target: return True
        elif s < target: left += 1
        else: right -= 1
    return False
```

### Pattern 2: Fast/slow — remove duplicates in-place
```csharp
// slow pointer tracks the "write position" for unique elements
int RemoveDuplicates(int[] sorted)
{
    if (sorted.Length == 0) return 0;
    int slow = 0;
    for (int fast = 1; fast < sorted.Length; fast++)
    {
        if (sorted[fast] != sorted[slow])
        {
            slow++;
            sorted[slow] = sorted[fast];
        }
    }
    return slow + 1;  // new length
}
```

---

## Practice Problems

---

### Problem 1 — Valid Palindrome (LeetCode #125)
**Task:** A string is a palindrome if it reads the same after keeping only alphanumeric characters and lowercasing. Return true/false.

**Example:** `"A man, a plan, a canal: Panama"` → `true`

**Solution:**
```csharp
bool IsPalindrome(string s)
{
    int left = 0, right = s.Length - 1;
    while (left < right)
    {
        // Skip non-alphanumeric characters
        while (left < right && !char.IsLetterOrDigit(s[left]))  left++;
        while (left < right && !char.IsLetterOrDigit(s[right])) right--;

        if (char.ToLower(s[left]) != char.ToLower(s[right])) return false;
        left++;
        right--;
    }
    return true;
}
```
```python
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():  left += 1
        while left < right and not s[right].isalnum(): right -= 1
        if s[left].lower() != s[right].lower(): return False
        left += 1
        right -= 1
    return True
```
⏱ Time: O(n) | Space: O(1) — no new string created!

---

### Problem 2 — Two Sum II (LeetCode #167)
**Task:** Given a **sorted** array, find two numbers that add up to target. Return 1-indexed positions.

**Example:** `[2, 7, 11, 15]`, `target = 9` → `[1, 2]`

**Solution:**
```csharp
int[] TwoSumSorted(int[] numbers, int target)
{
    int left = 0, right = numbers.Length - 1;
    while (left < right)
    {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return new[] { left + 1, right + 1 };
        else if (sum < target) left++;
        else right--;
    }
    return Array.Empty<int>();
}
```
```python
def two_sum_sorted(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        s = numbers[left] + numbers[right]
        if s == target: return [left + 1, right + 1]
        elif s < target: left += 1
        else: right -= 1
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 3 — Squares of a Sorted Array (LeetCode #977)
**Task:** Given a sorted array of integers (may contain negatives), return sorted array of squares.

**Example:** `[-4, -1, 0, 3, 10]` → `[0, 1, 9, 16, 100]`

**Key insight:** The largest squares come from either end (most negative or most positive). Fill result array from the back.

**Solution:**
```csharp
int[] SortedSquares(int[] nums)
{
    int left = 0, right = nums.Length - 1;
    int[] result = new int[nums.Length];
    int pos = nums.Length - 1;   // fill from the end

    while (left <= right)
    {
        int leftSq  = nums[left]  * nums[left];
        int rightSq = nums[right] * nums[right];
        if (leftSq > rightSq)
        {
            result[pos--] = leftSq;
            left++;
        }
        else
        {
            result[pos--] = rightSq;
            right--;
        }
    }
    return result;
}
```
```python
def sorted_squares(nums):
    left, right = 0, len(nums) - 1
    result = [0] * len(nums)
    pos = len(nums) - 1
    while left <= right:
        if abs(nums[left]) > abs(nums[right]):
            result[pos] = nums[left] ** 2
            left += 1
        else:
            result[pos] = nums[right] ** 2
            right -= 1
        pos -= 1
    return result
```
⏱ Time: O(n) | Space: O(n)

---

### Problem 4 — Move Zeroes (LeetCode #283)
**Task:** Move all zeroes to the end of the array in-place, maintaining relative order of non-zero elements.

**Example:** `[0, 1, 0, 3, 12]` → `[1, 3, 12, 0, 0]`

**Solution (fast/slow pointers):**
```csharp
void MoveZeroes(int[] nums)
{
    int slow = 0;  // next position to place a non-zero element
    for (int fast = 0; fast < nums.Length; fast++)
    {
        if (nums[fast] != 0)
        {
            nums[slow] = nums[fast];
            if (slow != fast) nums[fast] = 0;  // leave a zero behind
            slow++;
        }
    }
    // Fill remaining positions with zeroes
    while (slow < nums.Length) nums[slow++] = 0;
}
```
```python
def move_zeroes(nums):
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
```
⏱ Time: O(n) | Space: O(1)

---

## Common Mistakes

- **Using two pointers on an unsorted array** when the algorithm needs sorted input — always check if sorting is required.
- **Infinite loops** — make sure *at least one pointer always moves* each iteration.
- **`left < right` vs `left <= right`** — use `<=` when you need to process the case where both pointers meet (like in #977 above).

---

## LeetCode Problems to Try Now

- #125 — Valid Palindrome ⭐
- #167 — Two Sum II
- #977 — Squares of a Sorted Array
- #283 — Move Zeroes ⭐
- #26 — Remove Duplicates from Sorted Array
