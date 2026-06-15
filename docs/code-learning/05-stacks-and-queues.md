# 05 — Stacks & Queues

Two fundamental data structures with very different personalities. Understanding them unlocks a huge category of problems.

---

## Core Concepts

### Stack — Last In, First Out (LIFO)
Like a stack of plates. You can only add or remove from the **top**.

```
Push 1 → [1]
Push 2 → [1, 2]
Push 3 → [1, 2, 3]
Pop    → [1, 2]  (returns 3)
Peek   → 2       (doesn't remove)
```

**C# types:** `Stack<T>` (use `Push`, `Pop`, `Peek`, `Count`)

**Use for:**
- Matching brackets/parentheses
- Undo/redo operations
- Depth-First Search (DFS)
- "Most recent" tracking

### Queue — First In, First Out (FIFO)
Like a queue at a shop. You add to the back, remove from the front.

**C# types:** `Queue<T>` (use `Enqueue`, `Dequeue`, `Peek`, `Count`)

**Use for:**
- Breadth-First Search (BFS)
- Processing items in order
- Sliding window maximum (with `Deque`/`LinkedList`)

---

## Patterns with Code

### Stack: Matching brackets
```csharp
bool IsBalanced(string s)
{
    var stack = new Stack<char>();
    foreach (char c in s)
    {
        if (c == '(' || c == '[' || c == '{')
            stack.Push(c);
        else
        {
            if (stack.Count == 0) return false;
            char top = stack.Pop();
            if ((c == ')' && top != '(') ||
                (c == ']' && top != '[') ||
                (c == '}' && top != '{'))
                return false;
        }
    }
    return stack.Count == 0;  // everything must be matched
}
```

### Stack: Monotonic stack (next greater element)
A monotonic stack keeps elements in sorted order. Useful for "next greater/smaller" problems.
```csharp
// For each element, find the next element that is greater
int[] NextGreaterElement(int[] nums)
{
    int n = nums.Length;
    int[] result = new int[n];
    Array.Fill(result, -1);  // default: no greater element
    var stack = new Stack<int>(); // stores indices

    for (int i = 0; i < n; i++)
    {
        // While current element is greater than element at stack top → that's the answer for the top
        while (stack.Count > 0 && nums[i] > nums[stack.Peek()])
        {
            int idx = stack.Pop();
            result[idx] = nums[i];
        }
        stack.Push(i);
    }
    return result;
}
```

### Queue: BFS level-by-level
```csharp
void BfsExample(TreeNode root)
{
    var queue = new Queue<TreeNode>();
    queue.Enqueue(root);

    while (queue.Count > 0)
    {
        int levelSize = queue.Count; // number of nodes at this level
        for (int i = 0; i < levelSize; i++)
        {
            TreeNode node = queue.Dequeue();
            // process node...
            if (node.left  != null) queue.Enqueue(node.left);
            if (node.right != null) queue.Enqueue(node.right);
        }
    }
}
```

---

## Practice Problems

---

### Problem 1 — Valid Parentheses (LeetCode #20)
**Task:** Given a string of brackets `()[]{}`, determine if it is valid (every open bracket has a matching close bracket in the right order).

**Example:** `"()[]{}"` → `true`, `"([)]"` → `false`

**Solution:**
```csharp
bool IsValid(string s)
{
    var stack = new Stack<char>();
    var pairs = new Dictionary<char, char>
    {
        { ')', '(' },
        { ']', '[' },
        { '}', '{' }
    };

    foreach (char c in s)
    {
        if (!pairs.ContainsKey(c))
        {
            stack.Push(c);          // it's an opening bracket
        }
        else
        {
            if (stack.Count == 0 || stack.Pop() != pairs[c])
                return false;       // no match
        }
    }
    return stack.Count == 0;        // everything matched
}
```
```python
def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c not in pairs:
            stack.append(c)
        else:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
    return len(stack) == 0
```
⏱ Time: O(n) | Space: O(n)

---

### Problem 2 — Min Stack (LeetCode #155)
**Task:** Design a stack that supports `push`, `pop`, `top`, and `getMin` — all in O(1) time.

**Key insight:** Maintain a *second* stack that only records the minimum at each state.

**Solution:**
```csharp
public class MinStack
{
    private Stack<int> stack    = new();
    private Stack<int> minStack = new();  // tracks running minimum

    public void Push(int val)
    {
        stack.Push(val);
        int newMin = minStack.Count == 0 ? val : Math.Min(val, minStack.Peek());
        minStack.Push(newMin);
    }

    public void Pop()
    {
        stack.Pop();
        minStack.Pop();
    }

    public int Top()    => stack.Peek();
    public int GetMin() => minStack.Peek();
}
```
```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val):
        self.stack.append(val)
        min_val = val if not self.min_stack else min(val, self.min_stack[-1])
        self.min_stack.append(min_val)

    def pop(self):
        self.stack.pop()
        self.min_stack.pop()

    def top(self):    return self.stack[-1]
    def get_min(self): return self.min_stack[-1]
```
⏱ All operations O(1)

---

### Problem 3 — Implement Queue using Stacks (LeetCode #232)
**Task:** Implement a queue using only stack operations.

**Key insight:** Use two stacks. `inbox` receives pushes; `outbox` serves pops. When `outbox` is empty, pour everything from `inbox` into it — this reverses the order to give FIFO behaviour.

**Solution:**
```csharp
public class MyQueue
{
    private Stack<int> inbox   = new();
    private Stack<int> outbox  = new();

    public void Push(int x) => inbox.Push(x);

    public int Pop()
    {
        Transfer();
        return outbox.Pop();
    }

    public int Peek()
    {
        Transfer();
        return outbox.Peek();
    }

    public bool Empty() => inbox.Count == 0 && outbox.Count == 0;

    private void Transfer()
    {
        if (outbox.Count == 0)
            while (inbox.Count > 0)
                outbox.Push(inbox.Pop());
    }
}
```
⏱ Amortised O(1) per operation

---

### Problem 4 — Daily Temperatures (LeetCode #739)
**Task:** For each day, find how many days you have to wait until a warmer temperature. Return 0 if there is no warmer day.

**Example:** `[73,74,75,71,69,72,76,73]` → `[1,1,4,2,1,1,0,0]`

**Solution (monotonic stack):**
```csharp
int[] DailyTemperatures(int[] temperatures)
{
    int n = temperatures.Length;
    int[] result = new int[n];
    var stack = new Stack<int>(); // stores indices of "unresolved" days

    for (int i = 0; i < n; i++)
    {
        while (stack.Count > 0 && temperatures[i] > temperatures[stack.Peek()])
        {
            int prevDay = stack.Pop();
            result[prevDay] = i - prevDay;  // days waited
        }
        stack.Push(i);
    }
    return result;
}
```
```python
def daily_temperatures(temperatures):
    result = [0] * len(temperatures)
    stack = []  # indices
    for i, t in enumerate(temperatures):
        while stack and t > temperatures[stack[-1]]:
            prev = stack.pop()
            result[prev] = i - prev
        stack.append(i)
    return result
```
⏱ Time: O(n) | Space: O(n)

---

## Common Mistakes

- **Stack empty check** — always check `stack.Count > 0` (C#) or `stack` (Python truthy) before `Pop`/`Peek`.
- **Using a list as a stack in C#** — prefer `Stack<T>` for clarity and semantics.
- **LIFO vs FIFO confusion** — if order of processing matters, pause and ask: do I want the *most recent* (stack) or the *oldest* (queue)?

---

## LeetCode Problems to Try Now

- #20 — Valid Parentheses ⭐
- #155 — Min Stack ⭐
- #232 — Implement Queue using Stacks
- #739 — Daily Temperatures
- #496 — Next Greater Element I
