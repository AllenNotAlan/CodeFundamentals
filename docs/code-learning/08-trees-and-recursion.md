# 08 — Trees & Recursion

Trees appear constantly in interviews. Mastering tree traversal also teaches you recursion — which is the skill behind many other patterns.

---

## Core Concepts

### Binary Tree Node
```csharp
public class TreeNode
{
    public int val;        // 1. The value stored in this node
    public TreeNode left;  // 2. Reference to the left child (null if none)
    public TreeNode right; // 3. Reference to the right child (null if none)
    
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
    // 1. Base case: The simplest sum is for 0, which is just 0.
    if (n == 0) return 0;         

    // 2. Recursive case: Sum(n) is n + the sum of all numbers smaller than n.
    // 3. Return: Combine the current 'n' with the result of the sub-problem.
    return n + Sum(n - 1);        
}
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
    // 1. Base case: If node is null, we've reached a leaf's child
    if (node == null) return;
    
    // 2. Recurse left
    Inorder(node.left);
    
    // 3. Process the current node
    Console.Write(node.val + " ");
    
    // 4. Recurse right
    Inorder(node.right);
}

// Preorder
void Preorder(TreeNode node)
{
    if (node == null) return;
    
    // 1. Process the current node FIRST
    Console.Write(node.val + " ");
    
    // 2. Then recurse left and right
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

    // 1. Initialize a queue with the root node
    var queue = new Queue<TreeNode>();
    queue.Enqueue(root);

    while (queue.Count > 0)
    {
        // 2. Get the number of nodes at the current level
        int levelSize = queue.Count;
        var level = new List<int>();

        // 3. Process exactly 'levelSize' nodes to keep levels separate
        for (int i = 0; i < levelSize; i++)
        {
            TreeNode node = queue.Dequeue();
            level.Add(node.val);
            
            // 4. Add children to the queue to be processed in the NEXT level
            if (node.left  != null) queue.Enqueue(node.left);
            if (node.right != null) queue.Enqueue(node.right);
        }
        
        // 5. Add the completed level to the result
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
    // 1. Base case: An empty tree has a depth of 0
    if (root == null) return 0;                              

    // 2. Recursive step: Find the depth of the left and right subtrees
    int leftDepth  = MaxDepth(root.left);
    int rightDepth = MaxDepth(root.right);
    
    // 3. Return: The depth of this node (1) plus the depth of the deepest subtree
    return 1 + Math.Max(leftDepth, rightDepth);             
}
```
```python
def max_depth(root):
    # 1. Base case: None nodes have 0 depth
    if not root: 
        return 0
        
    # 2. Return 1 (for this node) + the maximum depth of its children
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
    // 1. A tree is symmetric if its left and right subtrees are mirrors of each other
    return IsMirror(root?.left, root?.right);
}

bool IsMirror(TreeNode left, TreeNode right)
{
    // 2. If both nodes are null, they are mirrors (base case 1)
    if (left == null && right == null) return true;   
    
    // 3. If only one is null, they are NOT mirrors (base case 2)
    if (left == null || right == null) return false;  
    
    // 4. To be mirrors:
    //    - Their values must be equal
    //    - Left's left must mirror Right's right (outer)
    //    - Left's right must mirror Right's left (inner)
    return left.val == right.val
        && IsMirror(left.left,  right.right)          
        && IsMirror(left.right, right.left);           
}
```
```python
def is_symmetric(root):
    # Helper function to check if two subtrees are mirrors
    def is_mirror(left, right):
        # 1. Both null is a match
        if not left and not right: return True
        
        # 2. One null is a mismatch
        if not left or not right:  return False
        
        # 3. Check value equality and recurse on mirror pairs
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
    // 1. Base case: If we've reached beyond a leaf, no path exists here
    if (root == null) return false;

    // 2. Process current node: Subtract its value from the target
    int remaining = targetSum - root.val;

    // 3. If it's a leaf node, check if the remaining sum is exactly 0
    if (root.left == null && root.right == null)
    {
        return remaining == 0;
    }

    // 4. Recursive case: Check if either the left or right subtree has a valid path
    return HasPathSum(root.left, remaining) || HasPathSum(root.right, remaining);
}
```
```python
def has_path_sum(root, target_sum):
    # 1. Base case: Empty subtree
    if not root: 
        return False
        
    # 2. Subtract current node's value
    remaining = target_sum - root.val
    
    # 3. Check if we are at a leaf
    if not root.left and not root.right:
        return remaining == 0
        
    # 4. Try both paths
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
    // 1. Start validation with the full range of possible values
    return Validate(root, long.MinValue, long.MaxValue);
}

bool Validate(TreeNode node, long min, long max)
{
    // 2. Base case: An empty tree is valid
    if (node == null) return true;
    
    // 3. Validation rule: The node's value must be within the (min, max) range
    if (node.val <= min || node.val >= max) return false;
    
    // 4. Recursive step:
    //    - When going LEFT, the new MAX is the current node's value
    //    - When going RIGHT, the new MIN is the current node's value
    return Validate(node.left,  min,       node.val) &&
           Validate(node.right, node.val,  max);
}
```
```python
def is_valid_bst(root):
    def validate(node, min_val, max_val):
        # 1. Base case
        if not node: return True
        
        # 2. Check if current node violates the BST property
        if node.val <= min_val or node.val >= max_val: 
            return False
            
        # 3. Recurse down with updated constraints
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
