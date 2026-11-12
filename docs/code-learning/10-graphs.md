# 10 — Graphs

A graph is just **nodes connected by edges**. That's it. A tree (chapter 08) is a special graph with no cycles and one path between any two nodes — so you already know most of this. Graphs simply drop those restrictions: there can be cycles, multiple paths, and no single "root".

> **Builds on:** recursion & DFS from [Trees & Recursion](./08-trees-and-recursion.md), and the queue-based BFS from [Stacks & Queues](./05-stacks-and-queues.md). If those are shaky, revisit them first — graph traversal is the same idea generalised.

---

## Core Concepts

### Vocabulary
- **Vertex / Node** — a thing (a person, a city, a course).
- **Edge** — a connection between two nodes.
- **Directed** — edges have a direction (A → B, like "A follows B"). **Undirected** — edges go both ways (A — B, like "A is friends with B").
- **Weighted** — edges carry a cost (distance, price). **Unweighted** — all edges equal.
- **Cycle** — a path that returns to where it started. Trees have none; general graphs can.

### How to represent a graph

**1. Adjacency List (use this 95% of the time)** — a map from each node to its neighbours. Space-efficient for sparse graphs.
```
Graph:  0 → 1        Adjacency list:
        0 → 2          0: [1, 2]
        1 → 2          1: [2]
        2 → 0          2: [0]
```

**2. Adjacency Matrix** — an `n × n` grid where `matrix[i][j] = 1` means an edge from `i` to `j`. Fast edge lookups, but `O(n²)` space — only worth it for dense graphs.

```csharp
// Building an adjacency list from an edge list
var graph = new Dictionary<int, List<int>>();
void AddEdge(int from, int to, bool undirected = true)
{
    if (!graph.ContainsKey(from)) graph[from] = new List<int>();
    graph[from].Add(to);
    if (undirected)
    {
        if (!graph.ContainsKey(to)) graph[to] = new List<int>();
        graph[to].Add(from);   // undirected = edge both ways
    }
}
```

---

## The One Rule That Separates Graphs From Trees: **visited tracking**

In a tree you never revisit a node because there are no cycles. In a graph you **must** track visited nodes or you will loop forever. Almost every graph bug is a missing or misplaced `visited` set.

```csharp
var visited = new HashSet<int>();   // the single most important line in graph code
```

---

## Patterns with Code

### Pattern 1: DFS (Depth-First Search) — go deep, then backtrack
**Task:** Starting from one node, visit every node you can reach, without looping forever on cycles.

**Example:** undirected edges `0–1`, `0–2`, `1–3`, start at `0` → visits `0, 1, 3, 2`

*(Related: Problem 1 below.)*

This is literally tree DFS from chapter 08 plus a `visited` set.

```csharp
void Dfs(int node, Dictionary<int, List<int>> graph, HashSet<int> visited)
{
    // 1. If we've already seen this node, stop — this prevents infinite loops on cycles.
    if (visited.Contains(node)) return;

    // 2. Mark as visited BEFORE exploring neighbours.
    visited.Add(node);
    Console.WriteLine(node);   // process the node

    // 3. Recurse into every neighbour.
    foreach (int neighbour in graph.GetValueOrDefault(node, new List<int>()))
        Dfs(neighbour, graph, visited);
}
```
```python
def dfs(node, graph, visited):
    # 1. Skip nodes we've already explored (handles cycles).
    if node in visited:
        return
    # 2. Mark visited before recursing.
    visited.add(node)
    print(node)  # process the node
    # 3. Explore each neighbour.
    for neighbour in graph.get(node, []):
        dfs(neighbour, graph, visited)
```
**Why use it?** Natural for "explore a whole region" problems (islands, connected components) and anything path/backtracking-flavoured. Uses the call stack, so watch recursion depth on huge graphs.

### Pattern 2: BFS (Breadth-First Search) — explore level by level
**Task:** Starting from one node, visit the others in order of distance (fewest edges first). This also gives the shortest path when every edge counts the same.

**Example:** the same edges `0–1`, `0–2`, `1–3`, start at `0` → visits `0, 1, 2, 3` (node `3` is two steps away)

*(Related: Problem 5 below.)*

This is the queue-based level-order traversal from chapter 08, generalised. **BFS finds the shortest path in an unweighted graph** because it reaches nodes in order of distance.

```csharp
void Bfs(int start, Dictionary<int, List<int>> graph)
{
    var visited = new HashSet<int> { start };
    var queue = new Queue<int>();
    queue.Enqueue(start);

    while (queue.Count > 0)
    {
        int node = queue.Dequeue();   // 1. take the next closest node
        Console.WriteLine(node);

        // 2. Add every unvisited neighbour to the back of the queue.
        foreach (int neighbour in graph.GetValueOrDefault(node, new List<int>()))
        {
            if (!visited.Contains(neighbour))
            {
                visited.Add(neighbour);   // 3. mark when ENQUEUED, not when dequeued
                queue.Enqueue(neighbour);
            }
        }
    }
}
```
```python
from collections import deque

def bfs(start, graph):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()        # 1. next closest node
        print(node)
        for neighbour in graph.get(node, []):
            if neighbour not in visited:
                visited.add(neighbour)  # 2. mark when enqueued
                queue.append(neighbour)
```
**Common bug:** marking visited when you *dequeue* instead of when you *enqueue* — that lets a node get added to the queue many times. Mark on enqueue.

### Pattern 3: Topological Sort — ordering with dependencies
**Task:** Given tasks with prerequisites, produce an order where every task comes after the tasks it depends on.

**Example:** 4 courses, where `0` must come before `1` and `2`, and both of those before `3` → `[0, 1, 2, 3]`

*(Full walkthrough: Problem 2 below.)*

For a **directed acyclic graph (DAG)**: produce an order where every node comes before the nodes that depend on it. Think "course prerequisites" or "build order". Uses BFS with in-degree counts (Kahn's algorithm).

```csharp
// Returns a valid order, or empty list if a cycle exists (impossible to order).
List<int> TopoSort(int n, Dictionary<int, List<int>> graph)
{
    var inDegree = new int[n];
    foreach (var edges in graph.Values)
        foreach (int to in edges) inDegree[to]++;   // 1. count incoming edges

    // 2. Start with every node that has no prerequisites.
    var queue = new Queue<int>();
    for (int i = 0; i < n; i++)
        if (inDegree[i] == 0) queue.Enqueue(i);

    var order = new List<int>();
    while (queue.Count > 0)
    {
        int node = queue.Dequeue();
        order.Add(node);
        // 3. "Remove" this node: any neighbour losing its last dependency becomes free.
        foreach (int next in graph.GetValueOrDefault(node, new List<int>()))
            if (--inDegree[next] == 0) queue.Enqueue(next);
    }

    // 4. If we couldn't place every node, there was a cycle.
    return order.Count == n ? order : new List<int>();
}
```
**Why use it?** Dependency resolution, task scheduling, detecting cycles in directed graphs (if you can't order all nodes, there's a cycle).

### Pattern 4: Union-Find (Disjoint Set) — grouping connected things fast
**Task:** Given pairs of items that are connected, count how many separate groups there are.

**Example:** 5 nodes with connections `0–1`, `1–2`, `3–4` → `2` groups: `{0, 1, 2}` and `{3, 4}`

*(Related: Problem 4 below.)*

Tracks which nodes belong to the same group, with near-`O(1)` merges and lookups. Great for "how many groups?" and cycle detection in undirected graphs.

```csharp
public class UnionFind
{
    private readonly int[] parent;
    public UnionFind(int n)
    {
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;   // each node starts in its own group
    }

    // Find the "representative" of a node's group, compressing the path as we go.
    public int Find(int x)
    {
        if (parent[x] != x) parent[x] = Find(parent[x]);  // path compression
        return parent[x];
    }

    // Merge two groups. Returns false if they were already joined (i.e. a cycle).
    public bool Union(int a, int b)
    {
        int rootA = Find(a), rootB = Find(b);
        if (rootA == rootB) return false;
        parent[rootA] = rootB;
        return true;
    }
}
```
**Why use it?** When the question is about connectivity/grouping rather than paths — "number of provinces", "redundant connection", "accounts merge".

---

## Practice Problems

---

### Problem 1 — Number of Islands (LeetCode #200)
**Task:** Given a grid of `'1'` (land) and `'0'` (water), count the islands (groups of land connected horizontally/vertically).

**Example:**
```
1 1 0 0
1 0 0 1
0 0 1 1
```
→ `3`

**Think first:** A grid *is* a graph — each cell is a node, neighbours are up/down/left/right. Each time you find unvisited land, flood-fill the whole island with DFS and count one.

**Solution:**
```csharp
int NumIslands(char[][] grid)
{
    if (grid.Length == 0) return 0;
    int rows = grid.Length, cols = grid[0].Length, count = 0;

    void Sink(int r, int c)
    {
        // 1. Stop if out of bounds or on water.
        if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == '0') return;
        // 2. Mark this land visited by sinking it (avoids a separate visited set).
        grid[r][c] = '0';
        // 3. Flood the four neighbours.
        Sink(r + 1, c); Sink(r - 1, c); Sink(r, c + 1); Sink(r, c - 1);
    }

    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (grid[r][c] == '1')
            {
                count++;      // 4. found a new island
                Sink(r, c);   //    then erase all of it
            }
    return count;
}
```
```python
def num_islands(grid):
    if not grid:
        return 0
    rows, cols, count = len(grid), len(grid[0]), 0

    def sink(r, c):
        # 1. Out of bounds or water → stop.
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == '0':
            return
        grid[r][c] = '0'                       # 2. mark visited
        sink(r + 1, c); sink(r - 1, c)         # 3. flood neighbours
        sink(r, c + 1); sink(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1                      # 4. new island
                sink(r, c)
    return count
```
⏱ Time: O(rows × cols) | Space: O(rows × cols) worst case (recursion depth)

---

### Problem 2 — Course Schedule (LeetCode #207)
**Task:** Given `numCourses` and prerequisite pairs `[a, b]` ("to take `a` you must first take `b`"), return whether you can finish all courses.

**Example:** `numCourses = 2`, `[[1, 0]]` → `true`; `[[1, 0], [0, 1]]` → `false` (circular).

**Key insight:** This is cycle detection on a directed graph — equivalently, "does a topological order exist?". If topo sort places every course, there's no cycle.

**Solution:**
```csharp
bool CanFinish(int numCourses, int[][] prerequisites)
{
    var graph = new Dictionary<int, List<int>>();
    var inDegree = new int[numCourses];

    // 1. Build graph: edge b → a means "b unlocks a". Count in-degrees.
    foreach (var pair in prerequisites)
    {
        int course = pair[0], prereq = pair[1];
        if (!graph.ContainsKey(prereq)) graph[prereq] = new List<int>();
        graph[prereq].Add(course);
        inDegree[course]++;
    }

    // 2. Queue up courses with no prerequisites.
    var queue = new Queue<int>();
    for (int i = 0; i < numCourses; i++)
        if (inDegree[i] == 0) queue.Enqueue(i);

    // 3. Peel off courses in dependency order, counting how many we complete.
    int completed = 0;
    while (queue.Count > 0)
    {
        int course = queue.Dequeue();
        completed++;
        foreach (int next in graph.GetValueOrDefault(course, new List<int>()))
            if (--inDegree[next] == 0) queue.Enqueue(next);
    }

    // 4. If we completed all of them, no cycle existed.
    return completed == numCourses;
}
```
```python
from collections import deque

def can_finish(num_courses, prerequisites):
    graph = {i: [] for i in range(num_courses)}
    in_degree = [0] * num_courses

    # 1. Build graph + in-degrees.
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1

    # 2. Start from courses with no prerequisites.
    queue = deque(i for i in range(num_courses) if in_degree[i] == 0)

    # 3. Topologically peel courses off.
    completed = 0
    while queue:
        course = queue.popleft()
        completed += 1
        for nxt in graph[course]:
            in_degree[nxt] -= 1
            if in_degree[nxt] == 0:
                queue.append(nxt)

    # 4. All placed → no cycle.
    return completed == num_courses
```
⏱ Time: O(V + E) | Space: O(V + E)

---

### Problem 3 — Clone Graph (LeetCode #133)
**Task:** Deep-copy a connected undirected graph. Each node has a value and a list of neighbours.

**Key insight:** As you traverse, keep a map from `original node → its clone`. When you meet a node again (cycles!), return the existing clone instead of cloning forever.

**Solution:**
```csharp
public class Node
{
    public int val;
    public IList<Node> neighbors = new List<Node>();
    public Node(int v) { val = v; }
}

Node CloneGraph(Node node)
{
    if (node == null) return null;
    var clones = new Dictionary<Node, Node>();

    Node Dfs(Node cur)
    {
        // 1. Already cloned? Return the existing copy (this breaks cycles).
        if (clones.TryGetValue(cur, out var existing)) return existing;

        // 2. Create the clone and record it BEFORE recursing into neighbours.
        var copy = new Node(cur.val);
        clones[cur] = copy;

        // 3. Clone each neighbour and wire it up.
        foreach (var nb in cur.neighbors)
            copy.neighbors.Add(Dfs(nb));

        return copy;
    }

    return Dfs(node);
}
```
```python
def clone_graph(node):
    if not node:
        return None
    clones = {}

    def dfs(cur):
        # 1. Return existing clone if seen (handles cycles).
        if cur in clones:
            return clones[cur]
        # 2. Create and register the clone before recursing.
        copy = Node(cur.val)
        clones[cur] = copy
        # 3. Clone and attach neighbours.
        for nb in cur.neighbors:
            copy.neighbors.append(dfs(nb))
        return copy

    return dfs(node)
```
⏱ Time: O(V + E) | Space: O(V)

---

### Problem 4 — Number of Provinces (LeetCode #547)
**Task:** `isConnected[i][j] = 1` if city `i` and `j` are directly connected. Return the number of provinces (groups of directly or indirectly connected cities).

**Example:** `[[1,1,0],[1,1,0],[0,0,1]]` → `2`

**Key insight:** Pure connectivity question → Union-Find. Union every connected pair, then count distinct groups.

**Solution:**
```csharp
int FindCircleNum(int[][] isConnected)
{
    int n = isConnected.Length;
    var uf = new UnionFind(n);   // from Pattern 4 above

    // 1. Union every directly connected pair (upper triangle is enough).
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (isConnected[i][j] == 1) uf.Union(i, j);

    // 2. Count distinct roots = number of groups.
    int provinces = 0;
    for (int i = 0; i < n; i++)
        if (uf.Find(i) == i) provinces++;
    return provinces;
}
```
```python
def find_circle_num(is_connected):
    n = len(is_connected)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path compression
            x = parent[x]
        return x

    def union(a, b):
        parent[find(a)] = find(b)

    # 1. Union every connected pair.
    for i in range(n):
        for j in range(i + 1, n):
            if is_connected[i][j] == 1:
                union(i, j)

    # 2. Count distinct roots.
    return sum(1 for i in range(n) if find(i) == i)
```
⏱ Time: O(n² · α(n)) | Space: O(n) — α is the near-constant inverse-Ackermann factor

---

### Problem 5 — Rotting Oranges (LeetCode #994)
**Task:** In a grid, `2` = rotten orange, `1` = fresh, `0` = empty. Each minute, rotten oranges rot their 4-directional fresh neighbours. Return the minutes until none are fresh, or `-1` if impossible.

**Key insight:** "Spreads outward one layer per minute" = **multi-source BFS**. Seed the queue with *all* rotten oranges at once; each BFS level is one minute.

**Solution:**
```csharp
int OrangesRotting(int[][] grid)
{
    int rows = grid.Length, cols = grid[0].Length, fresh = 0;
    var queue = new Queue<(int r, int c)>();

    // 1. Seed queue with every rotten orange; count fresh ones.
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (grid[r][c] == 2) queue.Enqueue((r, c));
            else if (grid[r][c] == 1) fresh++;

    int minutes = 0;
    int[][] dirs = { new[]{1,0}, new[]{-1,0}, new[]{0,1}, new[]{0,-1} };

    // 2. BFS one level (minute) at a time, but only count minutes while work happens.
    while (queue.Count > 0 && fresh > 0)
    {
        minutes++;
        int size = queue.Count;
        for (int i = 0; i < size; i++)
        {
            var (r, c) = queue.Dequeue();
            foreach (var d in dirs)
            {
                int nr = r + d[0], nc = c + d[1];
                if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] == 1)
                {
                    grid[nr][nc] = 2;   // 3. rot it, mark visited
                    fresh--;
                    queue.Enqueue((nr, nc));
                }
            }
        }
    }

    // 4. If any fresh remain unreachable, it's impossible.
    return fresh == 0 ? minutes : -1;
}
```
```python
from collections import deque

def oranges_rotting(grid):
    rows, cols, fresh = len(grid), len(grid[0]), 0
    queue = deque()

    # 1. Seed all rotten; count fresh.
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]

    # 2. Level-by-level BFS = minute-by-minute spread.
    while queue and fresh > 0:
        minutes += 1
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2        # 3. rot + mark
                    fresh -= 1
                    queue.append((nr, nc))

    # 4. Unreachable fresh oranges → impossible.
    return minutes if fresh == 0 else -1
```
⏱ Time: O(rows × cols) | Space: O(rows × cols)

---

## Choosing Your Graph Tool

| The question asks about… | Reach for | Why |
|--------------------------|-----------|-----|
| Shortest path (unweighted) | **BFS** | Reaches nodes in distance order |
| Explore/flood a whole region | **DFS** | Simple recursion; natural for "fill this area" |
| Ordering with dependencies | **Topological sort** | Produces a valid prerequisite order |
| "How many groups?" / connectivity | **Union-Find** | Near-O(1) merge & group count |
| Shortest path (weighted) | **Dijkstra** (see below) | BFS ignores edge costs; Dijkstra uses a min-heap to always expand the cheapest frontier |

---

## Weighted shortest path — Dijkstra (stepping beyond BFS)

BFS finds the fewest *edges*, which is the shortest path only when every edge costs the same. The moment edges have **weights** (distances, fares, latencies), BFS is wrong — a 2-hop path can cost more than a 5-hop one. Dijkstra fixes this by always expanding the **cheapest-so-far** node next, using a min-heap (priority queue — see [11 — Heaps & Priority Queues](./11-heaps-priority-queues.md)).

> **Intuition:** it's BFS where the queue is replaced by a priority queue keyed on total distance. You pop the closest unfinalised node, relax its neighbours (try to improve their best-known distance), and repeat. Once popped, a node's distance is final — because any later path to it would have to go through something even further away. (This is why Dijkstra needs **non-negative** weights.)

```csharp
// Shortest distances from `src` over a weighted graph.
// graph[u] = list of (neighbour, weight).
int[] Dijkstra(List<(int to, int w)>[] graph, int src)
{
    int n = graph.Length;
    var dist = new int[n];
    Array.Fill(dist, int.MaxValue);
    dist[src] = 0;

    // Min-heap ordered by distance: (distance, node).
    var pq = new PriorityQueue<int, int>();
    pq.Enqueue(src, 0);

    while (pq.TryDequeue(out int u, out int d))
    {
        if (d > dist[u]) continue;            // stale entry — already found better
        foreach (var (v, w) in graph[u])
        {
            int nd = d + w;
            if (nd < dist[v])                 // relaxation: found a cheaper route to v
            {
                dist[v] = nd;
                pq.Enqueue(v, nd);
            }
        }
    }
    return dist;
}
```
```python
import heapq

def dijkstra(graph, src):            # graph[u] = list of (v, w)
    n = len(graph)
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]                  # (distance, node)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:              # stale entry
            continue
        for v, w in graph[u]:
            nd = d + w
            if nd < dist[v]:         # relaxation
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist
```
⏱ Time: O((V + E) log V) | Space: O(V)

**When to reach for it:** "shortest/cheapest/fastest path" with **weighted** edges and **no negative weights** (e.g. network routing, cheapest flight within K stops, minimum effort path on a grid). If weights can be negative, Dijkstra breaks — that's Bellman-Ford territory, which is beyond this chapter. If the graph is unweighted, don't over-engineer: plain BFS is both simpler and faster.

**Try it on:** #743 (Network Delay Time), #1631 (Path With Minimum Effort), #787 (Cheapest Flights Within K Stops).

---

## Common Mistakes

- **No `visited` set** — the #1 graph bug. Without it, any cycle loops forever.
- **Marking visited too late in BFS** — mark on *enqueue*, not dequeue, or nodes get queued multiple times.
- **Forgetting grids are graphs** — many "grid" problems are just BFS/DFS with 4-directional neighbours.
- **Wrong edge direction** — in directed graphs, double-check which way the edge points (prerequisite vs unlocks).
- **Blowing the stack** — deep DFS recursion can overflow on huge graphs; switch to an explicit stack or BFS.

---

## LeetCode Problems to Try Now

- #200 — Number of Islands ⭐ (DFS/BFS flood fill)
- #994 — Rotting Oranges ⭐ (multi-source BFS)
- #207 — Course Schedule ⭐⭐ (topological sort / cycle detection)
- #133 — Clone Graph ⭐⭐ (DFS + visited map)
- #547 — Number of Provinces (Union-Find)
- #417 — Pacific Atlantic Water Flow (DFS from borders)
- #684 — Redundant Connection (Union-Find cycle detection)
- #743 — Network Delay Time ⭐⭐ (Dijkstra, weighted shortest path)
- #1631 — Path With Minimum Effort ⭐⭐ (Dijkstra on a grid)
