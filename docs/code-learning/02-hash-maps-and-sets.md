# 02 — Hash Maps & Sets

The single most useful data structure for optimising brute-force solutions. If you find yourself writing a nested loop, ask: *"Can I use a dictionary instead?"*

---

## Core Concepts

| Structure | C# Type | Python Type | Use Case |
|-----------|---------|-------------|----------|
| Hash Map | `Dictionary<K,V>` | `dict` | Key → value lookup in O(1) |
| Hash Set | `HashSet<T>` | `set` | Fast membership check, deduplication |

### Why O(1)?
A hash function converts a key (e.g. `"apple"`) into an integer index, pointing directly to the stored value — no searching required.

### Trade-offs
- ✅ Super fast lookup, insert, delete (O(1) average)
- ❌ No ordering (use `SortedDictionary` if you need sorted keys)
- ❌ Extra memory — you're trading space for speed

---

## Essential Patterns

### 1. Frequency Count
Count how many times each element appears.
```csharp
int[] nums = { 1, 2, 2, 3, 3, 3 };

// 1. Create a dictionary to store values as keys and their counts as values.
var freq = new Dictionary<int, int>();

foreach (int n in nums)
{
    // 2. If the number isn't in the dictionary yet, initialize its count to 0.
    //    This prevents a KeyNotFoundException.
    if (!freq.ContainsKey(n)) freq[n] = 0;
    
    // 3. Increment the count for the current number.
    freq[n]++;
    
    // Shorthand: freq[n] = freq.GetValueOrDefault(n, 0) + 1;
}
// Final state: freq = { 1:1, 2:2, 3:3 }
```
```python
from collections import Counter
nums = [1, 2, 2, 3, 3, 3]

# 1. Counter is a specialized dictionary subclass for counting hashable objects.
#    It does the 'if key not in dict' logic automatically.
freq = Counter(nums)   # Result: {3:3, 2:2, 1:1}

# Or manually:
freq = {}
for n in nums:
    # 2. .get(n, 0) returns 0 if 'n' is not in the dictionary.
    #    We then add 1 to whatever value was there (or to 0).
    freq[n] = freq.get(n, 0) + 1
```

### 2. "Have I seen this before?" — HashSet membership
```csharp
// 1. Use a HashSet for O(1) membership checks.
var seen = new HashSet<int>();
int[] nums = { 1, 5, 3, 5, 2 };

foreach (int n in nums)
{
    // 2. Check if the current number has already been added to the set.
    if (seen.Contains(n))
        Console.WriteLine($"Duplicate: {n}");
    
    // 3. Add the number to the set so we can detect it if it appears again.
    seen.Add(n);
}
```
```python
# 1. Initialize an empty set for tracking unique elements.
seen = set()

for n in [1, 5, 3, 5, 2]:
    # 2. Membership check in a set is O(1) average.
    if n in seen:
        print(f"Duplicate: {n}")
    
    # 3. Store the element in the set for future reference.
    seen.add(n)
```

### 3. Complement / Pair Lookup
Store what you *need* so far, check if the current element satisfies it.
```csharp
// Classic Two Sum pattern: 1-pass approach
var map = new Dictionary<int, int>();  // Stores: value → index

for (int i = 0; i < nums.Length; i++)
{
    // 1. Calculate the 'complement' — what number would we need to reach the target?
    int complement = target - nums[i];
    
    // 2. If the complement is already in our map, we've found our pair!
    if (map.ContainsKey(complement))
        // Return the index of the complement and the current index.
        return new[] { map[complement], i };
        
    // 3. Otherwise, store the current number and its index for future checks.
    map[nums[i]] = i;
}
```

### 4. Grouping with a Dictionary
```csharp
// Group strings by their sorted form (anagram grouping)
var groups = new Dictionary<string, List<string>>();

foreach (string word in words)
{
    // 1. Sort the characters of the word to create a 'canonical' key.
    //    All anagrams (e.g., "eat", "tea") will result in the same sorted key ("aet").
    string key = new string(word.OrderBy(c => c).ToArray());
    
    // 2. If this key hasn't been seen, initialize a new list for this group.
    if (!groups.ContainsKey(key)) groups[key] = new List<string>();
    
    // 3. Add the original word to the list corresponding to its sorted key.
    groups[key].Add(word);
}
```

---

## Practice Problems

---

### Problem 1 — Two Sum (LeetCode #1)
**Task:** Given an array of integers and a target, return indices of the two numbers that add up to the target.

**Example:** `nums = [2, 7, 11, 15]`, `target = 9` → `[0, 1]`

**Brute force (O(n²)):**
```csharp
// Try every possible pair of numbers.
for (int i = 0; i < nums.Length; i++)
    for (int j = i + 1; j < nums.Length; j++)
        // Check if current pair matches target.
        if (nums[i] + nums[j] == target)
            return new[] { i, j };
```

**Optimised with HashMap (O(n)):**
```csharp
int[] TwoSum(int[] nums, int target)
{
    // 1. Map to store the numbers we have seen so far: [value] -> [index]
    var seen = new Dictionary<int, int>(); 
    
    for (int i = 0; i < nums.Length; i++)
    {
        // 2. Determine what value we need to find to complete the sum.
        int complement = target - nums[i];
        
        // 3. Check if we've already encountered this complement.
        if (seen.ContainsKey(complement))
            // Success! Return indices of both numbers.
            return new[] { seen[complement], i };
            
        // 4. If not found, add current number and its index to the map.
        seen[nums[i]] = i;
    }
    return Array.Empty<int>(); 
}
```
```python
def two_sum(nums, target):
    seen = {}  # number → index mapping
    
    # 1. Iterate using enumerate to get both the index and the value.
    for i, n in enumerate(nums):
        # 2. The complement is the 'missing piece' for the target sum.
        complement = target - n
        
        # 3. Check the dictionary for the complement (O(1) lookup).
        if complement in seen:
            return [seen[complement], i]
            
        # 4. Save the current number and its index to check against future values.
        seen[n] = i
```
⏱ Time: O(n) | Space: O(n)

**Key insight:** Instead of searching for the second number (O(n)), store numbers as you go and check in O(1).

---

### Problem 2 — Contains Duplicate (LeetCode #217)
**Task:** Return true if any value appears at least twice.

**Example:** `[1, 2, 3, 1]` → `true`

**Solution:**
```csharp
bool ContainsDuplicate(int[] nums)
{
    // 1. Create a set to store unique elements.
    var seen = new HashSet<int>();
    
    foreach (int n in nums)
    {
        // 2. HashSet.Add() returns false if the element already exists in the set.
        //    This allows us to check and add in one atomic operation.
        if (!seen.Add(n)) return true;  
    }
    
    // 3. If the loop completes, no duplicates were found.
    return false;
}
```
```python
def contains_duplicate(nums):
    # 1. set(nums) creates a collection of unique elements from the list.
    # 2. If the lengths differ, it means the original list had duplicates.
    return len(nums) != len(set(nums))  
```
⏱ Time: O(n) | Space: O(n)

---

### Problem 3 — Valid Anagram (LeetCode #242)
**Task:** Return true if two strings are anagrams of each other.

**Example:** `"anagram"`, `"nagaram"` → `true`

**Solution:**
```csharp
bool IsAnagram(string s, string t)
{
    // 1. Basic check: anagrams must have the same length.
    if (s.Length != t.Length) return false;

    // 2. Count frequency of each character in the first string.
    var count = new Dictionary<char, int>();
    foreach (char c in s)
        count[c] = count.GetValueOrDefault(c, 0) + 1;

    // 3. Iterate through the second string and "subtract" character counts.
    foreach (char c in t)
    {
        // 4. If a character is missing or already at 0 count, it's not an anagram.
        if (!count.ContainsKey(c) || count[c] == 0) return false;
        count[c]--;
    }
    
    // 5. If all characters were matched exactly, it's an anagram.
    return true;
}
```
```python
from collections import Counter
def is_anagram(s, t):
    # 1. Counter counts the frequency of each character in O(n).
    # 2. Comparing two Counters checks if all character counts are identical.
    return Counter(s) == Counter(t)
```
⏱ Time: O(n) | Space: O(1) — at most 26 letters

---

### Problem 4 — First Unique Character (LeetCode #387)
**Task:** Return the index of the first non-repeating character in a string. Return -1 if none.

**Example:** `"leetcode"` → `0` (l appears once)

**Solution:**
```csharp
int FirstUniqChar(string s)
{
    // 1. First pass: Count how many times each character appears.
    var freq = new Dictionary<char, int>();
    foreach (char c in s)
        freq[c] = freq.GetValueOrDefault(c, 0) + 1;

    // 2. Second pass: Find the first character whose frequency is exactly 1.
    for (int i = 0; i < s.Length; i++)
        if (freq[s[i]] == 1) return i;

    // 3. No unique character found.
    return -1;
}
```
```python
from collections import Counter
def first_uniq_char(s):
    # 1. Build a frequency map of characters.
    freq = Counter(s)
    
    # 2. Iterate through the string in order to find the first character with count 1.
    for i, c in enumerate(s):
        if freq[c] == 1:
            return i
            
    return -1
```
⏱ Time: O(n) | Space: O(1)

---

## Common Mistakes

- **Forgetting to initialise the count** — use `GetValueOrDefault(key, 0)` or `TryGetValue`.
- **Using a list for membership checks** — `list.Contains()` is O(n); `HashSet.Contains()` is O(1).
- **Assuming order is preserved** — standard `Dictionary` in C# does NOT guarantee insertion order (though in practice it often is in modern .NET). Use `SortedDictionary` or a list of keys if order matters.

---

## LeetCode Problems to Try Now

- #1 — Two Sum ⭐
- #217 — Contains Duplicate ⭐
- #242 — Valid Anagram ⭐
- #387 — First Unique Character in a String
- #49 — Group Anagrams (good challenge)
