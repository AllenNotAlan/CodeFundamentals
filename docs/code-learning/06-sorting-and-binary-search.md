# 06 — Sorting & Binary Search

Sorting and binary search are two foundational tools. Sorting reorganises data to make it easier to work with; binary search lets you find things in O(log n) instead of O(n).

---

## Sorting

### Built-in sorting in C# and Python
```csharp
int[] nums = { 5, 2, 8, 1, 9 };

// 1. Sort the array in-place in ascending order (O(n log n))
Array.Sort(nums);                     

// 2. Sort with a custom comparer for descending order
Array.Sort(nums, (a, b) => b - a);    

string[] words = { "banana", "apple", "cherry" };

// 3. Default alphabetical sort
Array.Sort(words);                    

// 4. Sort by a property (length) using a lambda expression
Array.Sort(words, (a, b) => a.Length.CompareTo(b.Length)); 

// 5. LINQ provides a non-destructive way to get a sorted collection
var sorted = nums.OrderBy(x => x).ToArray();
var sortedDesc = nums.OrderByDescending(x => x).ToArray();
```
```python
nums = [5, 2, 8, 1, 9]

# 1. In-place ascending sort
nums.sort()                          

# 2. In-place descending sort
nums.sort(reverse=True)              

# 3. Create a new sorted list (original remains unchanged)
sorted_copy = sorted(nums)           

words = ["banana", "apple", "cherry"]

# 4. Use 'key' to sort by a specific criteria (e.g., word length)
words.sort(key=lambda w: len(w))     
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
    // 1. Define the search boundaries
    int low = 0, high = nums.Length - 1;

    // 2. Loop until the boundaries cross
    while (low <= high)
    {
        // 3. Find the middle index. 
        //    (high-low)/2 avoids potential overflow of (low+high)/2
        int mid = low + (high - low) / 2;  
        
        // 4. Check if we found the target
        if (nums[mid] == target) 
        {
            return mid;
        }
        // 5. If target is larger, ignore the left half
        else if (nums[mid] < target) 
        {
            low  = mid + 1;
        }
        // 6. If target is smaller, ignore the right half
        else 
        {
            high = mid - 1;
        }
    }

    // 7. Loop ended without finding the target
    return -1;  
}
```
```python
def binary_search(nums, target):
    # 1. Initialize pointers to the start and end of the list
    low, high = 0, len(nums) - 1
    
    while low <= high:
        # 2. Calculate the middle index (using floor division)
        mid = (low + high) // 2
        
        # 3. Found the target!
        if nums[mid] == target:   
            return mid
        # 4. Target is in the right half
        elif nums[mid] < target:  
            low  = mid + 1
        # 5. Target is in the left half
        else:                     
            high = mid - 1
            
    # 6. Target not found
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
            // 1. We found a match, but there might be an earlier one to the left
            result = mid;   
            high = mid - 1; // 2. Shrink the search space to the left side
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
        // 1. Calculate the mid-point
        int mid = low + (high - low) / 2;
        
        // 2. Exact match found
        if (nums[mid] == target) return mid;
        
        // 3. Adjust boundaries based on comparison
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
        
        // 1. If found, return the index immediately
        if (nums[mid] == target) return mid;
        
        // 2. Standard binary search logic to narrow the range
        else if (nums[mid] <  target) low  = mid + 1;
        else                          high = mid - 1;
    }
    
    // 3. Crucial Insight: If the loop finishes without a match,
    //    'low' will point to the index where the target should be inserted.
    return low;  
}
```
```python
def search_insert(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        
        # 1. Match found
        if nums[mid] == target: 
            return mid
        # 2. Narrow search space
        elif nums[mid] <  target: 
            low  = mid + 1
        else:                     
            high = mid - 1
            
    # 3. After the loop, low is the correct insertion point
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
    
    // 1. Use 'low < high' because we are converging on a single element
    while (low < high)
    {
        int mid = low + (high - low) / 2;
        
        // 2. If mid is greater than high, the pivot (and min) must be to the right
        if (nums[mid] > nums[high])
        {
            low = mid + 1;
        }
        // 3. Otherwise, the minimum is either at mid or to the left
        else
        {
            high = mid;
        }
    }
    
    // 4. When low == high, we've found the minimum element
    return nums[low];
}
```
```python
def find_min(nums):
    low, high = 0, len(nums) - 1
    
    # 1. Converge towards the minimum element
    while low < high:
        mid = (low + high) // 2
        
        # 2. If middle value is > rightmost value, right side is unsorted/rotated
        if nums[mid] > nums[high]:
            low = mid + 1
        # 3. Otherwise, minimum is in the left side (including mid)
        else:
            high = mid
            
    # 4. 'low' will point to the smallest value
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
    // 1. Sort intervals by their start time (crucial for greedy merging)
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    
    var merged = new List<int[]>();

    foreach (var interval in intervals)
    {
        // 2. If 'merged' is empty OR current interval doesn't overlap with the last one added
        if (merged.Count == 0 || merged[^1][1] < interval[0])
        {
            merged.Add(interval);
        }
        else
        {
            // 3. Overlap found! Update the end time of the last interval to cover both
            merged[^1][1] = Math.Max(merged[^1][1], interval[1]);
        }
    }
    return merged.ToArray();
}
```
```python
def merge(intervals):
    # 1. Sort intervals based on the start value
    intervals.sort(key=lambda x: x[0])
    
    merged = []
    for start, end in intervals:
        # 2. If merged list is empty or current interval doesn't overlap
        if not merged or merged[-1][1] < start:
            merged.append([start, end])
        else:
            # 3. Overlap detected: extend the end of the previous interval
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
