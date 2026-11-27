# 📋 Cheat Sheet — Coding Patterns

> One page to skim before an interview or a timed session. It's organised by **the problem in front of you**, not by chapter. Each card links back to its chapter for the full explanation. Templates are C# and deliberately minimal — adapt names and types to the problem.

**Contents:** [Spot the pattern](#1-spot-the-pattern) · [Constraints → target complexity](#2-constraints-to-target-complexity) · [Pattern cards](#3-pattern-cards) · [C# toolbox](#4-c-toolbox) · [Complexity reference](#5-complexity-reference) · [Interview routine](#6-interview-routine) · [Top mistakes](#7-top-mistakes)

---

## 1. Spot the pattern

### Signal words → pattern

| If the problem says / looks like… | Reach for | Card |
|---|---|---|
| "running sum", "sum of range", "product except self" | **Prefix / suffix arrays** | [Arrays](#arrays-and-strings-prefix-and-suffix) |
| "count", "seen before?", "pair that sums to", "group by" | **Hash map / set** | [Hash map](#hash-map-and-set) |
| "subarray sum **equals** k", "count subarrays with sum…" (negatives allowed) | **Prefix sum + hash map** | [Prefix sum + map](#prefix-sum-with-hash-map-not-yet-in-a-chapter) |
| **Sorted** array + pair/triplet, palindrome, remove/move in place | **Two pointers** | [Two pointers](#two-pointers) |
| **Contiguous** subarray/substring + longest/shortest/at most | **Sliding window** | [Sliding window](#sliding-window) |
| "maximum subarray sum", "best contiguous run" | **Kadane** | [Kadane](#kadane-maximum-subarray-not-yet-in-a-chapter) |
| Brackets/nesting, undo, "next greater/warmer", "most recent" | **Stack** (monotonic) | [Stack](#stacks-and-queues-monotonic-stack) |
| **Sorted** + "find", O(log n), first/last position, rotated array | **Binary search** | [Binary search](#binary-search) |
| "minimise the maximum", "smallest capacity/speed that works" | **Binary search on the answer** | [Binary search](#binary-search) |
| Intervals: merge, insert, overlap, "meeting rooms" | **Sort by start + sweep** (heap for rooms) | [Intervals](#intervals-not-yet-in-a-chapter) |
| Reverse/merge/reorder a list, cycle, middle, nth from end | **Linked-list pointers** (dummy, fast/slow) | [Linked list](#linked-lists) |
| Tree depth/path/validate/mirror, level by level | **Tree DFS / BFS** | [Trees](#trees-and-recursion) |
| "number of ways", "min/max cost", "is it possible" | **Dynamic programming** | [DP](#dynamic-programming-intro-1d) · [DP shapes](#dp-shapes-knapsack-subsequence-grid-two-strings) |
| Nodes + edges, a **grid**, connected/reachable, islands | **Graph BFS/DFS** | [Graphs](#graphs) |
| Prerequisites, build order, "can all tasks finish?" | **Topological sort** | [Graphs](#graphs) |
| "how many groups?", "are these connected?" (incrementally) | **Union-Find** | [Graphs](#graphs) |
| Shortest path **unweighted** / **weighted** (no negatives) | **BFS** / **Dijkstra** | [Graphs](#graphs) |
| "top K", "K closest", "kth largest", "median", "merge K sorted" | **Heap** | [Heap](#heaps-and-priority-queues) |
| "all subsets/permutations/combinations", "generate every", puzzles | **Backtracking** | [Backtracking](#backtracking) |
| "max non-overlapping", "min to reach/cover", "sort then pick" | **Greedy** | [Greedy](#greedy) |
| "starts with", autocomplete, dictionary of words, word search | **Trie** | [Trie](#tries) |

### Words that change the pattern

- **"Contiguous"** → window / prefix sum / Kadane. **"Subsequence" / "any order"** → DP or backtracking.
- **"Sorted"** anywhere → two pointers or binary search. Not sorted but order doesn't matter? Sort it first (O(n log n)) or use a hash map (O(n)).
- **Negatives in the array** → a sum-based sliding window breaks (shrinking no longer lowers the sum). Use **prefix sum + hash map**.
- **"Shortest" + unweighted** → BFS, never DFS. **+ weights** → Dijkstra.
- **"Number of ways"** → DP (counting), never greedy. **"List all ways"** → backtracking.
- **"Top K" with k ≪ n** → size-K heap, O(n log k), not a full sort.
- **A grid** is a graph: cells are nodes, 4 neighbours are edges.
- **"In place" / O(1) space** → two pointers, or reuse the input array.
- **Greedy feels right** → can you give a one-line exchange argument? No → it's probably DP.

### When stuck, ask these in order

1. Can I brute-force it? Say it and its cost — that's your safety net.
2. Is there **repeated work** in the brute force? Cache it (hash map, prefix sums, DP memo).
3. Is the input **sorted**, or can I sort it? → two pointers, binary search, greedy sweep.
4. Is it about a **contiguous** range? → window, prefix sum, Kadane.
5. Do I need the **most recent** / **oldest** / **smallest** item repeatedly? → stack / queue / heap.
6. Are there **relationships** between items (depends on, connected to)? → graph.
7. Do I need **every** solution, or just the best/count? Every → backtracking. Best/count → DP or greedy.

---

## 2. Constraints to target complexity

Read the input size first; it tells you which complexity the interviewer expects (≈10⁸ simple operations per second).

| n up to… | Allowed time | Usually means |
|---|---|---|
| ~10 | O(n!) | Permutations, brute-force arrangements |
| ~20 | O(2ⁿ) | Subsets, backtracking, bitmask |
| ~500 | O(n³) | Triple loops, interval DP |
| ~5,000 | O(n²) | Nested loops, DP over pairs / two strings |
| ~10⁵ – 10⁶ | O(n log n) or O(n) | Sort, heap, hash map, two pointers, window |
| 10⁹ or more (values or n) | O(log n) or O(1) | Binary search (often on the answer), maths |

> If your approach is slower than the row for your n, you've missed the intended optimisation.

---

## 3. Pattern cards

Each card: **idea · spot it · template · cost · ⚠️ #1 mistake · classics**.

### Arrays and strings (prefix and suffix)
[Chapter 1](./01-arrays-and-strings.md)

- **Idea:** O(1) access by index. Precompute running totals once instead of recomputing ranges.
- **Spot it:** running sum, range sum, product except self, reverse in place, building strings.

```csharp
// prefix[i] = sum of nums[0..i-1]; sum(l..r) = prefix[r + 1] - prefix[l]
var prefix = new int[nums.Length + 1];
for (int i = 0; i < nums.Length; i++) prefix[i + 1] = prefix[i] + nums[i];

// Product except self: prefix pass left->right, suffix pass right->left
var result = new int[n];
result[0] = 1;
for (int i = 1; i < n; i++) result[i] = result[i - 1] * nums[i - 1];
int suffix = 1;
for (int i = n - 1; i >= 0; i--) { result[i] *= suffix; suffix *= nums[i]; }
```

- **Cost:** O(n) time; O(1) in place, O(n) with a prefix array.
- ⚠️ Off-by-one (`< Length` vs `<= Length - 1`); `+=` on strings in a loop (use `StringBuilder`).
- **Classics:** Running Sum #1480, Product Except Self #238, Reverse String #344.

### Hash map and set
[Chapter 2](./02-hash-maps-and-sets.md)

- **Idea:** Remember what you've seen for O(1) lookups. Trades O(n) memory for O(n²) → O(n).
- **Spot it:** count occurrences, duplicates, "two numbers that add to target", group items sharing a key.

```csharp
// Two Sum: look up the complement first, then record the current value
var seen = new Dictionary<int, int>();            // value -> index
for (int i = 0; i < nums.Length; i++) {
    if (seen.TryGetValue(target - nums[i], out int j)) return new[] { j, i };
    seen[nums[i]] = i;
}

// Frequency count
var freq = new Dictionary<char, int>();
foreach (char c in s) freq[c] = freq.GetValueOrDefault(c) + 1;

// Group anagrams: same sorted letters = same key
string key = new string(word.OrderBy(c => c).ToArray());
```

- **Cost:** O(n) time, O(n) space.
- ⚠️ Reading a missing key (`KeyNotFoundException`) — use `GetValueOrDefault` / `TryGetValue`. `List.Contains` is O(n); `HashSet.Contains` is O(1).
- **Classics:** Two Sum #1, Contains Duplicate #217, Valid Anagram #242, Group Anagrams #49.

### Prefix sum with hash map (not yet in a chapter)
Builds on [Chapter 1](./01-arrays-and-strings.md) and [Chapter 2](./02-hash-maps-and-sets.md)

- **Idea:** A subarray `(j..i]` sums to `k` exactly when `prefix[i] - prefix[j] = k`. So, while scanning, count how many earlier prefixes equal `prefix - k`.
- **Spot it:** "number of subarrays with sum = k", "subarray sum divisible by k", "longest subarray with equal 0s and 1s" — especially when **negatives** rule out a sliding window.

```csharp
int SubarraySum(int[] nums, int k) {
    var seen = new Dictionary<int, int> { [0] = 1 };   // the empty prefix
    int sum = 0, count = 0;
    foreach (int x in nums) {
        sum += x;
        count += seen.GetValueOrDefault(sum - k);      // earlier prefixes that complete a k-sum
        seen[sum] = seen.GetValueOrDefault(sum) + 1;
    }
    return count;
}
```

- **Cost:** O(n) time, O(n) space.
- ⚠️ Forgetting to seed `{0: 1}` — you miss subarrays starting at index 0. For "longest", store the **first** index of each prefix instead of a count.
- **Classics:** Subarray Sum Equals K #560, Contiguous Array #525, Subarray Sums Divisible by K #974.

### Two pointers
[Chapter 3](./03-two-pointers.md) · [Advanced](../extras/two-pointers-mastery.md)

- **Idea:** Two indices moved by a rule replace a nested loop.
- **Spot it:** sorted array + pair/triplet, palindrome, remove/move elements in place.

```csharp
// Opposite ends (sorted input)
int left = 0, right = nums.Length - 1;
while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) return new[] { left, right };
    if (sum < target) left++; else right--;
}

// Fast/slow (read/write) — compact in place
int slow = 0;
for (int fast = 0; fast < nums.Length; fast++)
    if (nums[fast] != val) nums[slow++] = nums[fast];
return slow;                                        // new length
```

- **Cost:** O(n) time, O(1) space (plus O(n log n) if you sort first).
- ⚠️ Opposite-end logic on **unsorted** input. Make sure at least one pointer moves every iteration.
- **Classics:** Two Sum II #167, Valid Palindrome #125, 3Sum #15, Container With Most Water #11, Move Zeroes #283.

### Sliding window
[Chapter 4](./04-sliding-window.md)

- **Idea:** Keep a contiguous window; add on the right, remove on the left, maintain its state.
- **Spot it:** contiguous subarray/substring + longest / shortest / max sum / at most K distinct.

```csharp
// Fixed size k
int sum = 0, best = int.MinValue;
for (int i = 0; i < nums.Length; i++) {
    sum += nums[i];
    if (i >= k) sum -= nums[i - k];                 // drop the element leaving
    if (i >= k - 1) best = Math.Max(best, sum);
}

// Variable size: longest substring without repeats
var count = new Dictionary<char, int>();
int left = 0, longest = 0;
for (int right = 0; right < s.Length; right++) {
    count[s[right]] = count.GetValueOrDefault(s[right]) + 1;
    while (count[s[right]] > 1) {                   // invalid -> shrink
        count[s[left]]--;
        left++;
    }
    longest = Math.Max(longest, right - left + 1);
}
```

- **Cost:** O(n) time; O(1) or O(alphabet) space.
- ⚠️ Forgetting to shrink. Window size is `right - left + 1`. For **longest**, record after shrinking; for **shortest**, record inside the shrink loop.
- **Classics:** Max Average Subarray #643, Longest Substring Without Repeating #3, Minimum Size Subarray Sum #209, Longest Repeating Character Replacement #424.

### Kadane (maximum subarray) (not yet in a chapter)
Builds on [Chapter 9](./09-dynamic-programming-intro.md) — it's 1D DP with O(1) space.

- **Idea:** At each index, the best subarray ending here either extends the previous one or starts fresh: `current = max(x, current + x)`.
- **Spot it:** "maximum sum contiguous subarray", "best time to buy and sell once" (max of running gains).

```csharp
int MaxSubArray(int[] nums) {
    int best = nums[0], current = nums[0];
    for (int i = 1; i < nums.Length; i++) {
        current = Math.Max(nums[i], current + nums[i]);   // extend or restart
        best = Math.Max(best, current);
    }
    return best;
}
```

- **Cost:** O(n) time, O(1) space.
- ⚠️ Starting `best` at `0` — wrong when every number is negative. Start from `nums[0]`. Max **product** needs both a running max and min (a negative flips them).
- **Classics:** Maximum Subarray #53, Best Time to Buy and Sell Stock #121, Maximum Product Subarray #152.

### Stacks and queues (monotonic stack)
[Chapter 5](./05-stacks-and-queues.md)

- **Idea:** Stack = most recent first (LIFO). Queue = oldest first (FIFO).
- **Spot it:** bracket matching, undo, "next greater/warmer", evaluate expressions (stack); BFS, process in order (queue).

```csharp
// Bracket matching
var stack = new Stack<char>();
var pairs = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
foreach (char c in s) {
    if (!pairs.ContainsKey(c)) stack.Push(c);
    else if (stack.Count == 0 || stack.Pop() != pairs[c]) return false;
}
return stack.Count == 0;

// Monotonic stack: next greater element (stack holds indices, values decreasing)
var result = new int[nums.Length];
Array.Fill(result, -1);
var idx = new Stack<int>();
for (int i = 0; i < nums.Length; i++) {
    while (idx.Count > 0 && nums[i] > nums[idx.Peek()])
        result[idx.Pop()] = nums[i];                // i is the answer for the popped index
    idx.Push(i);
}
```

- **Cost:** O(1) per push/pop; O(n) time and space for scans (each index is pushed and popped once).
- ⚠️ `Pop`/`Peek` on an empty stack — check `Count` or use `TryPop` / `TryPeek`.
- **Classics:** Valid Parentheses #20, Min Stack #155, Daily Temperatures #739, Next Greater Element #496.

### Binary search
[Chapter 6](./06-sorting-and-binary-search.md)

- **Idea:** Halve a sorted (or monotonic) search space each step.
- **Spot it:** sorted + find / insert position / first-last occurrence / rotated; "smallest X that works" (search the answer).

```csharp
// Exact match / insert position
int low = 0, high = nums.Length - 1;
while (low <= high) {
    int mid = low + (high - low) / 2;               // avoids overflow
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) low = mid + 1; else high = mid - 1;
}
return low;                                         // insertion point

// Binary search on the answer: smallest value where Feasible is true
int lo = minPossible, hi = maxPossible;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (Feasible(mid)) hi = mid;                    // works: try smaller
    else lo = mid + 1;
}
return lo;
```

- **Cost:** O(log n) time, O(1) space. Search-on-answer is O(n log range).
- ⚠️ Running it on unsorted data. `<=` for exact search, `<` when converging on a boundary. Use `low + (high - low) / 2`.
- **Classics:** Binary Search #704, Search Insert Position #35, Search in Rotated Array #33, Koko Eating Bananas #875.

### Intervals (not yet in a chapter)
Builds on [Chapter 6](./06-sorting-and-binary-search.md) (sorting), [Chapter 11](./11-heaps-priority-queues.md) (heaps) and [Chapter 15](./15-greedy.md) (greedy)

- **Idea:** Sort, then sweep once. Two intervals overlap when `a.start <= b.end && b.start <= a.end`.
- **Spot it:** merge/insert intervals, "do any meetings clash?", "minimum rooms", "remove fewest to stop overlaps".
- **Which sort key?** Merge / insert / rooms → sort by **start**. Max non-overlapping / min removals → sort by **end** (see [Greedy](#greedy)).

```csharp
// Merge overlapping intervals
int[][] Merge(int[][] intervals) {
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    var merged = new List<int[]>();
    foreach (var cur in intervals) {
        if (merged.Count > 0 && cur[0] <= merged[^1][1])
            merged[^1][1] = Math.Max(merged[^1][1], cur[1]);  // overlap: extend
        else
            merged.Add(cur);
    }
    return merged.ToArray();
}

// Meeting rooms II: min-heap of end times = rooms in use
int MinMeetingRooms(int[][] intervals) {
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    var ends = new PriorityQueue<int, int>();
    foreach (var m in intervals) {
        if (ends.Count > 0 && ends.Peek() <= m[0]) ends.Dequeue();  // reuse a freed room
        ends.Enqueue(m[1], m[1]);
    }
    return ends.Count;
}
```

- **Cost:** O(n log n) for the sort; the sweep is O(n) (O(n log n) with the heap).
- ⚠️ Using `Math.Max` when extending matters — `[1,10]` then `[2,3]` must stay `[1,10]`. Clarify whether touching intervals (`[1,2]`, `[2,3]`) count as overlapping.
- **Classics:** Merge Intervals #56, Insert Interval #57, Non-overlapping Intervals #435, Meeting Rooms #252 / II #253.

### Linked lists
[Chapter 7](./07-linked-lists.md)

- **Idea:** No indexing — walk from the head and rewire `next` pointers.
- **Spot it:** reverse, merge sorted lists, detect cycle, find middle, nth from end, remove nodes.

```csharp
// Reverse
ListNode prev = null, curr = head;
while (curr != null) {
    ListNode next = curr.next;                      // save before overwriting
    curr.next = prev;
    prev = curr;
    curr = next;
}
return prev;

// Fast/slow: middle and cycle detection
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;                  // cycle
}
// no cycle: slow is now the middle

// Dummy head when the head might change
var dummy = new ListNode(0) { next = head };
// ... work from dummy, then return dummy.next
```

- **Cost:** O(n) time, O(1) space.
- ⚠️ Losing the rest of the list — save `curr.next` first. Null-check before `.next`. "n from end": move `fast` n steps ahead first.
- **Classics:** Reverse Linked List #206, Merge Two Sorted Lists #21, Linked List Cycle #141, Middle of the List #876, Remove Nth From End #19.

### Trees and recursion
[Chapter 8](./08-trees-and-recursion.md)

- **Idea:** Think from one node: "given what my children return, what do I return?"
- **Spot it:** depth/height, same/symmetric tree, root-to-leaf paths, validate BST, level-order output.
- **Three questions:** base case? recursive calls? what to return upward?

```csharp
// DFS: max depth
int MaxDepth(TreeNode node) {
    if (node == null) return 0;                     // base case
    return 1 + Math.Max(MaxDepth(node.left), MaxDepth(node.right));
}

// Validate BST: pass bounds down, not just a parent comparison
bool IsValid(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return IsValid(node.left, min, node.val) && IsValid(node.right, node.val, max);
}
// call: IsValid(root, long.MinValue, long.MaxValue)

// BFS: level by level
var queue = new Queue<TreeNode>();
if (root != null) queue.Enqueue(root);
while (queue.Count > 0) {
    int size = queue.Count;                         // nodes on this level
    for (int i = 0; i < size; i++) {
        var node = queue.Dequeue();
        if (node.left != null) queue.Enqueue(node.left);
        if (node.right != null) queue.Enqueue(node.right);
    }
}
```

- **Cost:** O(n) time; O(h) recursion space (O(log n) balanced, O(n) skewed). BFS is O(width).
- ⚠️ Missing the `null` base case. Validating a BST against the parent only.
- **Classics:** Max Depth #104, Invert Tree #226, Symmetric Tree #101, Path Sum #112, Validate BST #98, Level Order #102.

### Dynamic programming intro (1D)
[Chapter 9](./09-dynamic-programming-intro.md)

- **Idea:** Overlapping subproblems → compute each once. Top-down (recursion + memo) or bottom-up (table).
- **Spot it:** number of ways, min/max cost, "can you reach / is it possible".
- **Recipe:** 1) Write `dp[i]` as a sentence. 2) Recurrence. 3) Base cases. 4) Fill order (smaller first). 5) Where is the answer?

```csharp
// House Robber: dp[i] = max(dp[i-1], dp[i-2] + nums[i]), keeping only two values
int prev2 = 0, prev1 = 0;                           // dp[i-2], dp[i-1]
foreach (int x in nums) {
    int cur = Math.Max(prev1, prev2 + x);           // skip x, or take x
    prev2 = prev1;
    prev1 = cur;
}
return prev1;

// Coin Change (min coins): dp[a] = fewest coins to make amount a
var dp = new int[amount + 1];
Array.Fill(dp, amount + 1);                         // "infinity" that can't overflow
dp[0] = 0;
for (int a = 1; a <= amount; a++)
    foreach (int c in coins)
        if (c <= a) dp[a] = Math.Min(dp[a], dp[a - c] + 1);
return dp[amount] > amount ? -1 : dp[amount];
```

- **Cost:** usually O(n) or O(n × choices) time; O(n) space, O(1) if you keep only the last values.
- ⚠️ Coding before defining `dp[i]`. Using `int.MaxValue` as infinity (`+ 1` overflows) — use `amount + 1` or `int.MaxValue / 2`.
- **Classics:** Climbing Stairs #70, House Robber #198, Min Cost Climbing Stairs #746, Coin Change #322.

### DP shapes (knapsack, subsequence, grid, two strings)
[Chapter 13](./13-dynamic-programming-patterns.md)

Ask: **what decision repeats, and what does the answer depend on?**

| Shape | State | Recurrence | Answer | Cost |
|---|---|---|---|---|
| **0/1 knapsack** | `dp[cap]` | `dp[cap] = max(dp[cap], dp[cap - w] + v)`, cap loop **downward** | `dp[W]` | O(n × W) |
| **Unbounded knapsack** | `dp[cap]` | same, cap loop **upward** (items reusable) | `dp[W]` | O(n × W) |
| **Count combinations** | `dp[a]` | `dp[a] += dp[a - coin]`, **coins outer** loop | `dp[amount]` | O(n × amount) |
| **Subsequence (LIS)** | `dp[i]` = best ending at i | `dp[i] = 1 + max(dp[j])` for `j < i`, `nums[j] < nums[i]` | **max over dp** | O(n²) |
| **Grid** | `dp[r, c]` | `grid[r, c] + min(dp[r-1, c], dp[r, c-1])` | `dp[m-1, n-1]` | O(m × n) |
| **Two strings** | `dp[i, j]` = first i of a, first j of b | match → `dp[i-1, j-1]` (+1 for LCS); else LCS `max(up, left)`, edit `1 + min(up, left, diag)` | `dp[m, n]` | O(m × n) |

```csharp
// 0/1 knapsack, e.g. Partition Equal Subset Sum: can we reach `target`?
var can = new bool[target + 1];
can[0] = true;
foreach (int w in nums)
    for (int cap = target; cap >= w; cap--)        // downward = each item used once
        can[cap] |= can[cap - w];

// Two strings, e.g. Longest Common Subsequence
var dp = new int[a.Length + 1, b.Length + 1];      // row/col 0 = empty prefix
for (int i = 1; i <= a.Length; i++)
    for (int j = 1; j <= b.Length; j++)
        dp[i, j] = a[i - 1] == b[j - 1]
            ? dp[i - 1, j - 1] + 1
            : Math.Max(dp[i - 1, j], dp[i, j - 1]);
return dp[a.Length, b.Length];
```

- ⚠️ Wrong capacity loop direction (silently changes 0/1 ↔ unbounded). Coins inner loop counts **permutations**, not combinations. String tables are `(m+1) × (n+1)` and index strings with `i-1`.
- **Classics:** Partition Equal Subset Sum #416, Coin Change II #518, LIS #300, Unique Paths #62, Min Path Sum #64, LCS #1143, Edit Distance #72.

### Graphs
[Chapter 10](./10-graphs.md)

- **Idea:** Nodes + edges, possibly with cycles → tree traversal **plus a `visited` set**.
- **Choose the tool:**

| Need | Tool | Cost |
|---|---|---|
| Flood a region / count islands / any path | DFS (or BFS) | O(V + E) |
| Shortest path, unweighted / "minutes to spread" | BFS (multi-source if many starts) | O(V + E) |
| Dependency order, detect cycle in directed graph | Topological sort (Kahn) | O(V + E) |
| Groups / connectivity as edges arrive, cycle in undirected graph | Union-Find | ~O(1) per op |
| Shortest path with non-negative weights | Dijkstra (BFS + min-heap) | O((V + E) log V) |

```csharp
// Grid DFS (islands): sink visited land so it isn't counted twice
void Dfs(char[][] grid, int r, int c) {
    if (r < 0 || c < 0 || r >= grid.Length || c >= grid[0].Length || grid[r][c] != '1') return;
    grid[r][c] = '0';
    Dfs(grid, r + 1, c); Dfs(grid, r - 1, c); Dfs(grid, r, c + 1); Dfs(grid, r, c - 1);
}

// BFS shortest path: mark visited on ENQUEUE
var visited = new HashSet<int> { start };
var queue = new Queue<int>();
queue.Enqueue(start);
for (int steps = 0; queue.Count > 0; steps++) {
    for (int size = queue.Count; size > 0; size--) {
        int node = queue.Dequeue();
        if (node == goal) return steps;
        foreach (int next in graph[node])
            if (visited.Add(next)) queue.Enqueue(next);   // Add returns false if seen
    }
}
return -1;

// Topological sort (Kahn). Edge u -> v means "u before v".
var indegree = new int[n];
foreach (var (u, v) in edges) { graph[u].Add(v); indegree[v]++; }
var ready = new Queue<int>();
for (int i = 0; i < n; i++) if (indegree[i] == 0) ready.Enqueue(i);
var order = new List<int>();
while (ready.Count > 0) {
    int u = ready.Dequeue();
    order.Add(u);
    foreach (int v in graph[u])
        if (--indegree[v] == 0) ready.Enqueue(v);
}
// order.Count < n  =>  there is a cycle

// Union-Find with path compression
int[] parent = Enumerable.Range(0, n).ToArray();
int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);
bool Union(int a, int b) {
    int ra = Find(a), rb = Find(b);
    if (ra == rb) return false;                     // already connected
    parent[ra] = rb;
    return true;
}

// Dijkstra (graph: List<(int to, int w)>[])
var dist = new int[n];
Array.Fill(dist, int.MaxValue);
dist[src] = 0;
var pq = new PriorityQueue<int, int>();
pq.Enqueue(src, 0);
while (pq.TryDequeue(out int node, out int d)) {
    if (d > dist[node]) continue;                   // stale entry
    foreach (var (to, w) in graph[node])
        if (d + w < dist[to]) { dist[to] = d + w; pq.Enqueue(to, dist[to]); }
}
```

- ⚠️ No `visited` set (infinite loop on cycles). Marking visited on dequeue in BFS. Wrong edge direction — Course Schedule's `[a, b]` means **b → a**. Deep recursive DFS can overflow the stack on huge inputs.
- **Classics:** Number of Islands #200, Rotting Oranges #994, Clone Graph #133, Course Schedule #207 / II #210, Number of Provinces #547, Network Delay Time #743.

### Heaps and priority queues
[Chapter 11](./11-heaps-priority-queues.md)

- **Idea:** Always know the smallest (or largest) item; O(log n) insert/remove, no full sort.
- **Spot it:** top K, kth largest, K closest, most frequent, running median, merge K sorted, scheduling.

```csharp
// K largest: MIN-heap of size k (evict the weakest survivor)
var heap = new PriorityQueue<int, int>();
foreach (int x in nums) {
    heap.Enqueue(x, x);
    if (heap.Count > k) heap.Dequeue();
}
return heap.Peek();                                 // kth largest

// Max-heap: reverse the comparer (or enqueue with priority -x)
var maxHeap = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));

// Merge K sorted lists: heap of current heads, priority = value
var pq = new PriorityQueue<ListNode, int>();
foreach (var node in lists) if (node != null) pq.Enqueue(node, node.val);
var dummy = new ListNode(0); var tail = dummy;
while (pq.TryDequeue(out var smallest, out _)) {
    tail = tail.next = smallest;
    if (smallest.next != null) pq.Enqueue(smallest.next, smallest.next.val);
}
return dummy.next;
```

- **Running median:** max-heap for the lower half, min-heap for the upper half; keep sizes within 1; median is a top (or the average of both tops).
- **Cost:** O(n log k) for top K / merge K; O(log n) per median insert.
- ⚠️ Wrong direction — K **largest** uses a **min**-heap. C#'s `PriorityQueue` is a **min**-heap by default. If you need everything in order once, just sort.
- **Classics:** Kth Largest Element #215, Top K Frequent #347, K Closest Points #973, Merge K Sorted Lists #23, Find Median from Data Stream #295.

### Backtracking
[Chapter 12](./12-backtracking.md)

- **Idea:** Build a solution one choice at a time: **choose → explore → un-choose**. Prune dead branches early.
- **Spot it:** all subsets / permutations / combinations, "generate every", all paths, Sudoku, N-Queens, word search. n is small (≤ ~20).

```csharp
// Subsets / combinations: `start` moves forward only
var results = new List<IList<int>>();
var path = new List<int>();
void Backtrack(int start) {
    results.Add(new List<int>(path));               // record a COPY
    for (int i = start; i < nums.Length; i++) {
        if (i > start && nums[i] == nums[i - 1]) continue;  // skip duplicates (sort nums first)
        path.Add(nums[i]);                          // choose
        Backtrack(i + 1);                           // explore (i, not i + 1, if reuse is allowed)
        path.RemoveAt(path.Count - 1);              // un-choose
    }
}
Backtrack(0);

// Permutations: order matters, so track used[] instead of start
var used = new bool[nums.Length];
void Permute() {
    if (path.Count == nums.Length) { results.Add(new List<int>(path)); return; }
    for (int i = 0; i < nums.Length; i++) {
        if (used[i]) continue;
        used[i] = true; path.Add(nums[i]);
        Permute();
        used[i] = false; path.RemoveAt(path.Count - 1);
    }
}
```

- **Cost:** O(n · 2ⁿ) subsets, O(n · n!) permutations; O(n) recursion depth.
- ⚠️ Forgetting to un-choose. Adding `path` itself instead of a copy. Mixing up `start` (combinations) and `used[]` (permutations).
- **Classics:** Subsets #78, Subsets II #90, Permutations #46, Combination Sum #39, Word Search #79, N-Queens #51.

### Greedy
[Chapter 15](./15-greedy.md)

- **Idea:** Take the locally best choice and never revisit it. Only valid with a proof (exchange argument); otherwise use DP.
- **Spot it:** max non-overlapping, scheduling, min jumps / min to cover, "sort by something then pick".

```csharp
// Max non-overlapping intervals: sort by END, keep whatever finishes first
Array.Sort(intervals, (a, b) => a[1].CompareTo(b[1]));
int kept = 0, end = int.MinValue;
foreach (var iv in intervals)
    if (iv[0] >= end) { kept++; end = iv[1]; }
// min removals = intervals.Length - kept

// Jump Game: track the furthest reachable index
int furthest = 0;
for (int i = 0; i < nums.Length; i++) {
    if (i > furthest) return false;                 // stranded
    furthest = Math.Max(furthest, i + nums[i]);
}
return true;
```

- **Cost:** O(n log n) with a sort, O(n) for a single sweep; O(1) space.
- ⚠️ Greedy min-coin-change — coins `[1, 3, 4]`, amount 6: greedy gives 3 coins, optimal is 2 → DP. Sorting by start for max non-overlapping. "Number of ways" is never greedy.
- **Classics:** Jump Game #55 / II #45, Non-overlapping Intervals #435, Gas Station #134, Assign Cookies #455.

### Tries
[Chapter 16](./16-tries.md)

- **Idea:** A tree of characters; each root-to-node path is a prefix, shared prefixes are stored once.
- **Spot it:** autocomplete, "starts with", dictionary lookups, word search with many words, wildcard search.

```csharp
class TrieNode {
    public Dictionary<char, TrieNode> Children = new();
    public bool IsWord;                             // end-of-word flag
}
TrieNode root = new();

void Insert(string word) {
    var node = root;
    foreach (char c in word) {
        if (!node.Children.TryGetValue(c, out var next))
            node.Children[c] = next = new TrieNode();
        node = next;
    }
    node.IsWord = true;
}

TrieNode Walk(string s) {
    var node = root;
    foreach (char c in s)
        if (!node.Children.TryGetValue(c, out node)) return null;
    return node;
}
bool Search(string word) => Walk(word)?.IsWord == true;   // must end on a word
bool StartsWith(string prefix) => Walk(prefix) != null;   // node just has to exist
```

- **Cost:** O(L) per operation (L = word length); O(total characters) space.
- ⚠️ Forgetting `IsWord` — "app" vs a prefix of "apple". For wildcard `.`, branch over all children only on `.`; a normal character follows one edge.
- **Classics:** Implement Trie #208, Add and Search Words #211, Word Search II #212.

---

## 4. C# toolbox

| Need | Use | Key members | Notes |
|---|---|---|---|
| Key → value | `Dictionary<K, V>` | `TryGetValue`, `GetValueOrDefault`, `ContainsKey`, `Remove` | O(1) avg; no guaranteed order |
| Membership / dedupe | `HashSet<T>` | `Add` (returns `false` if present), `Contains`, `Remove` | O(1) avg |
| LIFO | `Stack<T>` | `Push`, `Pop`, `Peek`, `TryPop`, `TryPeek` | Throws on empty `Pop` / `Peek` |
| FIFO / BFS | `Queue<T>` | `Enqueue`, `Dequeue`, `Peek`, `TryDequeue` | |
| Heap | `PriorityQueue<TElement, TPriority>` | `Enqueue(e, p)`, `Dequeue`, `Peek`, `TryDequeue(out e, out p)` | **Min**-heap; custom `Comparer` for max |
| Sorted keys / ordered set | `SortedDictionary`, `SortedSet<T>` | `Min`, `Max`, `GetViewBetween` | O(log n) ops |
| Both ends | `LinkedList<T>` | `AddFirst`, `AddLast`, `RemoveFirst`, `Remove(node)` | O(1) with a node reference (LRU cache) |
| Build strings | `StringBuilder` | `Append`, `Insert`, `ToString` | `+=` in a loop is O(n²) |

**Handy one-liners**

```csharp
Array.Sort(arr);                                        // O(n log n), in place
Array.Sort(pairs, (a, b) => a[0].CompareTo(b[0]));      // custom key
list.Sort((a, b) => b.CompareTo(a));                    // descending
Array.Fill(dp, -1);
int last = arr[^1];                                     // index from end
var grid = new int[rows, cols];                         // rectangular: grid[r, c]
var jagged = new int[rows][];                           // jagged: jagged[r][c]
int digit = c - '0';  int letter = c - 'a';             // char arithmetic
char.IsLetterOrDigit(c); char.ToLower(c);
var counts = new int[26];                               // cheaper than a Dictionary for a-z
string sorted = new string(s.OrderBy(c => c).ToArray());
string joined = string.Join(",", list);
long big = (long)a * b;                                 // avoid int overflow
```

**Gotchas**
- `int` overflows silently past ~2.1 × 10⁹ — use `long` for sums/products, and `low + (high - low) / 2`.
- `int.MaxValue + 1` wraps negative — use `int.MaxValue / 2` or a problem-specific bound as "infinity".
- LINQ is fine for clarity but not free: `OrderBy` is O(n log n), `ToList()` / `ToArray()` copy, `Count()` on an `IEnumerable` can be O(n).
- `Substring` copies (O(k)); compare indices instead of slicing in hot loops.
- Deep recursion (≈10⁴+ frames) can overflow the stack — switch to an explicit `Stack<T>` or BFS.
- Modifying a collection inside its `foreach` throws — iterate a copy or use indices.

---

## 5. Complexity reference

### Data structures

| Structure | Access | Search | Insert | Delete | Notes |
|---|---|---|---|---|---|
| Array / `List<T>` | O(1) | O(n) | O(n) (end: O(1) amortised) | O(n) | |
| Sorted array | O(1) | O(log n) | O(n) | O(n) | |
| `Dictionary` / `HashSet` | — | O(1) avg | O(1) avg | O(1) avg | |
| `Stack` / `Queue` | top/front O(1) | O(n) | O(1) | O(1) | |
| Linked list | O(n) | O(n) | O(1) at a known node | O(1) at a known node | |
| Heap | min/max O(1) | O(n) | O(log n) | O(log n) (root) | Build from n items: O(n) |
| Balanced BST / `SortedSet` | — | O(log n) | O(log n) | O(log n) | |
| Trie | — | O(L) | O(L) | O(L) | L = word length |

### Patterns

| Pattern | Time | Space |
|---|---|---|
| Hash map / set | O(n) | O(n) |
| Two pointers / sliding window / Kadane | O(n) | O(1) |
| Prefix sum + hash map | O(n) | O(n) |
| Sort + sweep (intervals, greedy) | O(n log n) | O(1)–O(n) |
| Binary search | O(log n) | O(1) |
| Tree / graph BFS / DFS | O(V + E) | O(V) |
| Dijkstra | O((V + E) log V) | O(V) |
| Heap top-K | O(n log k) | O(k) |
| Backtracking | O(2ⁿ) / O(n!) — prune! | O(depth) |
| DP | O(states × transitions) | O(states) |

**Recursion space** counts the call stack: O(depth). **Output space** (e.g. all subsets) is usually stated separately. More in [Space Complexity](../extras/space-complexity-guide.md).

---

## 6. Interview routine

From [Chapter 14](./14-pattern-recognition.md). Say every step out loud.

1. **Clarify** — input size and range, negatives, duplicates, sorted?, empty input, what to return (index or value, any or all), can I modify the input?
2. **Examples** — run a normal case and one edge case by hand.
3. **Brute force** — state it and its complexity before optimising.
4. **Optimise** — name the pattern from the signals; say the target complexity.
5. **Code** — clear names, small helpers, narrate as you go.
6. **Test** — trace your example through the code, then the edge cases. Restate time and space.

**Edge-case checklist:** empty · one element · two elements · all the same · already sorted / reverse sorted · negatives / zero · duplicates · very large values (overflow) · no valid answer · cycles (graphs) · `null` (lists / trees).

---

## 7. Top mistakes

1. Coding before clarifying the problem or defining `dp[i]`.
2. Off-by-one: `< Length` vs `<= Length - 1`, window size `right - left + 1`, DP tables sized `n + 1`.
3. Reading a missing dictionary key — use `GetValueOrDefault` / `TryGetValue`.
4. Two pointers or binary search on **unsorted** input.
5. Sum-based sliding window with **negative** numbers — use prefix sum + hash map.
6. Forgetting to shrink the window when it becomes invalid.
7. `Pop` / `Peek` on an empty stack.
8. Losing the rest of a linked list — save `next` before rewiring; use a dummy head.
9. Missing the `null` base case in tree recursion; validating a BST against the parent only.
10. No `visited` set in graphs; marking visited on dequeue in BFS.
11. Wrong heap direction — K largest uses a **min**-heap.
12. Backtracking: forgetting to un-choose, or storing `path` instead of a copy.
13. DP: wrong capacity loop direction (0/1 vs unbounded); coins inner loop counts permutations.
14. Greedy without proof (min-coin-change with `[1, 3, 4]`).
15. Integer overflow — `(low + high) / 2`, `int.MaxValue + 1`, large sums in `int`.
16. Going silent, or abandoning a working O(n²) for a half-written O(n).
