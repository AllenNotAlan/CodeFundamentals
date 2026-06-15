# 02 — Coding & Algorithms

Live coding rounds at fintech companies test your ability to write clean, correct code under pressure. They care about your thought process as much as the final solution.

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

## Question 1 — Transaction Deduplication

> "Given a stream of transactions, identify duplicates. Two transactions are duplicates if they have the same amount, merchant, and occur within 60 seconds of each other."

### Why This Is Asked
Duplicate detection is a real problem in payment systems — network retries, double-taps, and webhook replays all cause it.

### Approach

```
Brute force: Compare every pair → O(n²)
Optimised: Group by (amount, merchant), then check timestamps within each group → O(n)
```

### Solution

```csharp
public class Transaction
{
    public string Id { get; set; }
    public string Merchant { get; set; }
    public long Amount { get; set; }
    public DateTime Timestamp { get; set; }
}

List<(string, string)> FindDuplicates(List<Transaction> transactions)
{
    var groups = new Dictionary<string, List<Transaction>>();
    var duplicates = new List<(string, string)>();

    foreach (var tx in transactions)
    {
        string key = $"{tx.Merchant}:{tx.Amount}";

        if (groups.TryGetValue(key, out var existing))
        {
            foreach (var prev in existing)
            {
                if (Math.Abs((tx.Timestamp - prev.Timestamp).TotalSeconds) <= 60)
                {
                    duplicates.Add((prev.Id, tx.Id));
                    break;
                }
            }
        }

        if (!groups.ContainsKey(key)) groups[key] = new List<Transaction>();
        groups[key].Add(tx);
    }
    return duplicates;
}
```

**Time:** O(n) average (assuming few collisions per group)
**Space:** O(n)

### Follow-up Questions
- "What if the stream is infinite?" → Use a sliding window with TTL (remove entries older than 60s)
- "What if this needs to work across multiple servers?" → Use Redis with key expiry

---

## Question 2 — Rate Limiter

> "Implement a rate limiter that allows at most N requests per user per time window."

### Why This Is Asked
Rate limiting protects APIs from abuse — critical in fintech where brute-force attacks target authentication and payment endpoints.

### Sliding Window Counter Approach

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
- "How would you make this distributed?" → Redis sorted sets with timestamp as score, `ZRANGEBYSCORE` to count recent requests, `ZREMRANGEBYSCORE` to evict old ones.

---

## Question 3 — Account Balance at a Point in Time

> "Given a list of transactions with timestamps, return the account balance at any given point in time."

### Why This Is Asked
Fintech apps show historical balances, statements, and "balance at date" for regulatory reporting.

### Solution — Prefix Sum on Sorted Transactions

```csharp
public class BalanceTracker
{
    private readonly List<(DateTime time, long amount)> _entries = new();
    private bool _sorted = false;

    public void AddTransaction(DateTime time, long amount)
    {
        _entries.Add((time, amount));
        _sorted = false;
    }

    public long BalanceAt(DateTime pointInTime)
    {
        if (!_sorted)
        {
            _entries.Sort((a, b) => a.time.CompareTo(b.time));
            _sorted = true;
        }

        long balance = 0;
        foreach (var (time, amount) in _entries)
        {
            if (time > pointInTime) break;
            balance += amount;
        }
        return balance;
    }
}
```

**Optimised with binary search (for many queries):**

```csharp
public long BalanceAtOptimised(DateTime pointInTime)
{
    if (!_sorted)
    {
        _entries.Sort((a, b) => a.time.CompareTo(b.time));
        // Pre-compute prefix sums
        _prefixSums = new long[_entries.Count];
        _prefixSums[0] = _entries[0].amount;
        for (int i = 1; i < _entries.Count; i++)
            _prefixSums[i] = _prefixSums[i - 1] + _entries[i].amount;
        _sorted = true;
    }

    // Binary search for the last transaction <= pointInTime
    int lo = 0, hi = _entries.Count - 1, idx = -1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (_entries[mid].time <= pointInTime) { idx = mid; lo = mid + 1; }
        else hi = mid - 1;
    }

    return idx >= 0 ? _prefixSums[idx] : 0;
}
```

**Time:** O(n log n) setup, O(log n) per query
**Space:** O(n)

---

## Question 4 — Minimum Transactions to Settle Debts

> "A group of friends have lent each other money. Find the minimum number of transactions to settle all debts."

### Why This Is Asked
This is the core algorithm behind bill-splitting features (Monzo Shared Tabs, Splitwise).

### Approach

```
1. Calculate net balance for each person (total owed - total paid)
2. People with positive balance are creditors, negative are debtors
3. Greedily match largest debtor with largest creditor
```

### Solution

```csharp
// Input: list of (from, to, amount) debts
int MinTransactions(int[][] debts)
{
    var balance = new Dictionary<int, long>();
    foreach (var d in debts)
    {
        balance[d[0]] = balance.GetValueOrDefault(d[0]) - d[2];
        balance[d[1]] = balance.GetValueOrDefault(d[1]) + d[2];
    }

    // Filter out zero balances
    var nonZero = balance.Values.Where(b => b != 0).ToList();
    return Settle(nonZero, 0);
}

// Backtracking to find true minimum (NP-hard in general)
int Settle(List<long> balances, int start)
{
    while (start < balances.Count && balances[start] == 0)
        start++;

    if (start == balances.Count) return 0;

    int minTx = int.MaxValue;
    for (int i = start + 1; i < balances.Count; i++)
    {
        // Only settle between opposite signs
        if (balances[start] * balances[i] < 0)
        {
            balances[i] += balances[start];
            minTx = Math.Min(minTx, 1 + Settle(balances, start + 1));
            balances[i] -= balances[start]; // backtrack
        }
    }
    return minTx;
}
```

**Time:** O(n!) worst case (NP-hard), but small n in practice (< 10 people)
**Space:** O(n)

**Greedy approximation** (good enough for production):
```csharp
int SettleGreedy(Dictionary<int, long> balances)
{
    var pos = new List<long>(); // creditors
    var neg = new List<long>(); // debtors
    foreach (var b in balances.Values)
    {
        if (b > 0) pos.Add(b);
        else if (b < 0) neg.Add(-b);
    }
    pos.Sort(); neg.Sort();

    int transactions = 0;
    int i = 0, j = 0;
    while (i < pos.Count && j < neg.Count)
    {
        long settled = Math.Min(pos[i], neg[j]);
        pos[i] -= settled;
        neg[j] -= settled;
        if (pos[i] == 0) i++;
        if (neg[j] == 0) j++;
        transactions++;
    }
    return transactions;
}
```

---

## Question 5 — Detect Fraudulent Transaction Patterns

> "Given a user's transaction history, flag transactions that are anomalous: amount > 3x their average, or more than 3 transactions within 5 minutes."

### Solution

```csharp
List<Transaction> DetectAnomalies(List<Transaction> history)
{
    var flagged = new List<Transaction>();
    if (history.Count == 0) return flagged;

    // Sort by time
    history.Sort((a, b) => a.Timestamp.CompareTo(b.Timestamp));

    // Calculate running average
    long totalAmount = 0;
    int count = 0;

    // Sliding window for frequency check
    var window = new Queue<DateTime>();

    foreach (var tx in history)
    {
        bool anomalous = false;

        // Rule 1: Amount > 3x average (need at least 10 prior transactions)
        if (count >= 10 && tx.Amount > 3 * (totalAmount / count))
            anomalous = true;

        // Rule 2: More than 3 transactions in 5 minutes
        while (window.Count > 0 && (tx.Timestamp - window.Peek()).TotalMinutes > 5)
            window.Dequeue();

        if (window.Count >= 3)
            anomalous = true;

        if (anomalous) flagged.Add(tx);

        totalAmount += tx.Amount;
        count++;
        window.Enqueue(tx.Timestamp);
    }
    return flagged;
}
```

**Time:** O(n)
**Space:** O(n) for the window (bounded by transactions in 5-min window)

---

## Question 6 — LRU Cache

> "Implement a Least Recently Used cache with O(1) get and put."

### Why This Is Asked
Caching is fundamental to fintech systems — exchange rates, user sessions, card states all use LRU-style caches.

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

---

## Tips for Coding Interviews at Fintech Companies

1. **Use domain language** — say "transaction", "ledger entry", "settlement" not just "item" or "element"
2. **Think about money carefully** — use integers (pence/cents), never floats
3. **Consider concurrency** — "What if two requests hit this at the same time?"
4. **Mention idempotency** — retries are common in distributed payment systems
5. **Edge cases that matter in fintech:**
   - Zero-amount transactions
   - Negative amounts (refunds)
   - Timezone handling
   - Currency precision differences (JPY has no minor units)
   - Overflow on large aggregations
