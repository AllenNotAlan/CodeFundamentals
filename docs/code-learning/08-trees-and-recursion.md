# 08 — Trees & Recursion

Trees appear constantly in interviews. Mastering tree traversal also teaches you recursion — which is the skill behind many other patterns.

---

## Core Concepts

### Binary Tree Node
```csharp
public class TreeNode
{
    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode(int val = 0, TreeNode left = null, TreeNode right = null)
    {
        this.val   = val;
        this.left  = left;
        this.right = right;
    }
}
```

### Tree vocabulary
```
        1          ← root (depth 0)
       / \
      2   3        ← depth 1
     / \
    4   5          ← depth 2 (leaves)
```
- **Root** — topmost node
- **Leaf** — node with no children
- **Height** — longest path from root to any leaf
- **Depth** — distance from root to a node
- **BST (Binary Search Tree)** — left subtree < node < right subtree

---

## Recursion Fundamentals

Recursion = a function calling itself with a simpler input until it hits a **base case**.

**The three questions to ask for any recursive function:**
1. **Base case:** what's the simplest input I can handle directly?
2. **Recursive case:** how do I reduce the problem and call myself?
3. **Return:** what do I return upward to the caller?

```csharp
// Example: sum all numbers 1..n
int Sum(int n)
{
    if (n == 0) return 0;         // 1. base case
    return n + Sum(n - 1);        // 2+3. recursive case + return
}
// Sum(3) = 3 + Sum(2)
//              = 2 + Sum(1)
//                   = 1 + Sum(0)
//                        = 0
// = 3 + 2 + 1 + 0 = 6
```

---

## Tree Traversals

### Depth-First Search (DFS) — three orders

```
    1
   / \
  2   3
 / \
4   5
```

| Order | Sequence | Rule |
|-------|----------|------|
| Inorder | 4,2,5,1,3 | Left → Node → Right |
| Preorder | 1,2,4,5,3 | Node → Left → Right |
| Postorder | 4,5,2,3,1 | Left → Right → Node |

```csharp
// Inorder (gives sorted order in a BST)
void Inorder(TreeNode node)
{
    if (node == null) return;
    Inorder(node.left);
    Console.Write(node.val + " ");
    Inorder(node.right);
}

// Preorder
void Preorder(TreeNode node)
{
    if (node == null) return;
    Console.Write(node.val + " ");
    Preorder(node.left);
    Preorder(node.right);
}
```

### Breadth-First Search (BFS) — level order

Process nodes level by level using a queue:
```csharp
IList<IList<int>> LevelOrder(TreeNode root)
{
    var result = new List<IList<int>>();
    if (root == null) return result;

    var queue = new Queue<TreeNode>();
    queue.Enqueue(root);

    while (queue.Count > 0)
    {
        int levelSize = queue.Count;
        var level = new List<int>();

        for (int i = 0; i < levelSize; i++)
        {
            TreeNode node = queue.Dequeue();
            level.Add(node.val);
            if (node.left  != null) queue.Enqueue(node.left);
            if (node.right != null) queue.Enqueue(node.right);
        }
        result.Add(level);
    }
    return result;
}
```

---

## Practice Problems

---

### Problem 1 — Maximum Depth of Binary Tree (LeetCode #104)
**Task:** Return the maximum depth (height) of a binary tree.

**Example:**
```
    3
   / \
  9  20
    /  \
   15   7
```
→ `3`

**Solution:**
```csharp
int MaxDepth(TreeNode root)
{
    if (root == null) return 0;                              // base case
    int leftDepth  = MaxDepth(root.left);
    int rightDepth = MaxDepth(root.right);
    return 1 + Math.Max(leftDepth, rightDepth);             // this node + deeper subtree
}
```
```python
def max_depth(root):
    if not root: return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
```
⏱ Time: O(n) | Space: O(h) where h = height (O(log n) balanced, O(n) worst)

---

### Problem 2 — Symmetric Tree (LeetCode #101)
**Task:** Check whether a binary tree is a mirror of itself.

**Example:** `[1,2,2,3,4,4,3]` → `true`

**Key insight:** A tree is symmetric if the left subtree is a mirror of the right subtree.

**Solution:**
```csharp
bool IsSymmetric(TreeNode root)
{
    return IsMirror(root?.left, root?.right);
}

bool IsMirror(TreeNode left, TreeNode right)
{
    if (left == null && right == null) return true;   // both empty: symmetric
    if (left == null || right == null) return false;  // one empty: not symmetric
    return left.val == right.val
        && IsMirror(left.left,  right.right)          // outer pair
        && IsMirror(left.right, right.left);           // inner pair
}
```
```python
def is_symmetric(root):
    def is_mirror(left, right):
        if not left and not right: return True
        if not left or not right:  return False
        return (left.val == right.val
                and is_mirror(left.left,  right.right)
                and is_mirror(left.right, right.left))
    return is_mirror(root.left, root.right)
```
⏱ Time: O(n) | Space: O(h)

---

### Problem 3 — Path Sum (LeetCode #112)
**Task:** Return true if there is a root-to-leaf path such that all values sum to the target.

**Example:** `target = 22`, tree below → `true` (path 5→4→11→2)
```
        5
       / \
      4   8
     /   / \
    11  13   4
   /  \       \
  7    2       1
```

**Solution:**
```csharp
bool HasPathSum(TreeNode root, int targetSum)
{
    if (root == null) return false;

    // Subtract current node's value
    int remaining = targetSum - root.val;

    // If it's a leaf, check if we've hit exactly 0
    if (root.left == null && root.right == null)
        return remaining == 0;

    // Otherwise, check either subtree
    return HasPathSum(root.left, remaining) || HasPathSum(root.right, remaining);
}
```
```python
def has_path_sum(root, target_sum):
    if not root: return False
    remaining = target_sum - root.val
    if not root.left and not root.right:
        return remaining == 0
    return has_path_sum(root.left, remaining) or has_path_sum(root.right, remaining)
```
⏱ Time: O(n) | Space: O(h)

---

### Problem 4 — Validate Binary Search Tree (LeetCode #98)
**Task:** Determine if a binary tree is a valid BST.

**Key insight:** Don't just check each node against its direct children — pass down valid min/max bounds.

**Solution:**
```csharp
bool IsValidBST(TreeNode root)
{
    return Validate(root, long.MinValue, long.MaxValue);
}

bool Validate(TreeNode node, long min, long max)
{
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return Validate(node.left,  min,       node.val) &&
           Validate(node.right, node.val,  max);
}
```
```python
def is_valid_bst(root):
    def validate(node, min_val, max_val):
        if not node: return True
        if node.val <= min_val or node.val >= max_val: return False
        return (validate(node.left,  min_val,   node.val) and
                validate(node.right, node.val,  max_val))
    return validate(root, float('-inf'), float('inf'))
```
⏱ Time: O(n) | Space: O(h)

---

## The Recursion Mental Model

When writing a recursive tree function, think from the **perspective of a single node**:

> *"Given this node, what should I return? I can ask my left child and right child for the same thing."*

```
MaxDepth(node):
  "My depth is 1 + the max depth of my children."
  Ask left child:  leftDepth  = MaxDepth(node.left)
  Ask right child: rightDepth = MaxDepth(node.right)
  Return: 1 + max(leftDepth, rightDepth)
```

You don't need to think about the whole tree — just what *this node* does with what its children return.

---

## Common Mistakes

- **Forgetting the base case** (`if (root == null) return ...`) — this causes NullReferenceException.
- **Returning the wrong type from null check** — make sure null returns a value consistent with non-null returns (0, true, false, etc.).
- **Assuming BST just needs parent comparison** — always pass bounds down.

---

## LeetCode Problems to Try Now

- #104 — Maximum Depth of Binary Tree ⭐
- #101 — Symmetric Tree ⭐
- #112 — Path Sum
- #98 — Validate Binary Search Tree
- #102 — Binary Tree Level Order Traversal
- #226 — Invert Binary Tree (classic)
