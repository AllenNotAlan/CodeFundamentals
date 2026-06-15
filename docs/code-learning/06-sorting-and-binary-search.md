# 06 — Sorting & Binary Search

Sorting and binary search are two foundational tools. Sorting reorganises data to make it easier to work with; binary search lets you find things in O(log n) instead of O(n).

---

## Sorting

### Built-in sorting in C# and Python
```csharp
int[] nums = { 5, 2, 8, 1, 9 };
Array.Sort(nums);                     // [1, 2, 5, 8, 9] ascending
Array.Sort(nums, (a, b) => b - a);    // descending (custom comparer)

string[] words = { "banana", "apple", "cherry" };
Array.Sort(words);                    // alphabetical
Array.Sort(words, (a, b) => a.Length.CompareTo(b.Length)); // by length

// LINQ alternatives
var sorted = nums.OrderBy(x => x).ToArray();
var sortedDesc = nums.OrderByDescending(x => x).ToArray();
```
```python
nums = [5, 2, 8, 1, 9]
nums.sort()                          # in-place ascending
nums.sort(reverse=True)              # descending
sorted_copy = sorted(nums)           # returns new list
words = ["banana", "apple", "cherry"]
words.sort(key=lambda w: len(w))     # sort by length
```

**Complexity:** Built-in sorts are O(n log n) — Tim sort in Python, intro sort in .NET.

### When to sort first
Many problems become easy once the data is sorted:
- Two-pointer pair-sum problems need a sorted array
- "Find K closest elements" → sort by distance
- Merge intervals → sort by start time

---

## Binary Search

Binary search finds a target in a **sorted** array in O(log n) by halving the search space each step.

```
Array: [1, 3, 5, 7, 9, 11, 13]
Find:  7

mid = index 3 → value 7 → found!

Find: 6
low=0 high=6  mid=3 → nums[3]=7 > 6 → high=2
low=0 high=2  mid=1 → nums[1]=3 < 6 → low=2
low=2 high=2  mid=2 → nums[2]=5 < 6 → low=3
low=3 > high=2 → not found
```

### Standard template
```csharp
int BinarySearch(int[] nums, int target)
{
    int low = 0, high = nums.Length - 1;
    while (low <= high)
    {
        int mid = low + (high - low) / 2;  // avoids integer overflow vs (low+high)/2
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) low  = mid + 1;
        else                         high = mid - 1;
    }
    return -1;  // not found
}
```
```python
def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:   return mid
        elif nums[mid] < target:  low  = mid + 1
        else:                     high = mid - 1
    return -1
```

### "Find leftmost / find rightmost" variant
When there are duplicates and you want the first or last occurrence:
```csharp
int FindFirst(int[] nums, int target)
{
    int low = 0, high = nums.Length - 1, result = -1;
    while (low <= high)
    {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target)
        {
            result = mid;   // found one, but keep searching left
            high = mid - 1;
        }
        else if (nums[mid] < target) low  = mid + 1;
        else                         high = mid - 1;
    }
    return result;
}
```

---

## Practice Problems

---

### Problem 1 — Binary Search (LeetCode #704)
**Task:** Given a sorted array and a target, return the index of the target or -1 if not found.

**Example:** `[-1, 0, 3, 5, 9, 12]`, `target = 9` → `4`

**Solution:** *(see standard template above)*
```csharp
int Search(int[] nums, int target)
{
    int low = 0, high = nums.Length - 1;
    while (low <= high)
    {
        int mid = low + (high - low) / 2;
        if      (nums[mid] == target) return mid;
        else if (nums[mid] <  target) low  = mid + 1;
        else                          high = mid - 1;
    }
    return -1;
}
```
⏱ Time: O(log n) | Space: O(1)

---

### Problem 2 — Search Insert Position (LeetCode #35)
**Task:** Given a sorted array and a target, return the index where it is found, or where it *would be* inserted.

**Example:** `[1, 3, 5, 6]`, `target = 5` → `2`; `target = 2` → `1`

**Solution:**
```csharp
int SearchInsert(int[] nums, int target)
{
    int low = 0, high = nums.Length - 1;
    while (low <= high)
    {
        int mid = low + (high - low) / 2;
        if      (nums[mid] == target) return mid;
        else if (nums[mid] <  target) low  = mid + 1;
        else                          high = mid - 1;
    }
    return low;  // when loop ends, low is the insertion point
}
```
```python
def search_insert(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if   nums[mid] == target: return mid
        elif nums[mid] <  target: low  = mid + 1
        else:                     high = mid - 1
    return low
```
⏱ Time: O(log n) | Space: O(1)

---

### Problem 3 — Find Minimum in Rotated Sorted Array (LeetCode #153)
**Task:** A sorted array was rotated at some unknown pivot. Find the minimum in O(log n).

**Example:** `[3, 4, 5, 1, 2]` → `1`

**Key insight:** The minimum is in the "unsorted half". Compare `nums[mid]` with `nums[high]` to decide which side to search.

**Solution:**
```csharp
int FindMin(int[] nums)
{
    int low = 0, high = nums.Length - 1;
    while (low < high)
    {
        int mid = low + (high - low) / 2;
        if (nums[mid] > nums[high])
            low = mid + 1;    // minimum is in the right half
        else
            high = mid;       // minimum is in the left half (could be mid itself)
    }
    return nums[low];
}
```
```python
def find_min(nums):
    low, high = 0, len(nums) - 1
    while low < high:
        mid = (low + high) // 2
        if nums[mid] > nums[high]:
            low = mid + 1
        else:
            high = mid
    return nums[low]
```
⏱ Time: O(log n) | Space: O(1)

---

### Problem 4 — Merge Intervals (LeetCode #56)
**Task:** Given a list of intervals, merge all overlapping ones.

**Example:** `[[1,3],[2,6],[8,10],[15,18]]` → `[[1,6],[8,10],[15,18]]`

**Key insight:** Sort by start time, then greedily merge.

**Solution:**
```csharp
int[][] Merge(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    var merged = new List<int[]>();

    foreach (var interval in intervals)
    {
        // If merged is empty OR current doesn't overlap with last merged interval
        if (merged.Count == 0 || merged[^1][1] < interval[0])
            merged.Add(interval);
        else
            merged[^1][1] = Math.Max(merged[^1][1], interval[1]); // extend last
    }
    return merged.ToArray();
}
```
```python
def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = []
    for start, end in intervals:
        if not merged or merged[-1][1] < start:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)
    return merged
```
⏱ Time: O(n log n) | Space: O(n)

---

## Common Mistakes

- **Integer overflow:** use `mid = low + (high - low) / 2`, not `(low + high) / 2`.
- **`low <= high` vs `low < high`:** use `<=` for standard search, `<` when converging to a boundary.
- **Not sorting before binary search** — binary search requires sorted data.
- **Off by one on insert position** — after the loop, `low` is always the correct insertion point.

---

## LeetCode Problems to Try Now

- #704 — Binary Search ⭐
- #35 — Search Insert Position ⭐
- #153 — Find Minimum in Rotated Sorted Array
- #56 — Merge Intervals
- #34 — Find First and Last Position of Element in Sorted Array
