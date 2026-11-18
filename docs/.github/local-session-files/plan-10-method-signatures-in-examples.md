# Plan 10 — Put every C# example inside a `public static` method

**Status:** DONE. Commits: `c7822cb` (user's pre-existing work), `02dda79` (Plan 09), `8728219` (Step 1), `38a06b1` (Step 2), plus the Step 3 commit. Additions beyond the table: ch02 Problem 1 brute force became `TwoSumBruteForce` (it was also a bare block with a `return`), and ch02 Python got a separate `count_frequency_manual` so each function has a single return. Python blocks were reviewed by eye (no Python on this machine). The C# blocks were compile-checked in `%TEMP%`.

**Problem:** The C# examples in the learning docs come in two inconsistent styles.
1. **Bare statements.** About 11 algorithm examples in the "Essential Patterns" sections of ch01, ch02 and ch07 (plus one in ch10) are loose statements with no method around them. Several don't compile as written. They use inputs that are never declared (`nums`, `target`, `words`, `head`) or `return` from outside any method (ch02 Complement Lookup, ch07 Dummy head). The reader can't see what goes in or what comes out.
2. **No `static`.** The ~100 examples that are methods use a LeetCode-style signature with no modifiers (`int RemoveDuplicates(int[] sorted)`). None of the C# blocks uses `static`. This repo's own code uses `public static` methods inside a class (`CodeFundamentals/HashMapSolutions.cs`, and the template in `DEVELOPMENT.md`).

**Goal:** Every algorithm example is a `public static` method with a descriptive name, explicit parameters and a return type, so it can be pasted straight into a solution class and called from a test. The method bodies (the logic and comments) stay as they are, apart from the small fixes needed to make the bare blocks compile.

**Scope:** `docs/code-learning/01–16` and `docs/extras/*.md`.
**Out of scope:** `docs/interview-prep-*`. Those show production .NET code (DI, instance services, `BackgroundService`), where `static` would be wrong.

---

## Conventions (apply to every change)

- **Signature:** `public static <ReturnType> <PascalCaseName>(<params>)`, with the opening brace on its own line (the existing style).
- **Inputs become parameters.** The example data moves out of the body into one usage comment after the closing brace:
  ```csharp
  public static Dictionary<int, int> CountFrequency(int[] nums)
  {
      ...
      return freq;
  }
  // CountFrequency(new[] { 1, 2, 2, 3, 3, 3 }) → { 1:1, 2:2, 3:3 }
  ```
- **Return types:** return the result instead of leaving it in a local. Examples that print stay `void`.
- **Keep the numbered step comments.** Renumber only where a step was "Initialize an array of integers" and that line has become a parameter.
- **Python counterparts:** a bare Python block next to a wrapped C# block becomes a `def` with a matching snake_case name and a `# usage → result` comment.
- **Unchanged:**
  - Classes (`ListNode`, `TreeNode`, `MinStack`, `MyQueue`, `Node`, `UnionFind`, `MedianFinder`, `Trie`, `WordDictionary`). Their members are instance methods holding state, which is correct.
  - Nested helper functions inside a method (e.g. `Sink` in `NumIslands`, `Backtrack` inside `Subsets`, `Dfs` inside `CloneGraph`).
  - API demos that show library calls rather than an algorithm: ch06 built-in sorting (C# + Python), ch10 the single `visited` line, ch11 the `PriorityQueue` / `heapq` intro (C# + Python).
  - The ch12 "universal template" (`Backtrack(State path, Options remaining)`). It's pseudo-code with placeholder types, so it can't be made concrete.

---

## Step 1 — Wrap the bare examples (real rewrites)

| Chapter / section | New signature | Notes |
|---|---|---|
| ch01 §1 Iterate with index | `public static void PrintAll(int[] nums)` | |
| ch01 §2 Prefix & Suffix | `public static int[] BuildPrefixSums(int[] nums)` and `public static int[] BuildSuffixSums(int[] nums)` (two methods in the same block) | Two methods are easier to read than a tuple return. The SEED/GROW comments stay. The prose below ("Why does `prefix[i - 1] + nums[i]` work?") is unchanged. |
| ch01 §4 StringBuilder | `public static string JoinNumbers(int count)` | `count = 1000` goes into the usage comment. |
| ch02 §1 Frequency Count | `public static Dictionary<int, int> CountFrequency(int[] nums)` | Python: `def count_frequency(nums)` (keeps both the `Counter` and the manual versions). |
| ch02 §2 HashSet membership | `public static void PrintDuplicates(int[] nums)` | Python: `def print_duplicates(nums)`. |
| ch02 §3 Complement / Pair Lookup | `public static int[] FindPairIndices(int[] nums, int target)` | Add `return Array.Empty<int>();` after the loop, the same as Problem 1. |
| ch02 §4 Grouping (LINQ) | `public static Dictionary<string, List<string>> GroupAnagrams(string[] words)` | |
| ch02 §4 Option A | `public static Dictionary<string, List<string>> GroupAnagramsBySorting(string[] words)` | ⚠️ These two blocks are **your uncommitted edits**. Commit them first (see Risks). |
| ch02 §4 Option B | `public static Dictionary<string, List<string>> GroupAnagramsByCounting(string[] words)` | Same as above. |
| ch07 §1 Traversal | `public static void PrintList(ListNode head)` | |
| ch07 §2 Dummy head node | `public static ListNode RemoveElements(ListNode head, int val)` | The current block is a skeleton (`// 3. Work with curr...`). Its Task and Example already promise "remove every node with a given value", so fill in the 5-line removal loop (LeetCode #203). **This adds logic — confirm (Decision 1).** |
| ch07 §3 Fast & slow | `public static ListNode FindMiddle(ListNode head)` | Returns `slow`. Same idea as Problem 5, which is fine for a pattern preview. |
| ch10 How to represent a graph | `public static Dictionary<int, List<int>> BuildGraph(int[][] edges, bool undirected = true)` | Replaces the loose `var graph` plus nested `AddEdge`. The edge-adding logic is unchanged and runs in a loop over `edges`. |

## Step 2 — Add `public static` to the existing signatures (mechanical)

- Prefix every **top-level** (zero-indent) method signature in a C# block with `public static`. Two signatures already have `public` (space-complexity guide `FilterAndUpper`, two-pointers `FindIntersection`), so they only gain `static`.
- Inventory: about 100 signatures across ch01 (Problems), ch02–ch09, ch10 (except `AddEdge`, which Step 1 replaces), ch11–ch15, and both extras. Ch16 has only classes. The full list comes from the inventory scan in Verification.
- No change to names, parameters, bodies or comments.

## Step 3 — Record the convention

- Add one line to the contributor note in `docs/interview-prep-generic/README.md` (next to the Catch up rule): "C# examples in the learning chapters are `public static` methods with explicit parameters and a usage comment. Classes and nested helpers are the exception."

---

## Verification

1. **Inventory scan (before and after):** list every top-level C# signature and every bare C# or Python block in scope. After the change:
   - every top-level signature starts with `public static`, except the ch12 template;
   - the only bare blocks left are the allowlisted API demos (ch06 sorting, ch10 `visited`, ch11 `PriorityQueue` / `heapq`).
2. **Step 2 diff check:** `git diff --word-diff` should show only `public static ` additions on signature lines. Anything else means an accidental change.
3. **Compile check for Step 1:** paste the rewritten blocks into a throwaway console project in `%TEMP%` (outside the repo), with the `ListNode` definition from ch07, and run `dotnet build`. This confirms the previously broken blocks now compile.
4. **Content check:** the Catch up blocks and Check Yourself answers that quote code (e.g. ch02 `if (!seen.Add(n)) return true;`) still match, since method bodies don't change.
5. Rebuild: `node study-html/_build/convert-v2.mjs` should still write 47 pages.
6. `dotnet build` and `dotnet test` (the docs don't affect them, but run them once as a sanity check).

## Suggested commit boundaries
1. *(You)* Commit the current ch02 "Without LINQ" edits and `HashMapSolutions` work first, so Step 1 doesn't mix with them.
2. Step 1: wrap the bare examples (ch01, ch02, ch07, ch10) + regenerated `study.html`.
3. Step 2: `public static` on the existing signatures + regenerated `study.html`.
4. Step 3: the contributor-note line.

## Risks
- **Mixing with uncommitted work:** ch02 Option A/B are your uncommitted edits, and Step 1 rewrites them. Mitigation: commit first (boundary 1), or I edit around them carefully and you review the diff.
- **A pasted example no longer matches LeetCode's signature.** LeetCode uses `public int Foo(...)` without `static`. The body is identical, so you just drop `static` when pasting into LeetCode. This is an accepted trade-off.
- **Duplicate names across chapters** (e.g. `IsPalindrome` in ch01 and ch03, `Fib` three times in ch09). That's fine, because each block is standalone. Only rename if you plan to paste several into one class (Decision 3).

## Decisions (confirmed by user)
1. **ch07 Dummy head:** fill in the removal loop (LeetCode #203) so the example does what its Task says.
2. **Usage comment style:** `// CountFrequency(new[] { 1, 2, 2, 3, 3, 3 }) → { 1:1, 2:2, 3:3 }` after the closing brace.
3. **Duplicate names:** leave them as they are.
4. **ch02 uncommitted edits:** commit them first, before Step 1. When the user says go, the first action is a separate commit of the pre-existing work only: `CodeFundamentals/HashMapSolutions.cs`, `Tests/HashMapSolutionsTest.cs` and the ch02 "Without LINQ" Option A/B blocks. Plan 09's changes are uncommitted in the same files (ch02 Catch up + Check Yourself, and every other plan 09 file), so check with the user how to split them before committing: one commit for both, or plan 09 separately.

**Execution gate:** do not start until the user says "go".
