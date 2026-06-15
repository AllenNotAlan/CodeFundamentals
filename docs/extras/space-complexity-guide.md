# 11 — Space Complexity: The Memory Blueprint

Space complexity is the measure of how much **working memory** (RAM) an algorithm needs to complete its task. For a student, the best way to think about this is: "If I give my program a massive amount of data, will my computer run out of memory and crash?"

---

## 1. The Two Components of Space

To truly understand space, you must distinguish between what you are **given** and what you **create**.

### A. Input Space (The Given)
This is the memory taken up by the data passed into your function.
- *Analogy:* If you are a chef, this is the pile of raw ingredients sitting on your counter. You didn't buy them; they were provided to you.

### B. Auxiliary Space (The Extra)
This is the **additional** memory your algorithm uses to solve the problem.
- *Analogy:* These are the extra bowls, blenders, and storage containers you take out of the cupboard to prepare the meal.
- **Critical Interview Tip:** When an interviewer asks for "Space Complexity," they almost always mean **Auxiliary Space**.

---

## 2. The Big-O Hierarchy of Space

Think of Space Complexity as the "Floor Space" you need to solve a puzzle. As the puzzle gets bigger, how much more floor space do you need to clear out?

### 🟦 $O(1)$ — Constant Space: "The Pocket"
No matter how many items you are processing, you only need a fixed amount of memory. You aren't creating new collections; you're just using a few "sticky notes" to keep track of things.

- **The Mental Model:** You are sitting at a small desk. Whether the library delivers 5 books or 5,000, you only have room for one book at a time on your desk.
- **When it happens:** 
  - Using a few variables (`int i`, `int sum`, `bool found`).
  - Swapping elements in an array using a single `temp` variable.
  - Using Two Pointers (`left` and `right`) to scan a list.
- **C# Example:**
```csharp
bool ContainsZero(int[] nums) {
    for (int i = 0; i < nums.Length; i++) { // 'i' is O(1) space
        if (nums[i] == 0) return true;
    }
    return false;
}
```

### 🟩 $O(\log n)$ — Logarithmic Space: "The Fold"
This is common in "Divide and Conquer" algorithms. Memory usage increases by one unit every time the input **doubles**.

- **The Mental Model:** Imagine a phone book. To find a name, you open it in the middle, then in the middle of the remaining half, and so on. Even if the phone book has 1 million names, you only need to remember about 20 "branching points" to reach your target.
- **When it happens:** 
  - Recursive Binary Search (storing stack frames for each "half").
  - Traversing a balanced binary tree.
- **Visual:**
```text
Input Size:  8 -> [][][] (3 units)
Input Size: 16 -> [][][][] (4 units)
Input Size: 32 -> [][][][][] (5 units)
```

### 🟨 $O(n)$ — Linear Space: "The Mirror"
The extra memory you use is a direct reflection of the input size. If you get twice as much data, you use twice as much memory.

- **The Mental Model:** You are building a backup of a photo album. For every photo in the original album, you need exactly one slot in the new album.
- **When it happens:** 
  - Creating a copy of an array.
  - Using a `List<T>` or `HashSet<T>` to store elements from the input.
  - Recursion where the depth is equal to $N$ (e.g., recursive factorial).
- **C# Example:**
```csharp
int[] SquareAll(int[] nums) {
    int[] results = new int[nums.Length]; // New array of size N = O(n) space
    for (int i = 0; i < nums.Length; i++) results[i] = nums[i] * nums[i];
    return results;
}
```

### 🟥 $O(n^2)$ — Quadratic Space: "The Grid"
Memory usage grows with the **square** of the input. This is usually very expensive and should be avoided if possible.

- **The Mental Model:** You are creating a seating chart for a wedding. If you have $N$ guests, and you want to record whether Guest A likes Guest B for every possible pair, you need an $N \times N$ grid.
- **When it happens:** 
  - Creating a 2D matrix of size $N \times N$.
  - Building an adjacency matrix for a graph with $N$ nodes.
- **Visual:**
```text
Input N=3:  [ ][ ][ ]
            [ ][ ][ ]
            [ ][ ][ ]  (9 total slots)
```

---

## 3. The "Hidden" Culprit: The Call Stack

Many students forget that **functions themselves take up space.** When you call a function, the computer must remember:
1. Where it was in the previous function (Return Address).
2. What the local variables were at that moment.
3. What parameters were passed in.

This "bundle" of info is called a **Stack Frame**.

### Visualizing Recursive Space
Consider a recursive function calculating the sum of numbers from $N$ down to 1:
```csharp
int Sum(int n) {
    if (n <= 0) return 0;
    return n + Sum(n - 1); // <--- Each call here waits!
}
```
If $N = 100$, the computer has to hold 100 "active" functions in memory at the same time because the first one can't finish until the 100th one returns.
- **Complexity:** $O(n)$ Auxiliary Space.
- **Optimization:** Switching this to a `for` loop uses $O(1)$ space because you only ever have **one** function active.

---

## 4. How to Calculate Space Complexity (Step-by-Step)

Calculating space complexity is like performing a "Memory Audit" on your code. Follow these four steps to find the Big-O:

### Step 1: Identify all created variables
Look at every variable, array, list, or object created inside your function. 

### Step 2: Determine dependency on 'N'
For each item identified in Step 1, ask: "If the input $N$ doubles, does this variable's memory requirement also double, stay the same, or grow some other way?"
- **Static variables** (ints, bools, single objects) are $O(1)$.
- **Dynamic collections** (arrays, lists, maps) of size $N$ are $O(n)$.

### Step 3: Audit the Call Stack
If your code is recursive, find the **maximum depth** of the recursion. Each level of recursion adds a new frame to the stack.
- A recursion that goes $N$ levels deep is $O(n)$ space.

### Step 4: Keep the Dominant Term
Just like in time complexity, we only care about the fastest-growing part. 
- $O(n) + O(1) \rightarrow O(n)$
- $O(n^2) + O(n) \rightarrow O(n^2)$

---

### Walkthrough Example: The "Memory Auditor" in Action

**Code to Analyze:**
```csharp
public List<string> FilterAndUpper(string[] words) {
    var result = new List<string>(); // 1. Created a list
    int count = 0;                  // 2. Created an int

    foreach (var word in words) {
        if (word.Length > 5) {
            result.Add(word.ToUpper()); // 3. Creating new strings
            count++;
        }
    }
    return result;
}
```

**The Audit:**
1.  **`result` list:** In the worst case (all words > 5 chars), this list will store $N$ strings. -> **$O(n)$**
2.  **`count` variable:** Just a single integer. It doesn't grow if the input grows. -> **$O(1)$**
3.  **`word.ToUpper()`:** This creates a *new* string for every word added to the list. Since these are stored in the list, they are part of the $O(n)$ growth.
4.  **Final Calculation:** $O(n) + O(1) = \mathbf{O(n)}$ **Auxiliary Space**.

---

1.  **Physical Limits:** Unlike time (which just makes you wait), memory is a hard limit. If you exceed the RAM, your program crashes with an `OutOfMemoryException`.
2.  **Embedded Systems:** If you are writing code for a microwave, a smartwatch, or a car's braking system, you might only have a few kilobytes of memory to work with.
3.  **Cloud Costs:** In modern cloud computing (AWS/Azure), you are often billed based on the amount of memory your functions consume.

---

## 5. Summary Table for Quick Reference

| Complexity | Analogy | Common C# Usage |
| :--- | :--- | :--- |
| **$O(1)$** | A single sticky note. | `int`, `bool`, `double`, `pointers`. |
| **$O(\log n)$** | A small stack of index cards. | Recursive Binary Search, Balanced Tree traversal. |
| **$O(n)$** | A notebook with one page per item. | `Array`, `List<T>`, `Dictionary<K,V>`, `Recursion`. |
| **$O(n^2)$** | A massive floor grid. | 2D Arrays (Matrices), Adjacency Matrices for Graphs. |

---

## Practice Questions (Check Your Understanding)

**Q1:** You use two pointers to swap elements in an array to reverse it. What is the Auxiliary Space?
- *Answer:* $O(1)$. You only used two integer variables (`left` and `right`), regardless of how big the array was.

**Q2:** You have a list of $N$ names. You want to find if there are any duplicates, so you add each name to a `HashSet<string>`. What is the space complexity?
- *Answer:* $O(n)$. In the worst case (no duplicates), your `HashSet` will eventually store all $N$ names.

**Q3:** Why is recursion generally "riskier" for space than iteration?
- *Answer:* Because recursion uses the Call Stack. Each recursive call adds a new frame to memory, whereas a loop reuse the same variables over and over in a single frame.
