# Analysis 8 — Braceless control statements in the C# examples

**Status:** ANALYSIS ONLY — no chapter files have been changed.
**Request:** The user prefers curly braces on every `if` / `else` / loop body ("more traditional and easier to read"), e.g. not:

```csharp
if (!groups.ContainsKey(key)) groups[key] = new List<string>();
groups[key].Add(word);
```

**Scope scanned:** every ```` ```csharp ```` block in `docs/code-learning/01`–`16` (Python blocks ignored — braces don't apply).

---

## Headline numbers

**168 braceless control statements** across 16 chapters.

| Kind | Count | What it looks like |
|------|-------|--------------------|
| Inline body | 102 | `if (x) stmt;` / `else stmt;` / `while (x) stmt;` on one line |
| ↳ of which guard clauses (`return` / `break` / `continue` / `throw`) | 53 | `if (root == null) return 0;` |
| ↳ of which other statements (assignment, call, `++`/`--`) | 49 | `if (!seen.Contains(n)) seen.Add(n);` |
| Next-line body | 66 | `for (...)` or `if (...)` followed by an indented single statement with no `{` |

By keyword: `if` 94, `for` 44, `foreach` 13, `else if` 7, `else` 7, `while` 3.

### Per chapter

| Chapter | Total | Inline | Next-line |
|---------|------:|-------:|----------:|
| 01 Arrays & Strings | 9 | 1 | 8 |
| 02 Hash Maps & Sets | 18 | 8 | 10 |
| 03 Two Pointers | 11 | 11 | 0 |
| 04 Sliding Window | 5 | 0 | 5 |
| 05 Stacks & Queues | 5 | 4 | 1 |
| 06 Sorting & Binary Search | 8 | 8 | 0 |
| 07 Linked Lists | 1 | 1 | 0 |
| 08 Trees & Recursion | 12 | 12 | 0 |
| 09 DP Intro | 8 | 8 | 0 |
| 10 Graphs | 35 | 21 | 14 |
| 11 Heaps & Priority Queues | 11 | 8 | 3 |
| 12 Backtracking | 11 | 9 | 2 |
| 13 DP Patterns | 25 | 6 | 19 |
| 14 Pattern Recognition | 1 | 0 | 1 |
| 15 Greedy | 2 | 2 | 0 |
| 16 Tries | 6 | 3 | 3 |
| **Total** | **168** | **102** | **66** |

Chapters with the most work: **10 (35)**, **13 (25)**, **02 (18)**, **08 (12)**, **03 / 11 / 12 (11 each)**.

---

## Brace style already used (so the conversion matches)

Among the control statements that *do* use braces, **131 put `{` on its own line (Allman)** and **0 use same-line `{` (K&R)**. So the converted code should follow the existing Allman style with 4-space indents.

---

## Conversion rules (what "add braces" means)

**1. Inline body → split onto its own braced block**
```csharp
// before
if (sum == target) return true;
else if (sum < target) left++;
else right--;

// after
if (sum == target)
{
    return true;
}
else if (sum < target)
{
    left++;
}
else
{
    right--;
}
```

**2. Next-line body → wrap in braces**
```csharp
// before
for (int i = 1; i < n; i++)
    prefix[i] = prefix[i - 1] + nums[i];

// after
for (int i = 1; i < n; i++)
{
    prefix[i] = prefix[i - 1] + nums[i];
}
```

**3. Trailing comments stay on the condition line** (e.g. 14 line 96, 15 lines 89 and 161):
```csharp
if (i > furthest)   // can't even get here
{
    return false;
}
```

**4. Comments sitting between the condition and the body move inside the braces** (e.g. the `// Success!` comment in the 02 Problem 1 brute force).

**5. Nested braceless statements are braced at every level** (e.g. the two nested `for` loops + `if` in the 02 Problem 1 brute force).

**6. Alignment padding is dropped** (e.g. `if (node.left  != null)` has two spaces to line up with the next line; braces make that unnecessary).

---

## Risks and edge cases

- **Behaviour must not change.** Only whitespace and braces may differ. See the verification check below.
- **Dangling `else` / chained `else if`:** a few chains are mixed (some branches braced, some not). They must be converted as a whole chain, not line by line.
- **Document growth:** roughly +438 lines in total (102 inline x 3 extra lines + 66 next-line x 2 extra lines). Chapters 10 and 13 grow the most.
- **Existing explanatory comments** that say "one line" or refer to line positions should be re-read after conversion. None were seen in the scan, but a human read-through of each chapter is part of the gate.
- **Two of the 02 occurrences are mine** (the Option A and Option B snippets I added use the same `if (!groups.ContainsKey(key)) groups[key] = new List<string>();` form). They are included in the counts and will be fixed with the rest.
- **`study.html`** is generated; it must be regenerated after the markdown changes (`node study-html/_build/convert-v2.mjs`).

---

## Verification plan (proposed)

1. **Token-equivalence check per chapter:** take each C# block before and after, strip all whitespace and all `{` / `}` characters, and compare. They must be identical, which proves only braces/whitespace changed and no code was altered.
2. **Re-run this scanner:** expected result is **0** braceless statements.
3. **`git diff` review:** every changed hunk should be a pure brace/line-break edit.
4. **Rendered HTML spot check** on the two biggest chapters (10 and 13).

---

## Proposed phasing (same gated approach as plan-07)

One phase per chapter, smallest first so the style can be confirmed early. Pilot on chapter 02 (it contains the user's own example and 18 occurrences), then:

07 (1) → 14 (1) → 15 (2) → 04 (5) → 05 (5) → 16 (6) → 01 (9) → 06 (8) → 09 (8) → 03 (11) → 11 (11) → 12 (11) → 08 (12) → 13 (25) → 10 (35) → regenerate HTML → commit.

---

## Not covered by this scan (decide whether they are in scope)

1. **Other docs with C# blocks:** `docs/extras/` (2 files, 9 blocks), `docs/interview-prep-dotnet/` (4 files, 44 blocks), `docs/interview-prep-generic/` (4 files, 16 blocks), `docs/interview-prep-monzo/` (3 files, 11 blocks), `docs/personal-projects/04-coding-practice-plan.md` (1 block). Not scanned.
2. **Real C# source:** `CodeFundamentals/ArraysSolution.cs`, `CodeFundamentals/HashMapSolutions.cs`, `CodeFundamentals/Program.cs`, `Tests/ArraysSolutionTests.cs`, `Tests/HashMapSolutionsTest.cs`. Not scanned. `HashMapSolutions.cs` and `HashMapSolutionsTest.cs` currently have uncommitted changes from the user, so they should not be touched without asking.

---

## Open questions for the user

1. **Guard clauses:** Should `if (x) return y;` also get braces (all 168), or only the non-guard cases? (53 of the 102 inline cases are guard clauses.) My assumption from "keep the curly brackets" is **yes, all of them**.
2. **Loops:** Does the rule also cover `for` / `foreach` / `while` without braces (57 occurrences)? Assumed **yes**.
3. **Scope:** `docs/code-learning` only, or also the other docs and the real `.cs` files?
4. **Pilot first (chapter 02), or run all chapters with per-chapter review gates?**
5. **Rule going forward:** Should I follow this style (always braces, Allman) for any new C# I write in these docs? Assumed **yes**.

---

## Appendix — every occurrence (file : line in current files)

`inline` = body on the same line; `next-line` = body on the following line with no `{`.

### 01-arrays-and-strings.md (9)
- L80 [next-line] `for (int i = 1; i < n; i++)`
- L93 [next-line] `for (int i = n - 2; i >= 0; i--)`
- L153 [next-line] `for (int i = 0; i < 1000; i++)`
- L188 [next-line] `if (nums[i] > max)`
- L266 [next-line] `for (int i = 1; i < nums.Length; i++)`
- L308 [inline] `if (filtered[left] != filtered[right]) return false;`
- L407 [next-line] `for (int i = 1; i < n; i++)`
- L416 [next-line] `for (int i = n-2; i >= 0; i--)`
- L424 [next-line] `for (int i = 0; i < n; i++)`

### 02-hash-maps-and-sets.md (18)
- L43 [inline] `if (!freq.ContainsKey(n)) freq[n] = 0;`
- L81 [next-line] `if (seen.Contains(n))`
- L118 [next-line] `if (map.ContainsKey(complement))`
- L143 [inline] `if (!groups.ContainsKey(key)) groups[key] = new List<string>();`
- L166 [inline] `if (!groups.ContainsKey(key)) groups[key] = new List<string>();`
- L180 [next-line] `foreach (char c in word)`
- L188 [inline] `if (!groups.ContainsKey(key)) groups[key] = new List<string>();`
- L209 [next-line] `for (int i = 0; i < nums.Length; i++)`
- L210 [next-line] `for (int j = i + 1; j < nums.Length; j++)`
- L212 [next-line] `if (nums[i] + nums[j] == target)`
- L229 [next-line] `if (seen.ContainsKey(complement))`
- L277 [inline] `if (!seen.Add(n)) return true;`
- L304 [inline] `if (s.Length != t.Length) return false;`
- L308 [next-line] `foreach (char c in s)`
- L315 [inline] `if (!count.ContainsKey(c) || count[c] == 0) return false;`
- L345 [next-line] `foreach (char c in s)`
- L349 [next-line] `for (int i = 0; i < s.Length; i++)`
- L350 [inline] `if (freq[s[i]] == 1) return i;`

### 03-two-pointers.md (11)
- L57 [inline] `if (sum == target) return true;`
- L61 [inline] `else if (sum < target) left++;`
- L65 [inline] `else right--;`
- L105 [inline] `if (sorted.Length == 0) return 0;`
- L149 [inline] `while (left < right && !char.IsLetterOrDigit(s[left]))  left++;`
- L152 [inline] `while (left < right && !char.IsLetterOrDigit(s[right])) right--;`
- L155 [inline] `if (char.ToLower(s[left]) != char.ToLower(s[right])) return false;`
- L207 [inline] `if (sum == target) return new[] { left + 1, right + 1 };`
- L210 [inline] `else if (sum < target) left++;`
- L213 [inline] `else right--;`
- L334 [inline] `if (slow != fast) nums[fast] = 0;`

### 04-sliding-window.md (5)
- L43 [next-line] `for (int i = 0; i < k; i++)`
- L132 [next-line] `for (int i = 0; i < k; i++)`
- L186 [next-line] `if (price < minPrice)`
- L190 [next-line] `else if (price - minPrice > maxProfit)`
- L236 [next-line] `if (charIndex.ContainsKey(c) && charIndex[c] >= left)`

### 05-stacks-and-queues.md (5)
- L67 [inline] `if (stack.Count == 0) return false;`
- L133 [inline] `if (root == null) return;`
- L154 [inline] `if (node.left  != null) queue.Enqueue(node.left);`
- L155 [inline] `if (node.right != null) queue.Enqueue(node.right);`
- L199 [next-line] `if (stack.Count == 0 || stack.Pop() != pairs[c])`

### 06-sorting-and-binary-search.md (8)
- L165 [inline] `else if (nums[mid] < target) low  = mid + 1;`
- L166 [inline] `else                         high = mid - 1;`
- L194 [inline] `if (nums[mid] == target) return mid;`
- L197 [inline] `else if (nums[mid] <  target) low  = mid + 1;`
- L198 [inline] `else                          high = mid - 1;`
- L222 [inline] `if (nums[mid] == target) return mid;`
- L225 [inline] `else if (nums[mid] <  target) low  = mid + 1;`
- L226 [inline] `else                          high = mid - 1;`

### 07-linked-lists.md (1)
- L263 [inline] `if (slow == fast) return true;`

### 08-trees-and-recursion.md (12)
- L58 [inline] `if (n == 0) return 0;`
- L95 [inline] `if (node == null) return;`
- L110 [inline] `if (node == null) return;`
- L132 [inline] `if (root == null) return result;`
- L151 [inline] `if (node.left  != null) queue.Enqueue(node.left);`
- L152 [inline] `if (node.right != null) queue.Enqueue(node.right);`
- L186 [inline] `if (root == null) return 0;`
- L227 [inline] `if (left == null && right == null) return true;`
- L230 [inline] `if (left == null || right == null) return false;`
- L281 [inline] `if (root == null) return false;`
- L332 [inline] `if (node == null) return true;`
- L335 [inline] `if (node.val <= min || node.val >= max) return false;`

### 09-dynamic-programming-intro.md (8)
- L60 [inline] `if (n <= 1) return n;`
- L76 [inline] `if (n <= 1) return n;`
- L79 [inline] `if (memo.ContainsKey(n)) return memo[n];`
- L92 [inline] `if (n <= 1) return n;`
- L141 [inline] `if (n <= 2) return n;`
- L197 [inline] `if (nums.Length == 1) return nums[0];`
- L327 [inline] `for (int i = 0; i < m; i++) dp[i, 0] = 1;`
- L328 [inline] `for (int j = 0; j < n; j++) dp[0, j] = 1;`

### 10-graphs.md (35)
- L35 [inline] `if (!graph.ContainsKey(from)) graph[from] = new List<int>();`
- L39 [inline] `if (!graph.ContainsKey(to)) graph[to] = new List<int>();`
- L72 [inline] `if (visited.Contains(node)) return;`
- L79 [next-line] `foreach (int neighbour in graph.GetValueOrDefault(node, new List<int>()))`
- L160 [next-line] `foreach (var edges in graph.Values)`
- L161 [inline] `foreach (int to in edges) inDegree[to]++;   // 1. count incoming edges`
- L165 [next-line] `for (int i = 0; i < n; i++)`
- L166 [inline] `if (inDegree[i] == 0) queue.Enqueue(i);`
- L174 [next-line] `foreach (int next in graph.GetValueOrDefault(node, new List<int>()))`
- L175 [inline] `if (--inDegree[next] == 0) queue.Enqueue(next);`
- L200 [inline] `for (int i = 0; i < n; i++) parent[i] = i;   // each node starts in its own group`
- L206 [inline] `if (parent[x] != x) parent[x] = Find(parent[x]);  // path compression`
- L214 [inline] `if (rootA == rootB) return false;`
- L245 [inline] `if (grid.Length == 0) return 0;`
- L251 [inline] `if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == '0') return;`
- L258 [next-line] `for (int r = 0; r < rows; r++)`
- L259 [next-line] `for (int c = 0; c < cols; c++)`
- L311 [inline] `if (!graph.ContainsKey(prereq)) graph[prereq] = new List<int>();`
- L318 [next-line] `for (int i = 0; i < numCourses; i++)`
- L319 [inline] `if (inDegree[i] == 0) queue.Enqueue(i);`
- L327 [next-line] `foreach (int next in graph.GetValueOrDefault(course, new List<int>()))`
- L328 [inline] `if (--inDegree[next] == 0) queue.Enqueue(next);`
- L383 [inline] `if (node == null) return null;`
- L389 [inline] `if (clones.TryGetValue(cur, out var existing)) return existing;`
- L396 [next-line] `foreach (var nb in cur.neighbors)`
- L444 [next-line] `for (int i = 0; i < n; i++)`
- L445 [next-line] `for (int j = i + 1; j < n; j++)`
- L446 [inline] `if (isConnected[i][j] == 1) uf.Union(i, j);`
- L450 [next-line] `for (int i = 0; i < n; i++)`
- L451 [inline] `if (uf.Find(i) == i) provinces++;`
- L495 [next-line] `for (int r = 0; r < rows; r++)`
- L496 [next-line] `for (int c = 0; c < cols; c++)`
- L497 [inline] `if (grid[r][c] == 2) queue.Enqueue((r, c));`
- L498 [inline] `else if (grid[r][c] == 1) fresh++;`
- L599 [inline] `if (d > dist[u]) continue;            // stale entry — already found better`

### 11-heaps-priority-queues.md (11)
- L102 [inline] `if (heap.Count > k) heap.Dequeue();`
- L132 [next-line] `for (int i = 0; i < lists.Count; i++)`
- L133 [next-line] `if (lists[i].Length > 0)`
- L184 [inline] `if (low.Count > high.Count) return low.Peek();`
- L231 [inline] `if (heap.Count > k) heap.Dequeue();     // evict the smallest`
- L264 [inline] `foreach (int n in nums) freq[n] = freq.GetValueOrDefault(n) + 1;`
- L271 [inline] `if (heap.Count > k) heap.Dequeue();   // drop the least frequent survivor`
- L308 [inline] `if (heap.Count > k) heap.Dequeue();  // evict the farthest`
- L336 [next-line] `for (int i = 0; i < lists.Length; i++)`
- L337 [inline] `if (lists[i] != null) heap.Enqueue(lists[i], (lists[i].val, i));   // 1. seed heads`
- L349 [inline] `if (node.next != null) heap.Enqueue(node.next, (node.next.val, counter++));`

### 12-backtracking.md (11)
- L35 [inline] `if (!IsValid(choice, path)) continue;  // prune dead branches early`
- L130 [inline] `if (used[i]) continue;    // skip elements already in this permutation`
- L189 [inline] `if (candidates[i] > remaining) continue;  // PRUNE: can't fit`
- L275 [inline] `if (used[i]) continue;`
- L331 [inline] `if (candidates[i] > remaining) continue;      // prune`
- L378 [inline] `if (idx == word.Length) return true;              // matched the whole word`
- L379 [inline] `if (r < 0 || c < 0 || r >= rows || c >= cols) return false;`
- L380 [inline] `if (board[r][c] != word[idx]) return false;        // letter mismatch`
- L393 [next-line] `for (int r = 0; r < rows; r++)`
- L394 [next-line] `for (int c = 0; c < cols; c++)`
- L395 [inline] `if (Dfs(r, c, 0)) return true;`

### 13-dynamic-programming-patterns.md (25)
- L46 [next-line] `for (int i = 1; i <= n; i++)`
- L53 [next-line] `if (weights[i - 1] <= w)`
- L88 [inline] `if (nums.Length == 0) return 0;`
- L94 [next-line] `for (int i = 1; i < nums.Length; i++)`
- L95 [next-line] `for (int j = 0; j < i; j++)`
- L135 [inline] `for (int c = 1; c < cols; c++) dp[0, c] = dp[0, c - 1] + grid[0][c];`
- L137 [inline] `for (int r = 1; r < rows; r++) dp[r, 0] = dp[r - 1, 0] + grid[r][0];`
- L140 [next-line] `for (int r = 1; r < rows; r++)`
- L141 [next-line] `for (int c = 1; c < cols; c++)`
- L180 [inline] `for (int i = 0; i <= m; i++) dp[i, 0] = i;`
- L181 [inline] `for (int j = 0; j <= n; j++) dp[0, j] = j;`
- L183 [next-line] `for (int i = 1; i <= m; i++)`
- L186 [next-line] `if (a[i - 1] == b[j - 1])`
- L188 [next-line] `else`
- L237 [inline] `if (total % 2 != 0) return false;          // odd total can't split evenly`
- L244 [next-line] `foreach (int num in nums)`
- L246 [next-line] `for (int s = target; s >= num; s--)`
- L282 [next-line] `for (int i = 1; i < nums.Length; i++)`
- L283 [next-line] `for (int j = 0; j < i; j++)`
- L321 [next-line] `for (int i = 1; i <= m; i++)`
- L322 [next-line] `for (int j = 1; j <= n; j++)`
- L323 [next-line] `if (a[i - 1] == b[j - 1])`
- L325 [next-line] `else`
- L364 [next-line] `foreach (int coin in coins)`
- L365 [next-line] `for (int a = coin; a <= amount; a++)`

### 14-pattern-recognition.md (1)
- L96 [next-line] `while (sum > k && left <= right)    // shrink while invalid`

### 15-greedy.md (2)
- L89 [inline] `if (s[cookie] >= g[child]) child++;  // this cookie satisfies this child`
- L161 [inline] `if (i > furthest) return false;            // can't even get here`

### 16-tries.md (6)
- L77 [next-line] `if (!cur.Children.TryGetValue(c, out var next))`
- L89 [inline] `if (!cur.Children.TryGetValue(c, out var next)) return null;`
- L149 [next-line] `if (!cur.Children.TryGetValue(c, out var next))`
- L160 [inline] `if (i == word.Length) return node.IsWord;`
- L164 [next-line] `foreach (var child in node.Children.Values)`
- L165 [inline] `if (Dfs(word, i + 1, child)) return true;`
