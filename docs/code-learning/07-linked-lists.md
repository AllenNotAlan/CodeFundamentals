# 07 — Linked Lists

A linked list is a chain of nodes, each holding a value and a pointer to the next node. Unlike arrays, there's **no index-based access** — you must traverse from the head.

---

## Core Concepts

```
head
 |
[1] → [2] → [3] → [4] → null
```

Each node:
```csharp
public class ListNode
{
    public int val;      // 1. The data stored in this node
    public ListNode next; // 2. Reference to the next node in the chain (null if last)

    public ListNode(int val = 0, ListNode next = null)
    {
        this.val  = val;
        this.next = next;
    }
}
```

### Trade-offs vs Arrays

| Operation | Array | Linked List |
|-----------|-------|-------------|
| Access by index | O(1) | O(n) |
| Insert at head | O(n) | O(1) |
| Insert at tail | O(1) amortised | O(n) without tail ptr |
| Delete (given node) | O(n) | O(1) if you have prev |
| Memory | Contiguous | Scattered + pointer overhead |

---

## Essential Patterns

### 1. Traversal
```csharp
// 1. Start at the beginning
ListNode curr = head;

// 2. Loop until we reach the end of the list (null)
while (curr != null)
{
    // 3. Perform an action with the current node's value
    Console.WriteLine(curr.val);
    
    // 4. Move to the next node in the chain
    curr = curr.next;
}
```

### 2. Dummy head node
Simplifies edge cases (inserting at the head, handling empty lists):
```csharp
// 1. Create a placeholder node that points to the actual head
var dummy = new ListNode(0);
dummy.next = head;

// 2. Use a pointer to build or traverse starting from before the head
ListNode curr = dummy;

// 3. Work with curr...

// 4. Return 'dummy.next' which always points to the correctly updated head
return dummy.next;  
```

### 3. Fast & slow pointers
Two pointers at different speeds — classic for cycle detection and finding the middle:
```csharp
// 1. Both pointers start at the head
ListNode slow = head, fast = head;

// 2. fast moves twice as fast as slow. 
//    Loop ends when fast reaches the end of the list.
while (fast != null && fast.next != null)
{
    // 3. slow moves 1 step
    slow = slow.next;       
    
    // 4. fast moves 2 steps
    fast = fast.next.next;  
}

// 5. When the loop ends, slow is now at the middle (or the start of the second half)
```

---

## Practice Problems

---

### Problem 1 — Reverse Linked List (LeetCode #206)
**Task:** Reverse a singly linked list.

**Example:** `1→2→3→4→5` → `5→4→3→2→1`

**Solution (iterative):**
```csharp
ListNode ReverseList(ListNode head)
{
    // 1. Initialize pointers: 'prev' starts as null (new tail)
    ListNode prev = null;
    ListNode curr = head;

    while (curr != null)
    {
        // 2. Temporary store the next node (so we don't lose the rest of the list)
        ListNode next = curr.next;  
        
        // 3. Reverse the current node's pointer to point backwards
        curr.next = prev;           
        
        // 4. Move pointers forward for the next iteration
        prev = curr;                
        curr = next;                
    }
    
    // 5. 'prev' will be pointing to the new head of the reversed list
    return prev;  
}
```
```python
def reverse_list(head):
    # 1. Start with no previous node and the current head
    prev, curr = None, head
    
    while curr:
        # 2. Keep track of the rest of the list
        next_node = curr.next
        
        # 3. Flip the pointer
        curr.next = prev
        
        # 4. Advance prev and curr
        prev = curr
        curr = next_node
        
    # 5. Return the new head
    return prev
```
⏱ Time: O(n) | Space: O(1)

**Trace through with `1→2→3`:**
```
Start:    prev=null  curr=1
Step 1:   next=2, 1→null, prev=1, curr=2
Step 2:   next=3, 2→1, prev=2, curr=3
Step 3:   next=null, 3→2, prev=3, curr=null
Return:   prev=3  →  3→2→1
```

---

### Problem 2 — Merge Two Sorted Lists (LeetCode #21)
**Task:** Merge two sorted linked lists into one sorted list.

**Example:** `1→2→4` and `1→3→4` → `1→1→2→3→4→4`

**Solution:**
```csharp
ListNode MergeTwoLists(ListNode l1, ListNode l2)
{
    // 1. Create a dummy node to act as the starting point of the new list
    var dummy = new ListNode(0);
    ListNode curr = dummy;

    // 2. Traverse both lists as long as both have nodes
    while (l1 != null && l2 != null)
    {
        // 3. Attach the smaller value to our merged list
        if (l1.val <= l2.val)
        {
            curr.next = l1;
            l1 = l1.next;
        }
        else
        {
            curr.next = l2;
            l2 = l2.next;
        }
        // 4. Move the merged list pointer forward
        curr = curr.next;
    }
    
    // 5. One list might still have nodes left; attach them to the end
    curr.next = l1 ?? l2;  
    
    // 6. Return the head of the merged list (skip the dummy)
    return dummy.next;
}
```
```python
def merge_two_lists(l1, l2):
    # 1. Placeholder node to simplify list construction
    dummy = ListNode(0)
    curr = dummy
    
    while l1 and l2:
        # 2. Compare heads and pick the smaller one
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
        
    # 3. Append the remainder of whichever list is not empty
    curr.next = l1 or l2
    
    return dummy.next
```
⏱ Time: O(n + m) | Space: O(1)

---

### Problem 3 — Linked List Cycle (LeetCode #141)
**Task:** Determine if a linked list has a cycle.

**Key insight:** Floyd's cycle detection — if fast and slow pointers ever point to the same node, there's a cycle.

**Solution:**
```csharp
bool HasCycle(ListNode head)
{
    // 1. Initialize two pointers at the head
    ListNode slow = head, fast = head;
    
    // 2. Loop as long as 'fast' can move forward 2 steps
    while (fast != null && fast.next != null)
    {
        // 3. slow moves 1 step, fast moves 2 steps
        slow = slow.next;
        fast = fast.next.next;
        
        // 4. If they meet at the same node, a cycle MUST exist
        if (slow == fast) return true;  
    }
    
    // 5. If 'fast' reaches the end, there is no cycle
    return false;  
}
```
```python
def has_cycle(head):
    # 1. Standard two-pointer approach for cycle detection
    slow = fast = head
    
    while fast and fast.next:
        # 2. Move at different speeds
        slow = slow.next
        fast = fast.next.next
        
        # 3. Meeting point found
        if slow is fast:
            return True
            
    # 4. Reached end of list
    return False
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 4 — Remove Nth Node From End (LeetCode #19)
**Task:** Remove the nth node from the end of the list in one pass.

**Example:** `1→2→3→4→5`, `n=2` → `1→2→3→5`

**Key insight:** Use two pointers separated by n steps. When fast reaches the end, slow is just before the node to remove.

**Solution:**
```csharp
ListNode RemoveNthFromEnd(ListNode head, int n)
{
    // 1. Create a dummy node pointing to the head. 
    //    This handles the edge case of removing the head itself.
    var dummy = new ListNode(0, head);
    ListNode fast = dummy, slow = dummy;

    // 2. Advance 'fast' pointer so that there are 'n' nodes between 'slow' and 'fast'
    for (int i = 0; i <= n; i++)
    {
        fast = fast.next;
    }

    // 3. Move both pointers at the same speed. 
    //    When 'fast' hits null, 'slow' is exactly one node BEFORE the target.
    while (fast != null)
    {
        slow = slow.next;
        fast = fast.next;
    }

    // 4. Skip the target node by updating the 'next' reference
    slow.next = slow.next.next;  
    
    // 5. Return the start of the list
    return dummy.next;
}
```
```python
def remove_nth_from_end(head, n):
    # 1. Use a dummy node to simplify head removal
    dummy = ListNode(0, head)
    fast = slow = dummy
    
    # 2. Create the 'n' node gap
    for _ in range(n + 1):
        fast = fast.next
        
    # 3. Maintain the gap until fast reaches the end
    while fast:
        slow = slow.next
        fast = fast.next
        
    # 4. Remove the node
    slow.next = slow.next.next
    
    return dummy.next
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 5 — Middle of the Linked List (LeetCode #876)
**Task:** Return the middle node of a linked list. If two middles, return the second.

**Example:** `1→2→3→4→5` → node `3`; `1→2→3→4` → node `3`

**Solution:**
```csharp
ListNode MiddleNode(ListNode head)
{
    // 1. Initialize two pointers at the head
    ListNode slow = head, fast = head;
    
    // 2. Move 'fast' twice as fast as 'slow'
    while (fast != null && fast.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    // 3. When 'fast' reaches the end, 'slow' is at the middle node
    return slow;
}
```
⏱ Time: O(n) | Space: O(1)

---

## Common Mistakes

- **Losing your reference:** always save `curr.next` before reassigning `curr.next`.
- **Not using a dummy node:** makes inserting at the head or deleting the head much cleaner.
- **NullReferenceException:** check `node != null` before accessing `node.next`.
- **Off-by-one in "n steps ahead":** trace through a small example by hand first.

---

## LeetCode Problems to Try Now

- #206 — Reverse Linked List ⭐
- #21 — Merge Two Sorted Lists ⭐
- #141 — Linked List Cycle ⭐
- #876 — Middle of the Linked List
- #19 — Remove Nth Node From End of List
