# 01 — Arrays & Strings

Arrays and strings are the bread and butter of LeetCode. Almost every problem touches them.

---

## Core Concepts

### Arrays
- Contiguous block of memory; **O(1) access by index**.
- Searching without sorting: **O(n)**.
- Inserting/removing in the middle: **O(n)** (elements shift).

### Strings
- In C#, strings are **immutable** — every `+` creates a new string. Use `StringBuilder` when building strings in a loop.
- Common operations: `Length`, `Substring`, `IndexOf`, `ToCharArray`, `Split`, `Trim`.

---

## Essential Patterns

### 1. Iterate with index
**Task:** Visit every element of an array in order and print it.

**Example:** `nums = [1, 2, 3, 4, 5]` → prints `1`, `2`, `3`, `4`, `5` (one per line)

```csharp
// Step-by-step:
// 1. Initialize an array of integers.
int[] nums = { 1, 2, 3, 4, 5 };

// 2. Start a loop from index 0 up to (but not including) the length of the array.
//    We use 'i < nums.Length' to stay within the array's bounds (0 to 4).
for (int i = 0; i < nums.Length; i++)
{
    // 3. Access the element at the current index 'i' and print it.
    Console.WriteLine(nums[i]);
}
```

### 2. Prefix & Suffix Patterns — Precompute totals for fast lookups
**Task:** Given an array, work out the running total at every position, once from the left and once from the right, so any total can be read instantly.

**Example:** `nums = [1, 2, 3, 4]` → prefix `[1, 3, 6, 10]`, suffix `[10, 9, 7, 4]`


These patterns are used to avoid repeated work. Instead of recalculating a sum or product for every index (which is slow), you "pre-calculate" it once.

- **Prefix:** Information about everything *before* or *up to* the current index (left-to-right).
- **Suffix:** Information about everything *after* or *from* the current index (right-to-left).

**The core idea:** each new answer is built from the answer you already computed one step back. You never start a sum from scratch — you take the running total you already have and fold in one more number. That "reuse the previous result" trick is what turns repeated O(n) work into a single O(n) pass.

**Visualization (Sum example):**
```text
nums:      [ 1,  2,  3,  4 ]
--------------------------
Prefix:    [ 1,  3,  6, 10 ]  (Summing left to right: 1, 1+2, 1+2+3, ...)
Suffix:    [10,  9,  7,  4 ]  (Summing right to left: 4+3+2+1, 4+3+2, 4+3, 4)
```

Read `prefix[i]` as "the total of everything from the start up to and including `i`". Read `suffix[i]` as "the total of everything from `i` to the end". Notice they are built from opposite directions but store the same *kind* of information.

**C# Implementation:**
```csharp
int[] nums = { 1, 2, 3, 4 };
int n = nums.Length;

// Prefix Sums: Building sums from left to right
int[] prefix = new int[n];

// 1. SEED: the running total has to start somewhere. The first slot has
//    nothing before it, so its prefix sum is just the first number itself.
prefix[0] = nums[0];

// 2. GROW: every later slot = "the total I already had" + "one new number".
//    prefix[i - 1] is the sum of everything up to the previous index, so adding
//    nums[i] extends that running total by exactly one element. We never re-add
//    the earlier numbers — they are already baked into prefix[i - 1].
for (int i = 1; i < n; i++)
    prefix[i] = prefix[i - 1] + nums[i];

// Suffix Sums: Building sums from right to left
int[] suffix = new int[n];

// 1. SEED: same idea, but from the other end. The last slot has nothing after
//    it, so its suffix sum is just the last number itself.
suffix[n - 1] = nums[n - 1];

// 2. GROW: we walk backwards. suffix[i + 1] is the total of everything to the
//    right, so adding nums[i] extends that running total one step to the left.
//    The loop starts at n - 2 because index n - 1 was already seeded above.
for (int i = n - 2; i >= 0; i--)
    suffix[i] = suffix[i + 1] + nums[i];
```

**Why does `prefix[i - 1] + nums[i]` work?**
By the time the loop reaches index `i`, the slot `prefix[i - 1]` already holds the correct sum of *all* earlier elements. So the only new thing left to account for is `nums[i]`. Adding it once gives the full total up to `i`. This is why one pass is enough — each element is visited and added a single time.

**Watch out — loop direction is NOT the same as "left vs right".**
A common mix-up: "the prefix loop goes from index 0 up to the end, so isn't that the *right* side?" No. Two separate things are happening:
- **The direction the loop walks** — just the order we fill the slots in (here, `0 → n-1`).
- **Which element each step reaches for** — this is what makes it a *left* calculation.

The prefix formula uses `prefix[i - 1]` and `nums[i]` — it only ever looks *backward* at stuff already behind index `i`. So even though the loop moves forward, each slot only gathers what's to its **left**. The suffix is the mirror image: its loop walks *backward*, but each step reaches *forward* (`suffix[i + 1]`), so it gathers what's to the **right**. The name comes from which way you reach, not which way the loop moves.

**Why use this?**
- **Range Queries:** To find the sum of `nums[1..3]`, you can just do `prefix[3] - prefix[0]` in **O(1)** time instead of looping. The subtraction cancels out the part you don't want, leaving only the range you asked for.
- **Context:** At any index `i`, you now know everything about the "left side" (`prefix`) and "right side" (`suffix`) instantly — without re-scanning the array.
- **Building block:** Many harder problems (like Product of Array Except Self below) are just "prefix from the left" combined with "suffix from the right".

---

### 3. Reverse in-place
**Task:** Reverse an array without creating a second array.

**Example:** `arr = [1, 2, 3, 4, 5]` → `[5, 4, 3, 2, 1]`

```csharp
void Reverse(int[] arr)
{
    // 1. Initialize two pointers: one at the start, one at the end.
    int left = 0, right = arr.Length - 1;

    // 2. Continue as long as pointers haven't met or crossed.
    while (left < right)
    {
        // 3. Swap elements at left and right using a tuple (C# 7+).
        //    This effectively moves the 'end' element to the 'front' and vice versa.
        (arr[left], arr[right]) = (arr[right], arr[left]);

        // 4. Move pointers towards the center.
        left++;
        right--;
    }
}
```

**Why use this?**
- **Memory Optimization:** You reverse the data using only **O(1)** extra space. No need to allocate a second array.
- **Two-Pointer Foundation:** This is the simplest example of the "Two-Pointer" pattern, which is used for many complex problems (like Palindromes).

### 4. StringBuilder for string building
**Task:** Build one long string out of many small pieces (here, the numbers 0 to 999) without slowing down.

**Example:** appending `0`, `1`, `2`, … `999` → one string `"0123456789101112…999"`

```csharp
// 1. Initialize StringBuilder which uses an internal buffer.
var sb = new StringBuilder();

// 2. Append 1000 integers to the buffer.
for (int i = 0; i < 1000; i++)
    sb.Append(i);           // Efficiently adds to existing memory

// 3. Convert the completed buffer into a single string.
string result = sb.ToString();
```

**Why use this?**
- **Avoid "O(N²)" Performance Traps:** In C#, strings are immutable. Every `str += "x"` creates a brand new string, copying all previous characters. In a loop, this becomes extremely slow.
- **Efficiency:** `StringBuilder` uses a single, expandable buffer to store characters, making it **O(N)** total time.

---

## Practice Problems

---

### Problem 1 — Find Maximum in Array
**Task:** Return the largest number in an array of integers.

**Example:** `[3, 7, 1, 9, 4]` → `9`

**Think first:** You need to look at every element — no shortcut.

**Solution:**
```csharp
int FindMax(int[] nums)
{
    // 1. Assume the first number is the maximum initially.
    int max = nums[0];          
    
    // 2. Iterate through the rest of the array (starting at index 1).
    for (int i = 1; i < nums.Length; i++)
    {
        // 3. If we find a larger number, update our 'max' tracker.
        if (nums[i] > max)
            max = nums[i];
    }
    
    // 4. After checking everything, 'max' holds the largest value.
    return max;
}
```
```python
def find_max(nums):
    # 1. Start by tracking the first element as the max.
    max_val = nums[0]
    
    # 2. Iterate through every element starting from the second one.
    for n in nums[1:]:
        # 3. Compare current element with our current max; update if larger.
        if n > max_val:
            max_val = n
            
    # 4. Return the largest value found.
    return max_val
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 2 — Reverse a String (LeetCode #344)
**Task:** Reverse a char array in-place.

**Example:** `['h','e','l','l','o']` → `['o','l','l','e','h']`

**Solution:**
```csharp
void ReverseString(char[] s)
{
    // 1. Set pointers at both boundaries.
    int left = 0, right = s.Length - 1;
    
    // 2. Swap elements while moving pointers toward the middle.
    while (left < right)
    {
        // 3. Swap values at left and right indices.
        (s[left], s[right]) = (s[right], s[left]);
        
        // 4. Shrink the window.
        left++;
        right--;
    }
}
```
```python
def reverse_string(s):
    # 1. Initialize two pointers for the start and end of the string.
    left, right = 0, len(s) - 1
    
    # 2. Loop until the pointers meet in the middle.
    while left < right:
        # 3. Swap the characters at the left and right positions.
        s[left], s[right] = s[right], s[left]
        
        # 4. Move pointers inward to process the next pair of characters.
        left += 1
        right -= 1
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 3 — Running Sum of Array (LeetCode #1480)
**Task:** Return an array where each element is the sum of all elements up to that index.

**Example:** `[1, 2, 3, 4]` → `[1, 3, 6, 10]`

**Solution:**
```csharp
int[] RunningSum(int[] nums)
{
    // 1. Start from index 1 (the second element).
    for (int i = 1; i < nums.Length; i++)
        // 2. Add the value of the previous element to the current one.
        //    This effectively accumulates the sum as we move forward.
        nums[i] += nums[i - 1];     
        
    return nums;
}
```
```python
def running_sum(nums):
    # 1. Iterate through the array starting from the second index.
    for i in range(1, len(nums)):
        # 2. Update the current element by adding the previous element's value.
        #    This creates a cumulative total at each position.
        nums[i] += nums[i - 1]
        
    return nums
```
⏱ Time: O(n) | Space: O(1)

---

### Problem 4 — Check if Palindrome (LeetCode #125 simplified)
**Task:** Return true if a string reads the same forwards and backwards (ignore case, letters only).

**Example:** `"racecar"` → `true`, `"hello"` → `false`

**Solution:**
```csharp
bool IsPalindrome(string s)
{
    // 1. Filter out non-alphanumeric characters and convert to lowercase.
    //    This ensures we only compare relevant characters consistently.
    var filtered = new string(s.Where(char.IsLetterOrDigit).ToArray()).ToLower();
    
    // 2. Initialize pointers at both ends of the cleaned string.
    int left = 0, right = filtered.Length - 1;
    
    // 3. Compare characters moving inward.
    while (left < right)
    {
        // 4. If characters don't match, it's not a palindrome.
        if (filtered[left] != filtered[right]) return false;
        
        left++;
        right--;
    }
    
    // 5. If we reach the middle without a mismatch, it's a palindrome.
    return true;
}
```
```python
def is_palindrome(s):
    # 1. Clean the string: keep only letters/numbers and normalize to lowercase.
    filtered = [c.lower() for c in s if c.isalnum()]
    
    # 2. Use two pointers to compare the start and end.
    left, right = 0, len(filtered) - 1
    
    while left < right:
        # 3. Mismatch means it's not the same forwards and backwards.
        if filtered[left] != filtered[right]:
            return False
            
        # 4. Move pointers toward each other.
        left += 1
        right -= 1
        
    return True
```
⏱ Time: O(n) | Space: O(n)

---

### Problem 5 — Product of Array Except Self (LeetCode #238)
**Task:** Given an array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.

**Example:** `[1, 2, 3, 4]` → `[24, 12, 8, 6]`

**The "Aha!" Moment:**
If you can't use division, how do you know what the product of "everything else" is? 
For any index `i`, "everything else" is just:
1. Everything to the **left** of `i`.
2. Everything to the **right** of `i`.

If we pre-calculate these two sides, the answer for `i` is simply `left_product * right_product`. This is the prefix/suffix pattern again: `left` is a **prefix product**, `right` is a **suffix product**, and multiplying them stitches the two halves back together *around* index `i` — which is exactly "everything except `i`".

**Why split it into two sides?**
The value at `nums[i]` is the one thing we must leave out. By building `left[i]` to stop *just before* `i`, and `right[i]` to start *just after* `i`, neither side ever includes `nums[i]` itself. Multiply them and you get the product of all other elements — with no division needed.

**Read "left of `i`" as *all* the elements before `i` — not just the one next to it.**
This trips people up. "Everything to the left of index 3" doesn't mean only index 2 — it means indices 0, 1, **and** 2, all multiplied together. Likewise "left of index 2" is indices 0 and 1, not just index 1. So:
```text
left[0] = 1                                 (nothing to the left)
left[1] = 1 * nums[0]             = 1       (just index 0)
left[2] = 1 * nums[0] * nums[1]   = 2       (indices 0 AND 1)
left[3] = 1 * nums[0]*nums[1]*nums[2] = 6   (indices 0, 1 AND 2)
```
The code builds each one by *reusing the previous slot* (`left[i] = left[i-1] * nums[i-1]`), so it never has to re-multiply all those earlier numbers by hand — but conceptually, each slot is the product of **every** element before it.

**Step-by-Step Walkthrough (`nums = [1, 2, 3, 4]`):**

1. **Calculate Left Products (Prefix):**
   - **Fill direction: front to back (index 0 → n-1).** Each slot leans on the slot *behind* it (`left[i] = left[i-1] * ...`), so the earlier slot must already exist — which is why we walk forward.
   - At index 0, there's nothing to the left, so we use `1` (the "do nothing" value for multiplication — multiplying by 1 changes nothing).
   - Each subsequent index is `previous_left_product * previous_num`. We reuse the product we already built and fold in just one more number, so it stays a single pass.
   - Notice the `4` (at index 3) never appears in the left array — it's its *own* card, and nothing can be to the left of itself.
   - Result: `[1, 1, 2, 6]`
   *(Read `left[3] = 6` as "the product of everything before index 3" = `1 * 2 * 3`.)*

2. **Calculate Right Products (Suffix):**
   - **Fill direction: back to front (index n-1 → 0).** Mirror image of the left array: each slot leans on the slot *ahead* of it (`right[i] = right[i+1] * ...`), so the later slot must already exist — which is why we start at the right end and walk left.
   - At the last index there's nothing to the right, so we seed it with `1`, then build leftward:
     ```text
     right[3] = 1                        (nothing to the right)
     right[2] = right[3] * nums[3] = 4
     right[1] = right[2] * nums[2] = 12
     right[0] = right[1] * nums[1] = 24
     ```
   - **Watch out:** you *build* these values in the order `1, 4, 12, 24`, but each one is *stored* in its own index slot — so the final array reads `[24, 12, 4, 1]`, not the order you computed them in.
   - Result: `[24, 12, 4, 1]`
   *(Read `right[0] = 24` as "the product of everything after index 0" = `4 * 3 * 2`.)*

3. **Combine them:**
   - Multiply `left[i] * right[i]` for every index. `left[i]` covers everything to the left, `right[i]` covers everything to the right, and together they cover everything *except* `nums[i]`.
   - `1*24=24`, `1*12=12`, `2*4=8`, `6*1=6`.
   - Final Result: `[24, 12, 8, 6]`

**Solution:**
```csharp
int[] ProductExceptSelf(int[] nums) {
    int n = nums.Length;
    int[] left = new int[n];   // left[i]  = product of everything BEFORE i
    int[] right = new int[n];  // right[i] = product of everything AFTER i
    int[] res = new int[n];    // res[i]   = left[i] * right[i]

    // 1. Build the prefix array (products of everything to the left).
    //    SEED: nothing is to the left of index 0, and 1 is the identity for
    //    multiplication (x * 1 == x), so it's the safe "empty product" starting point.
    left[0] = 1; 
    for (int i = 1; i < n; i++)
        // GROW: take the product we already built for the previous index and
        // multiply in nums[i-1] — the element we just stepped past. Note we use
        // nums[i-1], NOT nums[i], so nums[i] itself is never included.
        left[i] = left[i-1] * nums[i-1];

    // 2. Build the suffix array (products of everything to the right).
    //    SEED: nothing is to the right of the last element, so again use 1.
    right[n-1] = 1;
    for (int i = n-2; i >= 0; i--)
        // GROW: walking backwards, multiply the running right-side product by
        // nums[i+1] — the element just to the right. Again nums[i] is excluded.
        right[i] = right[i+1] * nums[i+1];

    // 3. The answer for any index is (product of its left) * (product of its right).
    //    Because neither side ever included nums[i], the result is the product of
    //    every element EXCEPT nums[i] — exactly what the problem asks for.
    for (int i = 0; i < n; i++)
        res[i] = left[i] * right[i];

    return res;
}
```
⏱ Time: O(n) | Space: O(n) — three passes over the array, plus two helper arrays. (You can drop to O(1) extra space by writing the prefix straight into `res`, then folding the suffix in with a single running variable — a common follow-up question.)


---

## Common Mistakes

- **Off-by-one errors** — double check `< Length` vs `<= Length - 1`.
- **Mutating while iterating** — don't add/remove from a collection you're looping over.
- **String concatenation in loops** — use `StringBuilder` in C#.
- **Not handling empty input** — always ask: what if the array has 0 or 1 elements?

---

## LeetCode Problems to Try Now

- #1480 — Running Sum of 1d Array ⭐ (easy warm-up)
- #344 — Reverse String ⭐
- #1 — Two Sum ⭐ (preview of hash maps, try brute force first)
- #238 — Product of Array Except Self ⭐⭐ (prefix/suffix challenge)
