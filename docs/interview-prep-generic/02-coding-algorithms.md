# 02 — Coding & Algorithms

Live coding rounds test your ability to write clean, correct code under pressure. Interviewers care about your thought process as much as the final solution.

---

## What Interviewers Assess

| Criteria | What they look for |
|----------|-------------------|
| Problem decomposition | Can you break a vague problem into concrete steps? |
| Communication | Do you think out loud and explain trade-offs? |
| Code quality | Readable, well-named variables, no dead code |
| Testing mindset | Do you consider edge cases without being prompted? |
| Complexity awareness | Can you state time/space complexity and optimise? |

---

## Framework for Live Coding

```
1. Restate the problem (confirm understanding)
2. Work through 1–2 examples by hand
3. State the brute-force approach and its complexity
4. Identify the optimisation (pattern recognition)
5. Code the solution (talk while you type)
6. Trace through an example with your code
7. Discuss edge cases and test
```

---

## Question 1 — Design a Time-Based Key-Value Store

> "Implement a data structure that stores key-value pairs with timestamps, and retrieves the value for a key at or before a given timestamp."

### Why This Is Asked
Tests understanding of binary search, data structure design, and API thinking — common in caching, config systems, and event sourcing.

### Interface

```csharp
void Set(string key, string value, int timestamp);
string Get(string key, int timestamp); // return value at largest timestamp <= given
```

### Solution

```csharp
public class TimeMap
{
    private readonly Dictionary<string, List<(int timestamp, string value)>> _store = new();

    public void Set(string key, string value, int timestamp)
    {
        if (!_store.ContainsKey(key))
            _store[key] = new List<(int, string)>();
        _store[key].Add((timestamp, value));
    }

    public string Get(string key, int timestamp)
    {
        if (!_store.TryGetValue(key, out var entries))
            return "";

        // Binary search for largest timestamp <= target
        int lo = 0, hi = entries.Count - 1, result = -1;
        while (lo <= hi)
        {
            int mid = lo + (hi - lo) / 2;
            if (entries[mid].timestamp <= timestamp)
            {
                result = mid;
                lo = mid + 1;
            }
            else
            {
                hi = mid - 1;
            }
        }
        return result >= 0 ? entries[result].value : "";
    }
}
```

**Time:** Set O(1), Get O(log n)
**Space:** O(total entries)

### Follow-up Questions
- "What if timestamps aren't guaranteed to be increasing?" → Sort on insert or use a sorted structure
- "How would you handle deletion?" → Tombstone markers with compaction

---

## Question 2 — Rate Limiter

> "Implement a rate limiter that allows at most N requests per user per time window."

### Why This Is Asked
Rate limiting is fundamental infrastructure — protects APIs from abuse, ensures fair usage, and prevents cascading failures.

### Sliding Window Approach

```csharp
public class RateLimiter
{
    private readonly int _maxRequests;
    private readonly TimeSpan _window;
    private readonly Dictionary<string, Queue<DateTime>> _requests = new();

    public RateLimiter(int maxRequests, TimeSpan window)
    {
        _maxRequests = maxRequests;
        _window = window;
    }

    public bool IsAllowed(string userId)
    {
        var now = DateTime.UtcNow;

        if (!_requests.ContainsKey(userId))
            _requests[userId] = new Queue<DateTime>();

        var queue = _requests[userId];

        // Remove expired entries
        while (queue.Count > 0 && now - queue.Peek() > _window)
            queue.Dequeue();

        if (queue.Count >= _maxRequests)
            return false;

        queue.Enqueue(now);
        return true;
    }
}
```

**Time:** O(1) amortised per call
**Space:** O(users × maxRequests)

### Follow-up
- "How would you make this distributed?" → Redis sorted sets with timestamp as score
- "How do you handle clock skew across servers?" → Use Redis server time, not local time

---

## Question 3 — LRU Cache

> "Implement a Least Recently Used cache with O(1) get and put."

### Why This Is Asked
Caching is everywhere — CDNs, database query caches, session stores. LRU is the most common eviction policy.

### Solution — Dictionary + Doubly Linked List

```csharp
public class LRUCache
{
    private readonly int _capacity;
    private readonly Dictionary<int, LinkedListNode<(int key, int val)>> _map = new();
    private readonly LinkedList<(int key, int val)> _list = new();

    public LRUCache(int capacity) => _capacity = capacity;

    public int Get(int key)
    {
        if (!_map.TryGetValue(key, out var node)) return -1;
        _list.Remove(node);
        _list.AddFirst(node);
        return node.Value.val;
    }

    public void Put(int key, int value)
    {
        if (_map.TryGetValue(key, out var existing))
        {
            _list.Remove(existing);
            _map.Remove(key);
        }
        else if (_map.Count >= _capacity)
        {
            var lru = _list.Last!;
            _map.Remove(lru.Value.key);
            _list.RemoveLast();
        }

        var node = new LinkedListNode<(int key, int val)>((key, value));
        _list.AddFirst(node);
        _map[key] = node;
    }
}
```

**Time:** O(1) for both Get and Put
**Space:** O(capacity)

### Follow-up
- "How would you make this thread-safe?" → Lock striping or concurrent dictionary + lock on eviction
- "What about LFU (Least Frequently Used)?" → Add frequency counter + min-heap or frequency buckets

---

## Question 4 — Find K Closest Points to Origin

> "Given an array of points on a 2D plane, find the K closest points to the origin (0,0)."

### Why This Is Asked
Tests heap/priority queue knowledge — fundamental for top-K problems, streaming data, and scheduling.

### Solution — Max Heap of Size K

```csharp
int[][] KClosest(int[][] points, int k)
{
    // Max-heap: keep the K smallest by evicting the largest
    var heap = new PriorityQueue<int[], int>(Comparer<int>.Create((a, b) => b - a));

    foreach (var point in points)
    {
        int dist = point[0] * point[0] + point[1] * point[1];
        heap.Enqueue(point, dist);
        if (heap.Count > k)
            heap.Dequeue();
    }

    var result = new int[k][];
    for (int i = 0; i < k; i++)
        result[i] = heap.Dequeue();
    return result;
}
```

**Time:** O(n log k)
**Space:** O(k)

### Alternative: Quickselect

```csharp
// Average O(n), worst O(n²) — partitions around pivot like quicksort
// After partition, all elements left of pivot are closer than those right of it
// No need to fully sort — just partition until pivot is at index k
```

**Time:** O(n) average
**Space:** O(1)

---

## Question 5 — Design a Hit Counter

> "Design a system that counts the number of hits received in the past 5 minutes."

### Why This Is Asked
Tests understanding of time-based data structures, sliding windows, and space-time trade-offs. Common in monitoring, analytics, and rate limiting.

### Solution — Circular Buffer

```csharp
public class HitCounter
{
    private readonly int[] _hits = new int[300];      // one slot per second
    private readonly int[] _timestamps = new int[300]; // track which second each slot represents

    public void Hit(int timestamp)
    {
        int idx = timestamp % 300;
        if (_timestamps[idx] == timestamp)
            _hits[idx]++;
        else
        {
            _timestamps[idx] = timestamp;
            _hits[idx] = 1; // new second, reset count
        }
    }

    public int GetHits(int timestamp)
    {
        int total = 0;
        for (int i = 0; i < 300; i++)
        {
            if (timestamp - _timestamps[i] < 300)
                total += _hits[i];
        }
        return total;
    }
}
```

**Time:** Hit O(1), GetHits O(300) = O(1)
**Space:** O(1) — fixed 300 slots regardless of traffic

### Follow-up
- "What if hits come out of order?" → Use a sorted structure or accept slight inaccuracy
- "What if you need per-second granularity for the last hour?" → 3600 slots instead of 300

---

## Question 6 — Serialize and Deserialize a Binary Tree

> "Design an algorithm to serialize a binary tree to a string and deserialize it back."

### Why This Is Asked
Tests recursion, tree traversal, and encoding/decoding — relevant to data serialization, network protocols, and storage formats.

### Solution — Preorder Traversal with Null Markers

```csharp
public class Codec
{
    public string Serialize(TreeNode root)
    {
        var parts = new List<string>();
        SerializeHelper(root, parts);
        return string.Join(",", parts);
    }

    private void SerializeHelper(TreeNode node, List<string> parts)
    {
        if (node == null) { parts.Add("null"); return; }
        parts.Add(node.val.ToString());
        SerializeHelper(node.left, parts);
        SerializeHelper(node.right, parts);
    }

    public TreeNode Deserialize(string data)
    {
        var queue = new Queue<string>(data.Split(','));
        return DeserializeHelper(queue);
    }

    private TreeNode DeserializeHelper(Queue<string> queue)
    {
        var val = queue.Dequeue();
        if (val == "null") return null;
        var node = new TreeNode(int.Parse(val));
        node.left = DeserializeHelper(queue);
        node.right = DeserializeHelper(queue);
        return node;
    }
}
```

**Time:** O(n) for both operations
**Space:** O(n)

### Example

```
Tree:       1
           / \
          2   3
             / \
            4   5

Serialized: "1,2,null,null,3,4,null,null,5,null,null"
```

---

## Question 7 — Merge K Sorted Lists

> "Given K sorted linked lists, merge them into one sorted list."

### Why This Is Asked
Classic heap problem — appears in merge-sort variants, database query merging, and log aggregation.

### Solution — Min Heap

```csharp
ListNode MergeKLists(ListNode[] lists)
{
    var heap = new PriorityQueue<ListNode, int>();
    foreach (var list in lists)
        if (list != null) heap.Enqueue(list, list.val);

    var dummy = new ListNode(0);
    var curr = dummy;

    while (heap.Count > 0)
    {
        var node = heap.Dequeue();
        curr.next = node;
        curr = curr.next;
        if (node.next != null)
            heap.Enqueue(node.next, node.next.val);
    }
    return dummy.next;
}
```

**Time:** O(N log K) where N = total nodes, K = number of lists
**Space:** O(K) for the heap

---

## Tips for Coding Interviews

1. **Clarify before coding** — "Can the input be empty? Are there duplicates? Is it sorted?"
2. **Start with brute force** — show you can solve it, then optimise
3. **Talk through your thinking** — silence is the enemy
4. **Use meaningful names** — `left`, `right`, `windowStart` not `i`, `j`, `k`
5. **Test with examples** — trace through your code with the given example
6. **Edge cases to always consider:**
   - Empty input
   - Single element
   - Duplicates
   - Very large input (overflow?)
   - Negative numbers
   - Already sorted / reverse sorted
