# 10 — Advanced Two Pointers

The Two-Pointer technique is often the "missing link" between a brute-force $O(n^2)$ solution and an optimal $O(n)$ implementation. While the basic concept—tracking two indices—is simple, its advanced applications involve managing complex state, coordinating three or more pointers, and handling non-linear data traversal.

This guide focuses on the "Senior" applications of the technique: partitioning unsorted data, expanding from centers, and maintaining running maximums to solve multi-faceted problems like water trapping and triplet sum optimization.

---

## Core Concepts

### When to use it
- The simple "left/right" or "fast/slow" isn't enough to capture the state.
- You need to track multiple boundaries (e.g., 3Sum, Trapping Water).
- The array is unsorted but can be partitioned (e.g., Dutch National Flag).

### The Flavors

**1. The "Middle-Out" approach** — starting at a pivot and expanding (common in substring problems).
**2. Three-Pointer partitioning** — used to sort or group elements into three categories.
**3. The "Stateful" pointer** — one pointer moves normally while the other only moves when a complex condition is met.

---

## Patterns with Code

### Pattern 1: Three-way partitioning (Dutch National Flag)
```csharp
// Using a while loop for manual control over pointer increments
void ThreeWayPartition(int[] nums, int midVal)
{
    int low = 0, mid = 0, high = nums.Length - 1;
    while (mid <= high)
    {
        if (nums[mid] < midVal)
            (nums[low++], nums[mid++]) = (nums[mid], nums[low]);
        else if (nums[mid] == midVal)
            mid++;
        else
            (nums[mid], nums[high--]) = (nums[high], nums[mid]);
    }
}
```
**Explanation:** This uses three pointers to divide an array into three sections: elements less than, equal to, and greater than a pivot (`midVal`).
- `low`: Boundary for the "less than" section.
- `mid`: The current element being scanned.
- `high`: Boundary for the "greater than" section.

**Reasoning:** Standard two-pointer logic only handles two states (e.g., "yes" or "no"). Adding a third pointer allows you to sort or group elements with three distinct states in a single pass ($O(n)$ time) without using extra space ($O(1)$ space).

### Pattern 2: Fixed-Ahead Pointer (Fast & Slow)
```csharp
// Using a for loop when the 'fast' pointer moves predictably
int RemoveElement(int[] nums, int val) {
    int slow = 0;
    for (int fast = 0; fast < nums.Length; fast++) {
        if (nums[fast] != val) {
            nums[slow++] = nums[fast];
        }
    }
    return slow;
}
```
**Explanation:** The `fast` pointer (controlled by the for loop) scans every element, while the `slow` pointer only moves when a condition is met (in this case, when the element isn't the one we want to remove).

**Reasoning:** For loops are cleaner when one pointer moves linearly through the entire collection. It reduces the risk of infinite loops and clearly separates the "scanner" (fast) from the "builder" (slow).

### Pattern 3: The "Expand from Center" (Palindrome Substrings)
```csharp
int ExpandAroundCenter(string s, int left, int right)
{
    while (left >= 0 && right < s.Length && s[left] == s[right])
    {
        left--;
        right++;
    }
    return right - left - 1; // Returns length of the palindrome
}
```
**Explanation:** Instead of moving inward from the ends, you start at a potential center (a single character or the gap between two) and push the pointers outward as long as the characters match.

**Reasoning:** This is the most efficient way to find palindromic substrings. By treating every index as a potential "center," you avoid the redundant checks of a sliding window and handle both odd-length (center is one char) and even-length (center is between two chars) palindromes elegantly.

---

## Building Blocks: Warm-up Exercises

These exercises bridge the gap between simple concepts and LeetCode-level challenges. Complete the code skeletons provided to master pointer coordination.

### Exercise 1 — The Intersection of Two Sorted Arrays
**Task:** Given two sorted arrays, find the elements that appear in both.
**Goal:** Learn how to move pointers independently based on a comparison.

**The "Half-Way" Guide:**
```csharp
public List<int> FindIntersection(int[] arr1, int[] arr2) {
    int i = 0, j = 0;
    var result = new List<int>();

    while (i < arr1.Length && j < arr2.Length) {
        if (arr1[i] == arr2[j]) {
            result.Add(arr1[i]);
            i++; j++;
        }
        else if (arr1[i] < arr2[j]) {
            // Your Mission: One array's value is too small to ever match the other. 
            // Which pointer should move forward?
        }
        else {
            // Your Mission: The other array's value is too small. Move it!
        }
    }
    return result;
}
```

### Exercise 2 — Targeted Partitioning (The "Gatekeeper")
**Task:** Given an array, move all occurrences of a specific `target` to the front without using extra space.
**Goal:** Master the "Write" vs "Read" pointer dynamic.

**The "Half-Way" Guide:**
```csharp
void MoveTargetToFront(int[] nums, int target) {
    int write = 0;
    // We use a for loop as a 'scanner' (read pointer)
    for (int read = 0; read < nums.Length; read++) {
        if (nums[read] == target) {
            // Your Mission: 
            // 1. Swap nums[read] with the element at the 'write' position
            // 2. Increment 'write' to protect the target you just moved
            
            (nums[write], nums[read]) = (nums[read], nums[write]);
            // ... what next?
        }
    }
}
```

---

## Practice Problems

---

### Problem 1 — Container With Most Water (LeetCode #11)
**Task:** Find two lines that together with the x-axis forms a container that holds the most water.

**Example:** `[1, 8, 6, 2, 5, 4, 8, 3, 7]` → `49`

**Hints & Tips:**
- **The Constraint:** The area is always limited by the **shorter** of the two lines.
- **Pointer Movement:** To find a potentially larger area, you must move the pointer at the shorter line. Moving the taller line inward can only decrease the width without ever increasing the height.
- **Formula:** `Area = min(height[left], height[right]) * (right - left)`.

---

### Problem 2 — 3Sum (LeetCode #15)
**Task:** Find all unique triplets that sum to zero.

**Example:** `[-1, 0, 1, 2, -1, -4]` → `[[-1, -1, 2], [-1, 0, 1]]`

**Hints & Tips:**
- **Pre-requisite:** Sorting is mandatory here to handle duplicates efficiently and use the two-pointer logic.
- **Reduction:** Fix one number `i` with a loop, then treat the rest of the array as a "Two Sum II" problem (finding two numbers that sum to `-nums[i]`).
- **Duplicate Handling:** After finding a valid triplet, move both pointers past any identical values to avoid adding the same triplet twice.

---

### Problem 3 — Trapping Rain Water (LeetCode #42)
**Task:** Compute how much water can be trapped after raining.

**Example:** `[0,1,0,2,1,0,1,3,2,1,2,1]` → `6`

**Hints & Tips:**
- **The Logic:** At any index `i`, the water trapped is determined by the `min(tallest_bar_to_left, tallest_bar_to_right) - height[i]`.
- **Efficiency:** Instead of pre-calculating arrays for left/right maxes, use two pointers from the ends. Keep track of `leftMax` and `rightMax` as you move.
- **Decision:** If `height[left] < height[right]`, the water level at `left` is bottled by `leftMax`. Process the left side and move inward.

---

## Common Mistakes

- **Not skipping duplicates** in problems like 3Sum — leads to duplicate results and extra work.
- **Forgetting to sort** — advanced two-pointer patterns almost always require a pre-sorted array.
- **Incorrect pointer updates** — especially in problems like Trapping Rain Water, ensure you update the `max` before calculating volume.

---

## LeetCode Problems to Try Now

- #11 — Container With Most Water ⭐
- #15 — 3Sum ⭐⭐
- #42 — Trapping Rain Water ⭐⭐⭐
- #75 — Sort Colors (Dutch National Flag)
- #18 — 4Sum
