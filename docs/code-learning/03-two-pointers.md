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
    // 1. Initialize pointers at the start and end of the sorted array.
    int left = 0, right = sorted.Length - 1;
    
    // 2. Loop until the pointers meet.
    while (left < right)
    {
        // 3. Calculate the sum of elements at current pointer positions.
        int sum = sorted[left] + sorted[right];
        
        // 4. Case: Match found.
        if (sum == target) return true;
        
        // 5. Case: Sum is too small. 
        //    Because the array is sorted, moving the 'left' pointer right increases the sum.
        else if (sum < target) left++;   
        
        // 6. Case: Sum is too large.
        //    Moving the 'right' pointer left decreases the sum.
        else right--;                     
    }
    
    // 7. No such pair exists.
    return false;
}
```
```python
def has_pair_sum(sorted_arr, target):
    # 1. Start pointers at extremes.
    left, right = 0, len(sorted_arr) - 1
    
    while left < right:
        # 2. Check current total.
        s = sorted_arr[left] + sorted_arr[right]
        
        if s == target: 
            return True
            
        # 3. Sum too small? Move left pointer up to get a larger value.
        elif s < target: 
            left += 1
            
        # 4. Sum too large? Move right pointer down to get a smaller value.
        else: 
            right -= 1
            
    return False
```

### Pattern 2: Fast/slow — remove duplicates in-place
```csharp
// slow pointer tracks the "write position" for unique elements
int RemoveDuplicates(int[] sorted)
{
    // 1. Edge case: empty array has 0 unique elements.
    if (sorted.Length == 0) return 0;
    
    // 2. 'slow' will represent the index of the last confirmed unique element.
    int slow = 0;
    
    // 3. 'fast' explores every element starting from the second one.
    for (int fast = 1; fast < sorted.Length; fast++)
    {
        // 4. If we find a value different from the last unique one...
        if (sorted[fast] != sorted[slow])
        {
            // 5. ...increment 'slow' to the next available spot and store the new value.
            slow++;
            sorted[slow] = sorted[fast];
        }
    }
    
    // 6. The number of unique elements is 'slow index + 1'.
    return slow + 1;  
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
    // 1. Set pointers at both ends of the string.
    int left = 0, right = s.Length - 1;
    
    while (left < right)
    {
        // 2. Increment left pointer if current char is not a letter or digit.
        //    We must keep checking 'left < right' to avoid going out of bounds.
        while (left < right && !char.IsLetterOrDigit(s[left]))  left++;
        
        // 3. Decrement right pointer if current char is non-alphanumeric.
        while (left < right && !char.IsLetterOrDigit(s[right])) right--;

        // 4. Perform a case-insensitive comparison.
        if (char.ToLower(s[left]) != char.ToLower(s[right])) return false;
        
        // 5. Move inward for the next check.
        left++;
        right--;
    }
    return true;
}
```
```python
def is_palindrome(s):
    # 1. Set up start and end pointers.
    left, right = 0, len(s) - 1
    
    while left < right:
        # 2. Skip non-alphanumeric characters from the left.
        while left < right and not s[left].isalnum():  left += 1
        
        # 3. Skip non-alphanumeric characters from the right.
        while left < right and not s[right].isalnum(): right -= 1
        
        # 4. Compare characters at pointers (case-insensitive).
        if s[left].lower() != s[right].lower(): return False
        
        # 5. Advance both pointers.
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
    // 1. Initialize pointers at first and last elements.
    int left = 0, right = numbers.Length - 1;
    
    while (left < right)
    {
        // 2. Check the sum of the current pair.
        int sum = numbers[left] + numbers[right];
        
        // 3. If it's a match, return the 1-based indices (required by problem).
        if (sum == target) return new[] { left + 1, right + 1 };
        
        // 4. If sum is too low, move the left pointer forward (increases sum).
        else if (sum < target) left++;
        
        // 5. If sum is too high, move the right pointer backward (decreases sum).
        else right--;
    }
    return Array.Empty<int>();
}
```
```python
def two_sum_sorted(numbers, target):
    # 1. Pointers at the boundaries of the sorted list.
    left, right = 0, len(numbers) - 1
    
    while left < right:
        # 2. Check the current sum.
        s = numbers[left] + numbers[right]
        
        if s == target: 
            # 3. Return 1-indexed positions.
            return [left + 1, right + 1]
            
        elif s < target: 
            # 4. Target is higher, move left pointer to increase sum.
            left += 1
        else: 
            # 5. Target is lower, move right pointer to decrease sum.
            right -= 1
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
    // 1. Pointers at the start (potentially most negative) and end (most positive).
    int left = 0, right = nums.Length - 1;
    
    // 2. Create a result array and a 'pos' tracker to fill it from largest to smallest.
    int[] result = new int[nums.Length];
    int pos = nums.Length - 1;   

    // 3. We use <= because we need to process the very last element when pointers meet.
    while (left <= right)
    {
        // 4. Calculate squares of the values at current pointers.
        int leftSq  = nums[left]  * nums[left];
        int rightSq = nums[right] * nums[right];
        
        // 5. Compare squares and put the larger one at the current 'pos'.
        if (leftSq > rightSq)
        {
            result[pos--] = leftSq;
            left++; // Move left forward as we've processed that value.
        }
        else
        {
            result[pos--] = rightSq;
            right--; // Move right backward.
        }
    }
    return result;
}
```
```python
def sorted_squares(nums):
    # 1. Pointers at both ends of the input list.
    left, right = 0, len(nums) - 1
    
    # 2. Result array of the same size, initialized to 0.
    result = [0] * len(nums)
    
    # 3. Pointer to track where to insert the next largest square.
    pos = len(nums) - 1
    
    while left <= right:
        # 4. Use absolute values to determine which end has the larger square.
        if abs(nums[left]) > abs(nums[right]):
            result[pos] = nums[left] ** 2
            left += 1
        else:
            result[pos] = nums[right] ** 2
            right -= 1
            
        # 5. Move the result insertion pointer backward.
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
    // 1. 'slow' tracks the position where the next non-zero number should go.
    int slow = 0;  
    
    // 2. 'fast' scans the entire array.
    for (int fast = 0; fast < nums.Length; fast++)
    {
        // 3. When we find a non-zero element...
        if (nums[fast] != 0)
        {
            // 4. ...place it at the 'slow' index.
            nums[slow] = nums[fast];
            
            // 5. If fast is ahead of slow, it means we moved a non-zero element.
            //    We should clear the old 'fast' position with a zero.
            if (slow != fast) nums[fast] = 0;  
            
            // 6. Move the 'slow' pointer to the next available position.
            slow++;
        }
    }
}
```
```python
def move_zeroes(nums):
    # 1. 'slow' pointer tracks where the next non-zero element should be swapped.
    slow = 0
    
    for fast in range(len(nums)):
        # 2. When a non-zero number is found by 'fast'...
        if nums[fast] != 0:
            # 3. Swap it with the element at the 'slow' pointer.
            #    This brings the non-zero forward and pushes the zero backward.
            nums[slow], nums[fast] = nums[fast], nums[slow]
            
            # 4. Advance the 'slow' pointer.
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
