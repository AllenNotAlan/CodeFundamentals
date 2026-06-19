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
    // 1. Initialize a stack to keep track of opening brackets
    var stack = new Stack<char>();

    foreach (char c in s)
    {
        // 2. If it's an opening bracket, push it onto the stack to be matched later
        if (c == '(' || c == '[' || c == '{')
        {
            stack.Push(c);
        }
        else
        {
            // 3. If we find a closing bracket but the stack is empty, it's unbalanced
            if (stack.Count == 0) return false;

            // 4. Pop the most recent opening bracket to check for a match
            char top = stack.Pop();

            // 5. If the current closing bracket doesn't match the popped opening bracket, fail
            if ((c == ')' && top != '(') ||
                (c == ']' && top != '[') ||
                (c == '}' && top != '{'))
            {
                return false;
            }
        }
    }

    // 6. If the stack is empty, every bracket was correctly matched
    return stack.Count == 0;
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
    
    // 1. Initialize result with -1 as the default (meaning "no greater element found")
    Array.Fill(result, -1);
    
    // 2. Use a stack to store indices of elements we haven't found a greater match for yet
    var stack = new Stack<int>();

    for (int i = 0; i < n; i++)
    {
        // 3. While the current number is greater than the number at the index on top of the stack:
        //    - We found the "next greater" element for the top index!
        while (stack.Count > 0 && nums[i] > nums[stack.Peek()])
        {
            int idx = stack.Pop();
            result[idx] = nums[i];
        }
        
        // 4. Push the current index onto the stack to find its match later
        stack.Push(i);
    }
    return result;
}
```

### Queue: BFS level-by-level
```csharp
void BfsExample(TreeNode root)
{
    if (root == null) return;

    // 1. Initialize a queue and add the starting node
    var queue = new Queue<TreeNode>();
    queue.Enqueue(root);

    // 2. Continue as long as there are nodes to process
    while (queue.Count > 0)
    {
        // 3. Capture the current size to process exactly one "level" at a time
        int levelSize = queue.Count; 
        
        for (int i = 0; i < levelSize; i++)
        {
            // 4. Remove the front node from the queue
            TreeNode node = queue.Dequeue();
            
            // 5. Process the node (e.g., print it, add to list)
            // process node...
            
            // 6. Enqueue children to be processed in the next level (FIFO)
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
    // 1. Initialize a stack for opening brackets
    var stack = new Stack<char>();
    
    // 2. Map closing brackets to their corresponding opening brackets
    var pairs = new Dictionary<char, char>
    {
        { ')', '(' },
        { ']', '[' },
        { '}', '{' }
    };

    foreach (char c in s)
    {
        // 3. If the character is not a key in 'pairs', it's an opening bracket
        if (!pairs.ContainsKey(c))
        {
            stack.Push(c);
        }
        else
        {
            // 4. If it's a closing bracket:
            //    - The stack must not be empty
            //    - The popped opening bracket must match the current closing bracket
            if (stack.Count == 0 || stack.Pop() != pairs[c])
                return false;
        }
    }
    
    // 5. Valid only if all opening brackets were matched and popped
    return stack.Count == 0;
}
```
```python
def is_valid(s):
    # 1. Use a list as a stack in Python (append/pop are O(1))
    stack = []
    
    # 2. Map closing brackets to opening ones for easy lookup
    pairs = {')': '(', ']': '[', '}': '{'}
    
    for c in s:
        # 3. If it's an opening bracket, push it
        if c not in pairs:
            stack.append(c)
        else:
            # 4. If it's a closing bracket, check for a valid match at the stack top
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
            
    # 5. Return True if the stack is empty (all matched)
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
    // 1. 'stack' stores all values; 'minStack' stores the minimum seen up to that point
    private Stack<int> stack    = new();
    private Stack<int> minStack = new();

    public void Push(int val)
    {
        // 2. Always push to the main stack
        stack.Push(val);
        
        // 3. Push the current minimum to 'minStack'
        //    If minStack is empty, the current value is the min.
        //    Otherwise, it's the smaller of the current value and the previous min.
        int newMin = minStack.Count == 0 ? val : Math.Min(val, minStack.Peek());
        minStack.Push(newMin);
    }

    public void Pop()
    {
        // 4. Pop from both stacks to keep them synchronized
        stack.Pop();
        minStack.Pop();
    }

    public int Top()    => stack.Peek();
    
    // 5. 'minStack.Peek()' always gives the minimum for the current stack state in O(1)
    public int GetMin() => minStack.Peek();
}
```
```python
class MinStack:
    def __init__(self):
        # 1. Initialize two lists to act as stacks
        self.stack = []
        self.min_stack = []

    def push(self, val):
        # 2. Push to main stack
        self.stack.append(val)
        
        # 3. Calculate and push the new minimum
        min_val = val if not self.min_stack else min(val, self.min_stack[-1])
        self.min_stack.append(min_val)

    def pop(self):
        # 4. Pop from both to maintain sync
        self.stack.pop()
        self.min_stack.pop()

    def top(self):    
        return self.stack[-1]
        
    def get_min(self): 
        # 5. Top of min_stack is the current minimum
        return self.min_stack[-1]
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
    // 1. Two stacks: one for incoming data, one for outgoing data
    private Stack<int> inbox   = new();
    private Stack<int> outbox  = new();

    // 2. Enqueue is always O(1) - just push to inbox
    public void Push(int x) => inbox.Push(x);

    public int Pop()
    {
        // 3. Ensure outbox has the oldest elements
        Transfer();
        return outbox.Pop();
    }

    public int Peek()
    {
        // 4. Ensure outbox has the oldest elements
        Transfer();
        return outbox.Peek();
    }

    // 5. Queue is empty only if BOTH stacks are empty
    public bool Empty() => inbox.Count == 0 && outbox.Count == 0;

    private void Transfer()
    {
        // 6. Only transfer if outbox is empty. 
        //    By popping from inbox and pushing to outbox, we reverse the LIFO order to FIFO.
        if (outbox.Count == 0)
        {
            while (inbox.Count > 0)
            {
                outbox.Push(inbox.Pop());
            }
        }
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
    
    // 1. Stack stores indices of days for which we haven't found a warmer day yet
    var stack = new Stack<int>(); 

    for (int i = 0; i < n; i++)
    {
        // 2. If current temp is warmer than the temp at the index on top of stack:
        //    We found the next warmer day for that 'prevDay'!
        while (stack.Count > 0 && temperatures[i] > temperatures[stack.Peek()])
        {
            int prevDay = stack.Pop();
            
            // 3. The number of days waited is the difference between current index and prev index
            result[prevDay] = i - prevDay;
        }
        
        // 4. Push current index to find its warmer day later
        stack.Push(i);
    }
    return result;
}
```
```python
def daily_temperatures(temperatures):
    # 1. Initialize result with 0s (default for no warmer day found)
    result = [0] * len(temperatures)
    stack = []  # stores indices
    
    for i, t in enumerate(temperatures):
        # 2. While current temp 't' is warmer than temp at stack top index
        while stack and t > temperatures[stack[-1]]:
            # 3. Resolve the day at the top of the stack
            prev = stack.pop()
            result[prev] = i - prev
            
        # 4. Push current index to stack
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
