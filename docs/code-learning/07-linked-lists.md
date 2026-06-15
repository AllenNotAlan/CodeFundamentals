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
    public int val;
    public ListNode next;
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
ListNode curr = head;
while (curr != null)
{
    Console.WriteLine(curr.val);
    curr = curr.next;
}
```

### 2. Dummy head node
Simplifies edge cases (inserting at the head, handling empty lists):
```csharp
var dummy = new ListNode(0);
dummy.next = head;
ListNode curr = dummy;
// work with curr...
return dummy.next;  // the real head
```

### 3. Fast & slow pointers
Two pointers at different speeds — classic for cycle detection and finding the middle:
```csharp
ListNode slow = head, fast = head;
while (fast != null && fast.next != null)
{
    slow = slow.next;       // moves 1 step
    fast = fast.next.next;  // moves 2 steps
}
// slow is now at the middle
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
    ListNode prev = null;
    ListNode curr = head;

    while (curr != null)
    {
        ListNode next = curr.next;  // save next before overwriting
        curr.next = prev;           // reverse the pointer
        prev = curr;                // advance prev
        curr = next;                // advance curr
    }
    return prev;  // prev is the new head
}
```
```python
def reverse_list(head):
    prev, curr = None, head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
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
    var dummy = new ListNode(0);
    ListNode curr = dummy;

    while (l1 != null && l2 != null)
    {
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
        curr = curr.next;
    }
    curr.next = l1 ?? l2;  // attach remaining list
    return dummy.next;
}
```
```python
def merge_two_lists(l1, l2):
    dummy = ListNode(0)
    curr = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
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
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;  // they met → cycle!
    }
    return false;  // fast reached the end → no cycle
}
```
```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
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
    var dummy = new ListNode(0, head);
    ListNode fast = dummy, slow = dummy;

    // Advance fast by n+1 steps
    for (int i = 0; i <= n; i++)
        fast = fast.next;

    // Move both until fast reaches end
    while (fast != null)
    {
        slow = slow.next;
        fast = fast.next;
    }

    slow.next = slow.next.next;  // skip the target node
    return dummy.next;
}
```
```python
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        slow = slow.next
        fast = fast.next
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
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
    }
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
