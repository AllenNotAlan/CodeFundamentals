# 11 — Heaps & Priority Queues

A heap answers one question extremely fast: **"what's the smallest (or largest) thing right now?"** If sorting (chapter 06) reorganises *everything* so you can find extremes, a heap keeps *just enough* order to hand you the extreme in `O(log n)` — without paying to fully sort.

> **Builds on:** the cost of sorting from [Sorting & Binary Search](./06-sorting-and-binary-search.md). The key realisation: if you only ever need the top/bottom element repeatedly, sorting the whole collection is wasteful — a heap is the right tool.

---

## Core Concepts

### What a heap is
A **binary heap** is a tree kept in a simple invariant:
- **Min-heap:** every parent ≤ its children → the smallest element is always at the root.
- **Max-heap:** every parent ≥ its children → the largest element is always at the root.

You never fully sort the data. You just maintain "the root is the extreme", which is cheap to preserve on insert/remove.

```
Min-heap (root = smallest):

        1
       / \
      3    2
     / \
    7   5
```

### The three operations that matter
| Operation | Cost | What it does |
|-----------|------|--------------|
| Peek | O(1) | Look at the min/max (the root) |
| Push (insert) | O(log n) | Add an element, bubble it to its place |
| Pop (extract) | O(log n) | Remove the min/max, re-settle the heap |

### In your language
- **C#:** `PriorityQueue<TElement, TPriority>` — lower priority value dequeues first (a min-heap by default). For a max-heap, negate the priority or use a comparer.
- **Python:** `heapq` on a plain list — it's a **min-heap**. For a max-heap, push negated values.

```csharp
// C# min-heap of ints
var minHeap = new PriorityQueue<int, int>();
minHeap.Enqueue(5, 5);
minHeap.Enqueue(1, 1);
minHeap.Enqueue(3, 3);
int smallest = minHeap.Dequeue();   // 1

// Max-heap: negate the priority
var maxHeap = new PriorityQueue<int, int>();
maxHeap.Enqueue(5, -5);
maxHeap.Enqueue(1, -1);
int largest = maxHeap.Dequeue();    // 5
```
```python
import heapq

# Python min-heap
min_heap = []
heapq.heappush(min_heap, 5)
heapq.heappush(min_heap, 1)
heapq.heappush(min_heap, 3)
smallest = heapq.heappop(min_heap)   # 1

# Max-heap: push negatives, negate on the way out
max_heap = []
heapq.heappush(max_heap, -5)
heapq.heappush(max_heap, -1)
largest = -heapq.heappop(max_heap)   # 5
```

---

## The Signal: when to reach for a heap

Ask: *"Do I repeatedly need the smallest/largest element from a changing collection?"* If yes → heap.

Signal words: **"top K"**, **"K largest/smallest"**, **"K closest"**, **"median"**, **"merge K sorted …"**, **"most frequent"**, **"schedule by priority"**.

The classic trap it avoids: re-sorting after every change is `O(n log n)` *each time*; a heap makes each update `O(log n)`.

---

## Patterns with Code

### Pattern 1: Top-K with a bounded heap
To find the **K largest** elements, keep a **min-heap of size K**. The root is the smallest of your current top-K; if a new element beats it, evict the root. This is `O(n log k)` — much better than sorting everything when `k ≪ n`.

```csharp
int[] TopKLargest(int[] nums, int k)
{
    // 1. Min-heap holds the k largest seen so far; its root is the weakest survivor.
    var heap = new PriorityQueue<int, int>();
    foreach (int n in nums)
    {
        heap.Enqueue(n, n);
        // 2. Keep only k elements — drop the smallest when we exceed k.
        if (heap.Count > k) heap.Dequeue();
    }
    // 3. Whatever remains is the top-k.
    return heap.UnorderedItems.Select(x => x.Element).ToArray();
}
```
```python
import heapq

def top_k_largest(nums, k):
    # nlargest handles the bounded-heap logic for you.
    return heapq.nlargest(k, nums)
```
**Why a MIN-heap for the LARGEST?** Because you want to cheaply discard the *weakest* of your current winners. The smallest of the top-K sits at a min-heap's root, ready to evict.

### Pattern 2: Merging K sorted sequences
Put the head of each sequence in a heap; repeatedly pop the global minimum and push the next element from that sequence. Each pop gives the next element in overall sorted order.

```csharp
// Merge k sorted arrays into one sorted list.
List<int> MergeK(List<int[]> lists)
{
    // Heap entry: (value, whichList, indexInThatList)
    var heap = new PriorityQueue<(int val, int list, int idx), int>();
    for (int i = 0; i < lists.Count; i++)
        if (lists[i].Length > 0)
            heap.Enqueue((lists[i][0], i, 0), lists[i][0]);   // 1. seed with each head

    var result = new List<int>();
    while (heap.Count > 0)
    {
        var (val, list, idx) = heap.Dequeue();   // 2. smallest across all heads
        result.Add(val);
        // 3. Advance that list; push its next element if any remain.
        if (idx + 1 < lists[list].Length)
        {
            int next = lists[list][idx + 1];
            heap.Enqueue((next, list, idx + 1), next);
        }
    }
    return result;
}
```
**Why use it?** The heap only ever holds `k` items (one per sequence), so merging `n` total elements costs `O(n log k)`.

### Pattern 3: Two heaps for a running median
Keep a **max-heap of the lower half** and a **min-heap of the upper half**, balanced in size. The median is then at the top(s) of the heaps — `O(log n)` per insert, `O(1)` to read the median.

```csharp
public class MedianFinder
{
    private readonly PriorityQueue<int, int> low = new();   // max-heap (negated)
    private readonly PriorityQueue<int, int> high = new();  // min-heap

    public void AddNum(int num)
    {
        // 1. Add to the lower half (max-heap via negated priority).
        low.Enqueue(num, -num);
        // 2. Balance: move the largest of the low half into the high half.
        var top = low.Dequeue();
        high.Enqueue(top, top);
        // 3. Keep low at least as big as high.
        if (high.Count > low.Count)
        {
            var t = high.Dequeue();
            low.Enqueue(t, -t);
        }
    }

    public double FindMedian()
    {
        // Odd count → low has the extra element. Even → average the two tops.
        if (low.Count > high.Count) return low.Peek();
        return (low.Peek() + high.Peek()) / 2.0;
    }
}
```
```python
import heapq

class MedianFinder:
    def __init__(self):
        self.low = []    # max-heap (store negatives)
        self.high = []   # min-heap

    def add_num(self, num):
        heapq.heappush(self.low, -num)                 # 1. into lower half
        heapq.heappush(self.high, -heapq.heappop(self.low))  # 2. shift largest up
        if len(self.high) > len(self.low):             # 3. rebalance
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2
```
**Why use it?** Splitting the data at the median lets you read the middle instantly while keeping inserts cheap.

---

## Practice Problems

---

### Problem 1 — Kth Largest Element in an Array (LeetCode #215)
**Task:** Return the kth largest element (kth in sorted order, not kth distinct).

**Example:** `[3, 2, 1, 5, 6, 4]`, `k = 2` → `5`

**Think first:** You don't need the whole array sorted — just the kth largest. A size-k min-heap keeps exactly the top-k; its root *is* the kth largest.

**Solution:**
```csharp
int FindKthLargest(int[] nums, int k)
{
    var heap = new PriorityQueue<int, int>();   // min-heap, capped at size k
    foreach (int n in nums)
    {
        heap.Enqueue(n, n);
        if (heap.Count > k) heap.Dequeue();     // evict the smallest
    }
    return heap.Peek();   // root = kth largest
}
```
```python
import heapq

def find_kth_largest(nums, k):
    heap = []
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)   # keep only the k largest
    return heap[0]                # root = kth largest
```
⏱ Time: O(n log k) | Space: O(k)

---

### Problem 2 — Top K Frequent Elements (LeetCode #347)
**Task:** Return the k most frequent elements.

**Example:** `[1,1,1,2,2,3]`, `k = 2` → `[1, 2]`

**Key insight:** Count frequencies with a hash map (chapter 02), then use a size-k min-heap keyed on frequency to keep the k most frequent.

**Solution:**
```csharp
int[] TopKFrequent(int[] nums, int k)
{
    // 1. Frequency count (hash map pattern from chapter 02).
    var freq = new Dictionary<int, int>();
    foreach (int n in nums) freq[n] = freq.GetValueOrDefault(n) + 1;

    // 2. Min-heap keyed by frequency, capped at k.
    var heap = new PriorityQueue<int, int>();
    foreach (var (num, count) in freq)
    {
        heap.Enqueue(num, count);
        if (heap.Count > k) heap.Dequeue();   // drop the least frequent survivor
    }

    // 3. The heap now holds the k most frequent.
    return heap.UnorderedItems.Select(x => x.Element).ToArray();
}
```
```python
import heapq
from collections import Counter

def top_k_frequent(nums, k):
    # 1. Count frequencies, 2+3. nlargest by frequency.
    freq = Counter(nums)
    return [num for num, _ in freq.most_common(k)]
```
⏱ Time: O(n log k) | Space: O(n)

---

### Problem 3 — K Closest Points to Origin (LeetCode #973)
**Task:** Return the k points closest to `(0, 0)`.

**Example:** `[[1,3],[-2,2]]`, `k = 1` → `[[-2,2]]`

**Key insight:** "K closest" → size-k heap keyed on distance. Keep a **max-heap of size k** so you can evict the *farthest* survivor when a closer point arrives. (We can compare squared distance — no need for `sqrt`.)

**Solution:**
```csharp
int[][] KClosest(int[][] points, int k)
{
    // Max-heap on squared distance: root is the farthest of our current k.
    var heap = new PriorityQueue<int[], int>();
    foreach (var p in points)
    {
        int dist = p[0] * p[0] + p[1] * p[1];
        heap.Enqueue(p, -dist);              // negate → max-heap
        if (heap.Count > k) heap.Dequeue();  // evict the farthest
    }
    return heap.UnorderedItems.Select(x => x.Element).ToArray();
}
```
```python
import heapq

def k_closest(points, k):
    # nsmallest by squared distance returns the k closest.
    return heapq.nsmallest(k, points, key=lambda p: p[0] ** 2 + p[1] ** 2)
```
⏱ Time: O(n log k) | Space: O(k)

---

### Problem 4 — Merge K Sorted Lists (LeetCode #23)
**Task:** Merge `k` sorted linked lists into one sorted list.

**Key insight:** This is Pattern 2. Keep the current head of each list in a min-heap; repeatedly pop the smallest and advance that list. Ties in linked lists need a tiebreaker since nodes aren't comparable — use an index.

**Solution:**
```csharp
// ListNode from chapter 07: { int val; ListNode next; }
ListNode MergeKLists(ListNode[] lists)
{
    // Priority = node value; tiebreaker index keeps it stable & comparable.
    var heap = new PriorityQueue<ListNode, (int val, int idx)>();
    for (int i = 0; i < lists.Length; i++)
        if (lists[i] != null) heap.Enqueue(lists[i], (lists[i].val, i));   // 1. seed heads

    var dummy = new ListNode(0);
    var tail = dummy;
    int counter = lists.Length;

    while (heap.Count > 0)
    {
        var node = heap.Dequeue();   // 2. smallest current head
        tail.next = node;
        tail = tail.next;
        // 3. Push the next node from that list.
        if (node.next != null) heap.Enqueue(node.next, (node.next.val, counter++));
    }
    return dummy.next;
}
```
```python
import heapq

def merge_k_lists(lists):
    heap = []
    # 1. Seed heap with (value, index, node) — index breaks ties.
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))

    dummy = tail = ListNode(0)
    counter = len(lists)
    while heap:
        val, i, node = heapq.heappop(heap)   # 2. smallest head
        tail.next = node
        tail = tail.next
        if node.next:                         # 3. advance that list
            heapq.heappush(heap, (node.next.val, counter, node.next))
            counter += 1
    return dummy.next
```
⏱ Time: O(n log k) | Space: O(k)

---

## Heap vs Sorting — when each wins

| Situation | Use | Why |
|-----------|-----|-----|
| Need the full order once | **Sort** (chapter 06) | One `O(n log n)` pass, then done |
| Need top/bottom K from n | **Heap, size K** | `O(n log k)` — cheaper when `k ≪ n` |
| Stream of data, extreme at any time | **Heap** | `O(log n)` per update; sorting can't keep up |
| Repeated "next smallest" across sources | **Heap** | Merge-K pattern; heap holds only the heads |

---

## Common Mistakes

- **Wrong heap direction** — for the *K largest* use a *min*-heap (so you evict the weakest); for *K smallest* use a *max*-heap. This feels backwards at first.
- **Forgetting Python `heapq` is min-only** — negate values for max-heap behaviour, and remember to negate back.
- **Non-comparable elements** — in C#/Python, when priorities tie on objects (e.g. linked-list nodes), add an index tiebreaker or the comparison throws.
- **Using a heap when one sort suffices** — if you need everything in order exactly once, just sort.

---

## LeetCode Problems to Try Now

- #215 — Kth Largest Element ⭐ (bounded min-heap)
- #347 — Top K Frequent Elements ⭐ (hash map + heap)
- #973 — K Closest Points to Origin ⭐ (max-heap of size k)
- #23 — Merge K Sorted Lists ⭐⭐ (merge-K pattern)
- #295 — Find Median from Data Stream ⭐⭐ (two heaps)
- #621 — Task Scheduler (greedy + max-heap)
