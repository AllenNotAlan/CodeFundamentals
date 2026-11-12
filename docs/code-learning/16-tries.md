# 16 — Tries (Prefix Trees)

A **trie** (pronounced "try", from re*trie*val) is a tree where each node represents one character and each root-to-node path spells a prefix. It turns "does any word start with `app`?" and "insert/search this word" into operations that cost `O(length of the word)` — independent of how many words you've stored.

> **Builds on:** [08 — Trees & Recursion](./08-trees-and-recursion.md) (a trie is a tree with a child *per character*) and [02 — Hash Maps & Sets](./02-hash-maps-and-sets.md) (each node's children are a small map).

---

## Why a trie instead of a hash set?

A `HashSet<string>` answers "is this exact word present?" in `O(1)`. But it's useless for **prefixes** — to find all words starting with `"app"` you'd scan every key. A trie is built for exactly that: shared prefixes are stored **once**, and prefix queries walk a single path.

```
Insert "app", "apple", "apply":

        (root)
          │ a
          a
          │ p
          p
          │ p
         [p]*            ← '*' marks end of "app"
        /     \
    l (apple) y (apply)
      │          │
     [e]*       [y]*
```

- **Space win:** `app`, `apple`, `apply` share the `a-p-p` spine — stored once.
- **Prefix win:** "is there a word with prefix `appl`?" = walk 4 edges, done.

**Reach for a trie when you see:** autocomplete, "starts with", dictionary/word-search, spell-check, IP routing (longest-prefix match), or many strings sharing prefixes.

---

## The node + the three operations

A node holds a map of child characters and a flag marking whether a word *ends* here (so `app` can be a word even though it's also a prefix of `apple`).

### Pattern — build the node once, reuse everywhere
**Task:** Store a set of words so you can quickly check both whole words and prefixes.

**Example:** after inserting `"app"` and `"apple"`: `search("app")` → `true`, `search("appl")` → `false`, `startsWith("appl")` → `true`

*(Full walkthrough: Problem 1 below.)*

`insert`, `search`, and `startsWith` are the same walk; they differ only in what they check at the end (word-end flag vs "did the path exist at all").

---

## Practice Problems

### Problem 1 — Implement Trie (LeetCode #208)
**Task:** Support `insert(word)`, `search(word)` (exact word present?), and `startsWith(prefix)`.

**Example:** `insert("apple")`, `search("app") → false`, `startsWith("app") → true`, `insert("app")`, `search("app") → true`

**Key insight:** One traversal method `Walk(prefix)` returns the node at the end of a path (or null). `search` additionally checks the end-of-word flag; `startsWith` just checks the node exists.

**Solution:**
```csharp
public class Trie
{
    private class Node
    {
        public Dictionary<char, Node> Children = new();
        public bool IsWord;
    }

    private readonly Node _root = new();

    public void Insert(string word)
    {
        var cur = _root;
        foreach (char c in word)
        {
            if (!cur.Children.TryGetValue(c, out var next))
                cur.Children[c] = next = new Node();
            cur = next;
        }
        cur.IsWord = true;                 // mark the end of a complete word
    }

    private Node Walk(string s)            // node at end of path, or null
    {
        var cur = _root;
        foreach (char c in s)
        {
            if (!cur.Children.TryGetValue(c, out var next)) return null;
            cur = next;
        }
        return cur;
    }

    public bool Search(string word)    => Walk(word) is { IsWord: true };
    public bool StartsWith(string pre) => Walk(pre) is not null;
}
```
```python
class Trie:
    def __init__(self):
        self.children = {}
        self.is_word = False

    def insert(self, word):
        cur = self
        for c in word:
            cur = cur.children.setdefault(c, Trie())
        cur.is_word = True

    def _walk(self, s):                    # node at end of path, or None
        cur = self
        for c in s:
            if c not in cur.children:
                return None
            cur = cur.children[c]
        return cur

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_word

    def startsWith(self, prefix):
        return self._walk(prefix) is not None
```
⏱ Insert/Search/StartsWith: O(L) time, where L = word length | Space: O(total characters inserted)

---

### Problem 2 — Design Add and Search Words with `.` wildcard (LeetCode #211)
**Task:** `addWord(word)` and `search(word)` where `word` may contain `.` matching any single character.

**Example:** `addWord("bad")`, `search("b.d") → true`, `search("b..") → true`, `search("b...") → false`

**Key insight:** A plain walk fails on `.` because you don't know which child to follow — so **branch**: on `.`, recurse into *every* child. This is a DFS over the trie ([08](./08-trees-and-recursion.md)).

**Solution:**
```csharp
public class WordDictionary
{
    private class Node { public Dictionary<char, Node> Children = new(); public bool IsWord; }
    private readonly Node _root = new();

    public void AddWord(string word)
    {
        var cur = _root;
        foreach (char c in word)
        {
            if (!cur.Children.TryGetValue(c, out var next))
                cur.Children[c] = next = new Node();
            cur = next;
        }
        cur.IsWord = true;
    }

    public bool Search(string word) => Dfs(word, 0, _root);

    private bool Dfs(string word, int i, Node node)
    {
        if (i == word.Length) return node.IsWord;
        char c = word[i];
        if (c == '.')                                   // wildcard: try every child
        {
            foreach (var child in node.Children.Values)
                if (Dfs(word, i + 1, child)) return true;
            return false;
        }
        return node.Children.TryGetValue(c, out var next) && Dfs(word, i + 1, next);
    }
}
```
```python
class WordDictionary:
    def __init__(self):
        self.children = {}
        self.is_word = False

    def addWord(self, word):
        cur = self
        for c in word:
            cur = cur.children.setdefault(c, WordDictionary())
        cur.is_word = True

    def search(self, word):
        def dfs(i, node):
            if i == len(word):
                return node.is_word
            c = word[i]
            if c == '.':
                return any(dfs(i + 1, ch) for ch in node.children.values())
            return c in node.children and dfs(i + 1, node.children[c])
        return dfs(0, self)
```
⏱ Time: O(L) typical, O(26^d · L) worst with `d` wildcards | Space: O(total characters)

---

## Common Mistakes

- **Forgetting the end-of-word flag.** Without it you can't tell "`app` is a stored word" from "`app` is only a prefix of `apple`." `search` and `insert` both depend on it.
- **Using a fixed 26-slot array when the alphabet isn't lowercase a–z.** A `Dictionary`/`map` of children is safer for mixed/Unicode input; the array is a micro-optimisation for known small alphabets.
- **Confusing `search` and `startsWith`.** They walk identically; only the final check differs (word-end flag vs node-exists).
- **Recursing on every child when there's no wildcard.** Branch only on `.`; a concrete character follows exactly one edge.

---

## LeetCode Problems to Try Now

- #208 — Implement Trie ⭐ (the canonical build)
- #211 — Add and Search Word with `.` ⭐⭐ (DFS branching on wildcard)
- #212 — Word Search II ⭐⭐ (trie + grid backtracking — pairs with [12 — Backtracking](./12-backtracking.md))
- #648 — Replace Words (longest-prefix replacement)
- #1268 — Search Suggestions System (autocomplete)

---

## Where to go next

Tries shine the moment "prefix" or "autocomplete" appears — that's the tell to add to your [14 — Pattern Recognition](./14-pattern-recognition.md) cheat sheet. The hardest trie problems (e.g. Word Search II) combine the trie with [backtracking](./12-backtracking.md): the trie prunes the search the instant a path can't spell any word.
