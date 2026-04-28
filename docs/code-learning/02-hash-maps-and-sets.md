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
var freq = new Dictionary<int, int>();
foreach (int n in nums)
{
    if (!freq.ContainsKey(n)) freq[n] = 0;
    freq[n]++;
    // Shorthand: freq[n] = freq.GetValueOrDefault(n, 0) + 1;
}
// freq = { 1:1, 2:2, 3:3 }
```
```python
from collections import Counter
nums = [1, 2, 2, 3, 3, 3]
freq = Counter(nums)   # {3:3, 2:2, 1:1}
# Or manually:
freq = {}
for n in nums:
    freq[n] = freq.get(n, 0) + 1
```

### 2. "Have I seen this before?" — HashSet membership
```csharp
var seen = new HashSet<int>();
int[] nums = { 1, 5, 3, 5, 2 };
foreach (int n in nums)
{
    if (seen.Contains(n))
        Console.WriteLine($"Duplicate: {n}");
    seen.Add(n);
}
```
```python
seen = set()
for n in [1, 5, 3, 5, 2]:
    if n in seen:
        print(f"Duplicate: {n}")
    seen.add(n)
```

### 3. Complement / Pair Lookup
Store what you *need* so far, check if the current element satisfies it.
```csharp
// Classic Two Sum pattern
var map = new Dictionary<int, int>();  // value → index
for (int i = 0; i < nums.Length; i++)
{
    int complement = target - nums[i];
    if (map.ContainsKey(complement))
        return new[] { map[complement], i };
    map[nums[i]] = i;
}
```

### 4. Grouping with a Dictionary
```csharp
// Group strings by their sorted form (anagram grouping)
var groups = new Dictionary<string, List<string>>();
foreach (string word in words)
{
    string key = new string(word.OrderBy(c => c).ToArray());
    if (!groups.ContainsKey(key)) groups[key] = new List<string>();
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
// Try every pair — works but slow
for (int i = 0; i < nums.Length; i++)
    for (int j = i + 1; j < nums.Length; j++)
        if (nums[i] + nums[j] == target)
            return new[] { i, j };
```

**Optimised with HashMap (O(n)):**
```csharp
int[] TwoSum(int[] nums, int target)
{
    var seen = new Dictionary<int, int>(); // number → index
    for (int i = 0; i < nums.Length; i++)
    {
        int complement = target - nums[i];
        if (seen.ContainsKey(complement))
            return new[] { seen[complement], i };
        seen[nums[i]] = i;
    }
    return Array.Empty<int>(); // guaranteed to find answer per problem
}
```
```python
def two_sum(nums, target):
    seen = {}  # number → index
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
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
    var seen = new HashSet<int>();
    foreach (int n in nums)
    {
        if (!seen.Add(n)) return true;  // Add() returns false if already present
    }
    return false;
}
```
```python
def contains_duplicate(nums):
    return len(nums) != len(set(nums))  # concise one-liner
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
    if (s.Length != t.Length) return false;

    var count = new Dictionary<char, int>();
    foreach (char c in s)
        count[c] = count.GetValueOrDefault(c, 0) + 1;

    foreach (char c in t)
    {
        if (!count.ContainsKey(c) || count[c] == 0) return false;
        count[c]--;
    }
    return true;
}
```
```python
from collections import Counter
def is_anagram(s, t):
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
    var freq = new Dictionary<char, int>();
    foreach (char c in s)
        freq[c] = freq.GetValueOrDefault(c, 0) + 1;

    for (int i = 0; i < s.Length; i++)
        if (freq[s[i]] == 1) return i;

    return -1;
}
```
```python
from collections import Counter
def first_uniq_char(s):
    freq = Counter(s)
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
