// @ts-check
/*
 * Study-HTML v2 generator for the CodeFundamentals repo.
 *
 * Produces a SINGLE self-contained HTML app (study-html/study.html) that embeds
 * every Markdown doc as a navigable "chapter". No source .md file is modified.
 *
 * Enhancements over v1 (driven by the user's requirements):
 *  - Interactivity: live client-side search, collapsible solutions, copy
 *    buttons, theme toggle, keyboard nav (j/k, / to search), and interactive
 *    algorithm visualisers (two pointers, sliding window, binary search).
 *  - Thoughtful progression: chapters are ordered into "Parts" (Start Here →
 *    Fundamentals → Advanced → Interview tracks → Projects) with prev/next
 *    paging and a per-chapter progress indicator.
 *  - Easy-to-follow diagrams: Mermaid renders clean flow/sequence diagrams for
 *    the system-design & architecture docs; other ASCII art renders in a tidy
 *    framed "diagram" panel (monospace, preserved) so nothing is ever mangled.
 *  - Readable text: constrained measure (~70ch), larger line-height, dark/light
 *    themes, sticky chapter list.
 *  - References: a curated per-chapter "Further reading" list is injected, plus
 *    a global References chapter.
 *  - Chapter list: a persistent sidebar with Parts, plus an in-page TOC.
 *
 * Only the two docs/extras files get math (KaTeX via MathJax); elsewhere `$` is
 * C# interpolation / SQL placeholders.
 *
 * No npm packages; Markdown is parsed by the mini-parser below. Mermaid,
 * highlight.js and MathJax load from CDNs so the single file stays portable.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const OUT_FILE = path.resolve(__dirname, "..", "study.html");

/* ---------------------------------------------------------------------------
 * Chapter model: ordered Parts give the "thoughtful progression".
 * ------------------------------------------------------------------------- */
const PARTS = [
  {
    title: "Start Here",
    chapters: [
      ["readme", "README.md", "Project Overview"],
      ["dev", "DEVELOPMENT.md", "Development Guide"],
      ["learn-readme", "docs/code-learning/README.md", "Learning Plan"],
    ],
  },
  {
    title: "Fundamentals — Coding Patterns",
    chapters: [
      ["arrays", "docs/code-learning/01-arrays-and-strings.md", "1 · Arrays & Strings"],
      ["hashmaps", "docs/code-learning/02-hash-maps-and-sets.md", "2 · Hash Maps & Sets"],
      ["twoptr", "docs/code-learning/03-two-pointers.md", "3 · Two Pointers"],
      ["window", "docs/code-learning/04-sliding-window.md", "4 · Sliding Window"],
      ["stacks", "docs/code-learning/05-stacks-and-queues.md", "5 · Stacks & Queues"],
      ["binsearch", "docs/code-learning/06-sorting-and-binary-search.md", "6 · Sorting & Binary Search"],
      ["lists", "docs/code-learning/07-linked-lists.md", "7 · Linked Lists"],
      ["trees", "docs/code-learning/08-trees-and-recursion.md", "8 · Trees & Recursion"],
      ["dp", "docs/code-learning/09-dynamic-programming-intro.md", "9 · Dynamic Programming"],
      ["graphs", "docs/code-learning/10-graphs.md", "10 · Graphs"],
      ["heaps", "docs/code-learning/11-heaps-priority-queues.md", "11 · Heaps & Priority Queues"],
      ["backtracking", "docs/code-learning/12-backtracking.md", "12 · Backtracking"],
      ["dp-patterns", "docs/code-learning/13-dynamic-programming-patterns.md", "13 · DP Patterns"],
      ["pattern-recognition", "docs/code-learning/14-pattern-recognition.md", "14 · Pattern Recognition"],
    ],
  },
  {
    title: "Advanced Extras",
    chapters: [
      ["twoptr-adv", "docs/extras/two-pointers-mastery.md", "15 · Advanced Two Pointers"],
      ["space", "docs/extras/space-complexity-guide.md", "16 · Space Complexity"],
    ],
  },
  {
    title: "Interview Prep — Generic",
    chapters: [
      ["g-readme", "docs/interview-prep-generic/README.md", "Overview"],
      ["g-sd", "docs/interview-prep-generic/01-system-design.md", "System Design"],
      ["g-algo", "docs/interview-prep-generic/02-coding-algorithms.md", "Coding & Algorithms"],
      ["g-beh", "docs/interview-prep-generic/03-behavioural.md", "Behavioural"],
      ["g-api", "docs/interview-prep-generic/04-api-design-distributed-systems.md", "API & Distributed Systems"],
      ["g-db", "docs/interview-prep-generic/05-database-data-modelling.md", "Database & Data Modelling"],
      ["g-blocks", "docs/interview-prep-generic/06-system-design-building-blocks.md", "System Design Building Blocks"],
    ],
  },
  {
    title: "Interview Prep — .NET",
    chapters: [
      ["d-readme", "docs/interview-prep-dotnet/README.md", "Overview"],
      ["d-sd", "docs/interview-prep-dotnet/01-system-design.md", "System Design"],
      ["d-algo", "docs/interview-prep-dotnet/02-coding-algorithms.md", "Coding & Algorithms"],
      ["d-beh", "docs/interview-prep-dotnet/03-behavioural.md", "Behavioural"],
      ["d-api", "docs/interview-prep-dotnet/04-api-design-distributed-systems.md", "API & Distributed Systems"],
      ["d-db", "docs/interview-prep-dotnet/05-database-data-modelling.md", "Database & Data Modelling"],
    ],
  },
  {
    title: "Interview Prep — Monzo",
    chapters: [
      ["m-readme", "docs/interview-prep-monzo/README.md", "Overview"],
      ["m-sd", "docs/interview-prep-monzo/01-system-design.md", "System Design"],
      ["m-algo", "docs/interview-prep-monzo/02-coding-algorithms.md", "Coding & Algorithms"],
      ["m-beh", "docs/interview-prep-monzo/03-behavioural.md", "Behavioural"],
      ["m-api", "docs/interview-prep-monzo/04-api-design-distributed-systems.md", "API & Distributed Systems"],
      ["m-db", "docs/interview-prep-monzo/05-database-data-modelling.md", "Database & Data Modelling"],
      ["m-assess", "docs/monzo-role-assessment.md", "Role Assessment"],
    ],
  },
  {
    title: "Personal Projects",
    chapters: [
      ["p-readme", "docs/personal-projects/README.md", "Overview & Roadmap"],
      ["p-go", "docs/personal-projects/01-go-rest-api.md", "1 · Go Transaction API"],
      ["p-kafka", "docs/personal-projects/02-event-driven-kafka.md", "2 · Event-Driven Kafka"],
      ["p-resil", "docs/personal-projects/03-resilient-payment-service.md", "3 · Resilient Payment Service"],
      ["p-practice", "docs/personal-projects/04-coding-practice-plan.md", "4 · Coding Practice Plan"],
    ],
  },
];

const MATH_FILES = new Set([
  "docs/extras/two-pointers-mastery.md",
  "docs/extras/space-complexity-guide.md",
]);

/* Curated "Further reading" references per chapter id. */
const REFERENCES = {
  arrays: [
    ["NeetCode — Arrays & Hashing", "https://neetcode.io/roadmap"],
    ["MS Docs — StringBuilder Class", "https://learn.microsoft.com/dotnet/api/system.text.stringbuilder"],
  ],
  hashmaps: [
    ["MS Docs — Dictionary<TKey,TValue>", "https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2"],
    ["NeetCode — Hashing patterns", "https://neetcode.io/roadmap"],
  ],
  twoptr: [["LeetCode — Two Pointers tag", "https://leetcode.com/tag/two-pointers/"]],
  window: [["LeetCode — Sliding Window tag", "https://leetcode.com/tag/sliding-window/"]],
  stacks: [["MS Docs — Stack<T> / Queue<T>", "https://learn.microsoft.com/dotnet/api/system.collections.generic.stack-1"]],
  binsearch: [["LeetCode — Binary Search tag", "https://leetcode.com/tag/binary-search/"]],
  lists: [["Visualgo — Linked List", "https://visualgo.net/en/list"]],
  trees: [["Visualgo — Binary Search Tree", "https://visualgo.net/en/bst"]],
  dp: [["MIT OCW — Dynamic Programming", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/"]],
  graphs: [
    ["NeetCode — Graphs roadmap", "https://neetcode.io/roadmap"],
    ["Visualgo — Graph traversal (BFS/DFS)", "https://visualgo.net/en/dfsbfs"],
    ["Visualgo — Union-Find (Disjoint Sets)", "https://visualgo.net/en/ufds"],
  ],
  heaps: [
    ["MS Docs — PriorityQueue<TElement,TPriority>", "https://learn.microsoft.com/dotnet/api/system.collections.generic.priorityqueue-2"],
    ["Python docs — heapq", "https://docs.python.org/3/library/heapq.html"],
    ["Visualgo — Binary Heap", "https://visualgo.net/en/heap"],
  ],
  backtracking: [
    ["NeetCode — Backtracking roadmap", "https://neetcode.io/roadmap"],
    ["LeetCode — Backtracking tag", "https://leetcode.com/tag/backtracking/"],
  ],
  "dp-patterns": [
    ["NeetCode — 1-D & 2-D DP", "https://neetcode.io/roadmap"],
    ["LeetCode — Dynamic Programming tag", "https://leetcode.com/tag/dynamic-programming/"],
  ],
  "pattern-recognition": [
    ["NeetCode 150 (patterns, grouped)", "https://neetcode.io/practice"],
    ["Blind 75", "https://www.teamblind.com/post/New-Year-Gift---Curated-List-of-Top-75-LeetCode-Questions-to-Save-Your-Time-OaM1orEU"],
    ["Tech Interview Handbook — Algorithms", "https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/"],
  ],
  "twoptr-adv": [["LeetCode — Container With Most Water", "https://leetcode.com/problems/container-with-most-water/"]],
  space: [["Big-O Cheat Sheet", "https://www.bigocheatsheet.com/"]],
  "g-sd": [
    ["System Design Primer (GitHub)", "https://github.com/donnemartin/system-design-primer"],
    ["ByteByteGo", "https://bytebytego.com/"],
  ],
  "d-sd": [["Microsoft — Azure Architecture Center", "https://learn.microsoft.com/azure/architecture/"]],
  "m-sd": [["Monzo Engineering Blog", "https://monzo.com/blog/technology"]],
  "g-api": [["Microsoft REST API Guidelines", "https://github.com/microsoft/api-guidelines"]],
  "p-go": [["A Tour of Go", "https://go.dev/tour/"], ["Go by Example", "https://gobyexample.com/"]],
  "p-kafka": [["Apache Kafka Docs", "https://kafka.apache.org/documentation/"]],
  "p-resil": [["Polly (.NET resilience)", "https://www.pollydocs.org/"], ["Release It! — Nygard", "https://pragprog.com/titles/mnee2/release-it-second-edition/"]],
};

/* Hand-authored Mermaid replacements for specific architecture ASCII diagrams.
 * Detection is robust: we strip box-drawing glyphs + whitespace from the ASCII
 * block and test for distinctive label SIGNATURES (order-independent). Only
 * diagrams we can represent faithfully are upgraded; everything else falls back
 * to a tidy framed ASCII panel, so nothing is ever mangled. */
const MERMAID_RULES = [
  {
    // generic 01 — URL shortener
    signature: ["URL Service", "API Gateway", "ClickHouse"],
    mermaid: `flowchart LR
  C([Client]) --> G["API Gateway<br/>(Rate limit)"] --> U[URL Service]
  U --> Cache[("Cache<br/>Redis")]
  U --> DB[("Database<br/>Postgres")]
  U --> AN["Analytics<br/>Kafka → ClickHouse"]`,
  },
  {
    // monzo 01 — payment service
    signature: ["Mobile", "API Gateway", "Payment Service"],
    mermaid: `flowchart LR
  M([Mobile App]) --> G["API Gateway<br/>(Auth/Rate)"] --> P["Payment Service<br/>(Orchestrator)"]`,
  },
  {
    // dotnet 01 — messaging pipeline
    signature: ["ASP.NET", "Service Bus", "Worker Service"],
    mermaid: `flowchart LR
  A["ASP.NET Core API"] --> B["Azure Service Bus<br/>/ RabbitMQ"] --> W["Worker Service<br/>(BackgroundService)"]`,
  },
  {
    // generic 04 — idempotency
    signature: ["POST /orders", "Idempotency", "Gateway"],
    mermaid: `flowchart LR
  C([Client]) -- "POST /orders<br/>Idempotency-Key" --> G[API Gateway] --> I[("Idempotency Store<br/>Redis")]`,
  },
  {
    // monzo 04 — idempotency
    signature: ["POST /pay", "Idempotency", "Gateway"],
    mermaid: `flowchart LR
  C([Client]) -- "POST /pay<br/>Idempotency-Key" --> G[API Gateway] --> I[("Idempotency Store<br/>Redis")]`,
  },
  {
    // kafka project
    signature: ["Transaction API", "Publishes events"],
    mermaid: `flowchart TB
  API["Transaction API<br/>(Go - Producer)"] -- "Publishes events" --> K{{Kafka Topic}}
  K --> C1["Consumer:<br/>Notifications"]
  K --> C2["Consumer:<br/>Analytics"]
  K --> C3["Consumer:<br/>Audit Log"]`,
  },
];

function mermaidForAscii(body) {
  const flat = body.replace(/[┌┐└┘├┤┬┴┼─│▶◀▲▼█\s]+/g, " ");
  for (const rule of MERMAID_RULES) {
    if (rule.signature.every((sig) => flat.includes(sig))) return rule.mermaid;
  }
  return null;
}

/* ---------------------------------------------------------------------------
 * Author-injected diagrams.
 *
 * Some chapters are conceptually rich but have no ASCII art to auto-convert
 * (e.g. Space Complexity). Here we attach purpose-built visuals to a chapter,
 * inserted immediately AFTER the heading whose text contains `afterHeading`.
 *
 * kind:
 *   - "mermaid": a Mermaid definition (rendered to SVG client-side).
 *   - "bigo-chart": a special marker; the client renders an interactive SVG
 *     Big-O growth chart (with toggles). Content string is unused.
 * ------------------------------------------------------------------------- */
const CHAPTER_DIAGRAMS = {
  space: [
    {
      afterHeading: "The Two Components of Space",
      kind: "mermaid",
      caption: "Total memory = input you're given + auxiliary memory you create",
      content: `flowchart LR
  subgraph TOTAL["Total Memory Footprint"]
    direction LR
    IN["Input Space<br/><i>the data passed in</i>"]
    AUX["Auxiliary Space<br/><i>extra memory you allocate</i>"]
  end
  AUX -. "interviewers usually<br/>mean THIS" .-> NOTE([Space Complexity])
  classDef given fill:#ddf4ff,stroke:#0969da;
  classDef extra fill:#dafbe1,stroke:#1a7f37;
  class IN given; class AUX extra;`,
    },
    {
      afterHeading: "The Big-O Hierarchy of Space",
      kind: "bigo-chart",
      caption: "How auxiliary memory grows as the input size n increases — lower is better",
      content: "",
    },
    {
      afterHeading: "Culprit: The Call Stack",
      kind: "mermaid",
      caption: "Recursive Sum(3): each call waits on the next, so 3 frames live at once → O(n) stack space",
      content: `flowchart TB
  A["Sum(3)<br/>waiting for Sum(2)"] --> B["Sum(2)<br/>waiting for Sum(1)"]
  B --> C["Sum(1)<br/>waiting for Sum(0)"]
  C --> D["Sum(0)<br/>returns 0 ✓"]
  D -. "unwind: 0→1→3→6" .-> A
  classDef frame fill:#fff8c5,stroke:#d4a72c;
  classDef base fill:#dafbe1,stroke:#1a7f37;
  class A,B,C frame; class D base;`,
    },
  ],
};

// Insert each configured diagram after its target heading within rendered HTML.
function injectChapterDiagrams(chapterId, html) {
  const diagrams = CHAPTER_DIAGRAMS[chapterId];
  if (!diagrams) return html;
  for (const d of diagrams) {
    // Find the <hN ...>...afterHeading...</hN> and insert right after its close.
    const re = new RegExp(`(<h[1-6][^>]*>(?:(?!</h[1-6]>).)*?${escapeRegExp(d.afterHeading)}(?:(?!</h[1-6]>).)*?</h[1-6]>)`, "s");
    let block;
    if (d.kind === "mermaid") {
      block = `<figure class="diagram-fig"><div class="mermaid">${escapeHtml(d.content)}</div>${d.caption ? `<figcaption>${escapeHtml(d.caption)}</figcaption>` : ""}</figure>`;
    } else if (d.kind === "bigo-chart") {
      block = `<figure class="diagram-fig"><div class="bigo-chart" data-chart="bigo"></div>${d.caption ? `<figcaption>${escapeHtml(d.caption)}</figcaption>` : ""}</figure>`;
    } else {
      continue;
    }
    if (re.test(html)) {
      html = html.replace(re, `$1\n${block}`);
    } else {
      console.warn(`[diagrams] heading not found for "${d.afterHeading}" in chapter ${chapterId}`);
    }
  }
  return html;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ---------------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------------- */
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
let slugCounts = {};
function resetSlugs() {
  slugCounts = {};
}
function slugify(text, prefix) {
  let base = text.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  if (!base) base = "section";
  base = `${prefix}--${base}`;
  if (slugCounts[base] === undefined) {
    slugCounts[base] = 0;
    return base;
  }
  slugCounts[base] += 1;
  return `${base}-${slugCounts[base]}`;
}

/* ---------------------------------------------------------------------------
 * Inline markdown
 * ------------------------------------------------------------------------- */

// Render the small TeX subset used in these docs to self-contained HTML.
// Handles: superscripts (x^2 / x^{2}), \log \times \cdot \rightarrow \le \ge,
// \mathbf{...}, Greek via \alpha etc., and wraps the result in <span class="math">.
// No external math engine needed, so it always renders (even offline).
function renderMathInline(expr) {
  let s = expr.trim();
  // normalise common macros to unicode / markup
  const macros = [
    [/\\mathbf\{([^}]*)\}/g, "<b>$1</b>"],
    [/\\text\{([^}]*)\}/g, "$1"],
    [/\\times/g, "×"],
    [/\\cdot/g, "·"],
    [/\\div/g, "÷"],
    [/\\pm/g, "±"],
    [/\\leq|\\le\b/g, "≤"],
    [/\\geq|\\ge\b/g, "≥"],
    [/\\neq|\\ne\b/g, "≠"],
    [/\\rightarrow|\\to\b/g, "→"],
    [/\\leftarrow/g, "←"],
    [/\\Rightarrow/g, "⇒"],
    [/\\approx/g, "≈"],
    [/\\infty/g, "∞"],
    [/\\log/g, "log"],
    [/\\ln/g, "ln"],
    [/\\alpha/g, "α"],
    [/\\beta/g, "β"],
    [/\\theta/g, "θ"],
    [/\\lambda/g, "λ"],
    [/\\mu/g, "μ"],
    [/\\pi/g, "π"],
    [/\\sum/g, "∑"],
  ];
  for (const [re, rep] of macros) s = s.replace(re, rep);
  // superscripts: x^{...} or x^c  (one token)
  s = s.replace(/\^\{([^}]*)\}/g, (_, g) => `<sup>${g}</sup>`);
  s = s.replace(/\^(\w)/g, (_, g) => `<sup>${g}</sup>`);
  // subscripts: x_{...} or x_c
  s = s.replace(/_\{([^}]*)\}/g, (_, g) => `<sub>${g}</sub>`);
  s = s.replace(/_(\w)/g, (_, g) => `<sub>${g}</sub>`);
  // strip any leftover braces/backslash macros we didn't handle
  s = s.replace(/[{}]/g, "").replace(/\\([a-zA-Z]+)/g, "$1");
  // escape stray < > & that could come from raw input (none expected here)
  s = s.replace(/&(?!#?\w+;)/g, "&amp;");
  return `<span class="math">${s}</span>`;
}

function renderInline(text, opts) {
  const tokens = [];
  const stash = (html) => {
    tokens.push(html);
    return `\u0000${tokens.length - 1}\u0000`;
  };
  text = text.replace(/`([^`]+)`/g, (_, code) => stash(`<code>${escapeHtml(code)}</code>`));
  if (opts.math) {
    // Render the simple TeX subset used in these docs directly to styled HTML.
    // Avoids any runtime math engine / CDN dependency entirely.
    text = text.replace(/\$([^$\n]+)\$/g, (_, expr) => stash(renderMathInline(expr)));
  }
  text = escapeHtml(text);
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, label, href) => {
    const h = rewriteLink(href, opts);
    const external = /^https?:/i.test(h);
    const attrs = external ? ' target="_blank" rel="noopener"' : "";
    return `<a href="${escapeAttr(h)}"${attrs}>${label}</a>`;
  });
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  text = text.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[Number(i)]);
  return text;
}

// Map a .md link to the in-app anchor for that chapter, if known.
function rewriteLink(href, opts) {
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (href.startsWith("#")) return href;
  const hashIndex = href.indexOf("#");
  let file = hashIndex === -1 ? href : href.slice(0, hashIndex);
  // resolve relative to the current chapter's directory
  const abs = path.posix.normalize(path.posix.join(opts.dir, file)).replace(/^\.\//, "");
  const id = opts.srcToId[abs];
  if (id) return `#${id}`;
  // fall back to a harmless anchor
  return `#${opts.chapterId}`;
}

/* ---------------------------------------------------------------------------
 * Block markdown -> HTML
 * ------------------------------------------------------------------------- */
const HLJS_LANG = {
  csharp: "csharp", "c#": "csharp", cs: "csharp", python: "python", py: "python",
  go: "go", golang: "go", yaml: "yaml", yml: "yaml", sql: "sql", json: "json",
  http: "http", bash: "bash", sh: "bash", text: "plaintext", "": "plaintext",
};

function isAsciiDiagram(body) {
  return /[┌┐└┘├┤┬┴┼─│▶◀▲▼█]/.test(body);
}

function parseMarkdown(md, opts) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  const headings = [];
  let i = 0;
  const flush = (buf) => {
    if (buf.length) {
      out.push(`<p>${renderInline(buf.join(" "), opts)}</p>`);
      buf.length = 0;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(/^(\s*)(`{3,}|~{3,})\s*([^\s`~]*)/);
    if (fence) {
      const marker = fence[2][0];
      const lang = (fence[3] || "").toLowerCase();
      const body = [];
      i++;
      while (i < lines.length && !new RegExp(`^\\s*${marker}{3,}\\s*$`).test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++;
      const joined = body.join("\n");
      // ASCII diagram? Try Mermaid upgrade, else framed diagram panel.
      if (!lang && isAsciiDiagram(joined)) {
        const mer = mermaidForAscii(joined);
        if (mer) {
          out.push(`<div class="mermaid">${escapeHtml(mer)}</div>`);
        } else {
          out.push(
            `<figure class="diagram"><figcaption>Diagram</figcaption><pre class="ascii">${escapeHtml(joined)}</pre></figure>`
          );
        }
        continue;
      }
      const hl = HLJS_LANG[lang] ?? "plaintext";
      out.push(
        `<div class="code-wrap" data-lang="${escapeAttr(lang || "text")}">` +
          `<button class="copy-btn" type="button">Copy</button>` +
          `<pre><code class="language-${hl}">${escapeHtml(joined)}</code></pre></div>`
      );
      continue;
    }

    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push("<hr>");
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      const level = heading[1].length;
      const raw = heading[2];
      const id = slugify(raw, opts.chapterId);
      headings.push({ level, text: raw, id });
      out.push(
        `<h${level} id="${id}"><a class="anchor" href="#${id}">#</a>${renderInline(raw, opts)}</h${level}>`
      );
      i++;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${parseMarkdown(buf.join("\n"), opts).html}</blockquote>`);
      continue;
    }

    if (
      /^\s*\|?.+\|.+\|?\s*$/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]+\|[\s:|-]+\|?\s*$/.test(lines[i + 1]) &&
      lines[i + 1].includes("-")
    ) {
      const split = (row) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const header = split(line);
      const aligns = split(lines[i + 1]).map((s) => {
        const l = s.startsWith(":"), r = s.endsWith(":");
        return l && r ? "center" : r ? "right" : l ? "left" : "";
      });
      i += 2;
      const rows = [];
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== "") {
        rows.push(split(lines[i]));
        i++;
      }
      const th = header.map((c, k) => `<th${aligns[k] ? ` style="text-align:${aligns[k]}"` : ""}>${renderInline(c, opts)}</th>`).join("");
      const tb = rows.map((r) => `<tr>${r.map((c, k) => `<td${aligns[k] ? ` style="text-align:${aligns[k]}"` : ""}>${renderInline(c, opts)}</td>`).join("")}</tr>`).join("");
      out.push(`<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`);
      continue;
    }

    if (/^(\s*)([-*+]|\d+[.)])\s+/.test(line)) {
      const { html, next } = parseList(lines, i, opts);
      out.push(html);
      i = next;
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !/^\s*(`{3,}|~{3,})/.test(lines[i]) &&
      !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i]) &&
      !/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i])
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    flush(buf);
  }
  return { html: out.join("\n"), headings };
}

function parseList(lines, start, opts) {
  const baseIndent = lines[start].match(/^(\s*)/)[1].length;
  const ordered = /^\s*\d+[.)]\s+/.test(lines[start]);
  const items = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      if (i + 1 < lines.length && /^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i + 1]) && lines[i + 1].match(/^(\s*)/)[1].length >= baseIndent) {
        i++;
        continue;
      }
      break;
    }
    const m = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (!m) break;
    const indent = m[1].length;
    if (indent < baseIndent) break;
    if (indent > baseIndent) {
      const { html, next } = parseList(lines, i, opts);
      if (items.length) items[items.length - 1].children.push(html);
      i = next;
      continue;
    }
    let content = m[3];
    let task = null;
    const tm = content.match(/^\[([ xX])\]\s+(.*)$/);
    if (tm) {
      task = tm[1].toLowerCase() === "x";
      content = tm[2];
    }
    items.push({ content, children: [], task });
    i++;
  }
  const tag = ordered ? "ol" : "ul";
  const isTask = items.some((it) => it.task !== null);
  const body = items.map((it) => {
    const inner = renderInline(it.content, opts) + it.children.join("");
    if (it.task !== null) return `<li class="task-item"><input type="checkbox" disabled${it.task ? " checked" : ""}> ${inner}</li>`;
    return `<li>${inner}</li>`;
  }).join("");
  return { html: `<${tag}${isTask ? ' class="task-list"' : ""}>${body}</${tag}>`, next: i };
}

/* ---------------------------------------------------------------------------
 * Build
 * ------------------------------------------------------------------------- */
function h1Title(headings, fallback) {
  const h = headings.find((x) => x.level === 1);
  return h ? plainHeading(h.text) : fallback;
}

// Readable plain-text form of a heading (for TOC/titles): drop markdown code
// ticks and math delimiters, and de-TeX common tokens so e.g. "$O(\log n)$"
// reads as "O(log n)" instead of raw LaTeX.
function plainHeading(text) {
  return text
    .replace(/`/g, "")
    .replace(/\$([^$]*)\$/g, "$1") // strip inline-math delimiters
    .replace(/\\log/g, "log")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\^2\b/g, "²")
    .replace(/\^\{?2\}?/g, "²")
    .replace(/\\[a-zA-Z]+/g, "") // drop any other TeX macros
    .replace(/[{}]/g, "")
    .trim();
}

function referencesHtml(id) {
  const refs = REFERENCES[id];
  if (!refs || !refs.length) return "";
  const items = refs.map(([label, url]) => `<li><a href="${escapeAttr(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></li>`).join("");
  return `<section class="refs"><h2>🔗 Further reading</h2><ul>${items}</ul></section>`;
}

async function main() {
  // Flatten chapters + build src->id map for link rewriting.
  const flat = [];
  const srcToId = {};
  for (const part of PARTS) {
    for (const [id, src] of part.chapters) srcToId[src] = id;
  }

  for (const part of PARTS) {
    for (const [id, src, navLabel] of part.chapters) {
      const abs = path.join(REPO_ROOT, src);
      let md;
      try {
        md = await fs.readFile(abs, "utf8");
      } catch {
        console.warn("skip (missing):", src);
        continue;
      }
      resetSlugs();
      const math = MATH_FILES.has(src);
      const dir = path.posix.dirname(src.split(path.sep).join("/"));
      const { html, headings } = parseMarkdown(md, { math, dir, srcToId, chapterId: id });
      const htmlWithDiagrams = injectChapterDiagrams(id, html);
      const title = h1Title(headings, navLabel);
      flat.push({ id, src, navLabel, part: part.title, math, html: htmlWithDiagrams, headings, title });
    }
  }

  const anyMath = flat.some((c) => c.math);

  // Sidebar (chapter list grouped by Part)
  let partNum = 0;
  const sidebar = PARTS.map((part) => {
    const chaps = part.chapters.map(([id]) => flat.find((c) => c.id === id)).filter(Boolean);
    if (!chaps.length) return "";
    partNum++;
    const links = chaps.map((c) =>
      `<li><a class="nav-link" data-chapter="${c.id}" href="#${c.id}">${escapeHtml(c.navLabel)}</a></li>`
    ).join("");
    return `<li class="nav-part"><span class="part-label">${escapeHtml(part.title)}</span><ul>${links}</ul></li>`;
  }).join("");

  // Chapter sections
  const sections = flat.map((c, idx) => {
    const toc = c.headings.filter((h) => h.level >= 2 && h.level <= 3);
    const tocHtml = toc.length
      ? `<nav class="chapter-toc"><span class="toc-head">On this page</span><ul>${toc.map((h) => `<li class="t${h.level}"><a href="#${h.id}">${escapeHtml(plainHeading(h.text))}</a></li>`).join("")}</ul></nav>`
      : "";
    const prev = flat[idx - 1];
    const next = flat[idx + 1];
    const pager =
      `<nav class="pager">` +
      (prev ? `<a class="pg prev" data-goto="${prev.id}" href="#${prev.id}">← ${escapeHtml(prev.navLabel)}</a>` : "<span></span>") +
      (next ? `<a class="pg next" data-goto="${next.id}" href="#${next.id}">${escapeHtml(next.navLabel)} →</a>` : "<span></span>") +
      `</nav>`;
    return `<section class="chapter${c.math ? " has-math" : ""}" id="${c.id}" data-part="${escapeAttr(c.part)}">
<div class="chapter-head"><span class="part-tag">${escapeHtml(c.part)}</span></div>
${tocHtml}
<article class="doc">
${c.html}
</article>
${referencesHtml(c.id)}
${pager}
</section>`;
  }).join("\n");

  const searchIndex = JSON.stringify(
    flat.map((c) => ({ id: c.id, title: c.title, label: c.navLabel, part: c.part }))
  );

  const mathScript = ""; // math is now rendered at build time — no runtime engine needed

  const htmlDoc = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CodeFundamentals — Interactive Study</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css">
<link rel="stylesheet" media="(prefers-color-scheme: dark)" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css">
<style>${CSS}</style>
${mathScript}
</head>
<body>
<div class="progress"><span></span></div>

<header class="topbar">
  <button id="menu" class="icon" aria-label="Toggle chapters">☰</button>
  <span class="brand">📚 CodeFundamentals <b>Interactive Study</b></span>
  <div class="spacer"></div>
  <div class="search-box"><input id="search" type="search" placeholder="Search chapters…  ( / )" autocomplete="off">
    <div id="results" class="results" hidden></div></div>
  <button id="theme" class="icon" aria-label="Toggle theme">🌓</button>
</header>

<div class="shell">
  <aside class="sidebar" id="sidebar">
    <nav aria-label="Chapters"><ul class="nav">${sidebar}</ul></nav>
  </aside>
  <main class="main" id="main">
    ${sections}
    <footer class="foot">Interactive study edition · generated from the repo's Markdown · originals unchanged.</footer>
  </main>
</div>

<script id="search-index" type="application/json">${searchIndex}</script>
<script defer src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
window.__mermaid = mermaid;
</script>
<script>${JS}</script>
</body>
</html>`;

  await fs.writeFile(OUT_FILE, htmlDoc, "utf8");
  console.log(`Wrote ${flat.length} chapters into single file: ${OUT_FILE}`);
}

/* ---------------------------------------------------------------------------
 * CSS + JS (embedded)
 * ------------------------------------------------------------------------- */
const CSS = String.raw`
:root{--bg:#fff;--fg:#1f2328;--muted:#656d76;--border:#d0d7de;--surface:#f6f8fa;--surface2:#eef1f4;
--accent:#0969da;--accent-weak:#ddf4ff;--code-bg:#f6f8fa;--ok:#1a7f37;--shadow:rgba(31,35,40,.08);--sidebar-w:300px;}
html[data-theme=dark]{--bg:#0d1117;--fg:#e6edf3;--muted:#8b949e;--border:#30363d;--surface:#161b22;--surface2:#1c2430;
--accent:#58a6ff;--accent-weak:#132032;--code-bg:#161b22;--ok:#3fb950;--shadow:rgba(0,0,0,.5);}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font:16.5px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:120}
.progress span{display:block;height:100%;width:0;background:var(--accent)}
.topbar{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:12px;padding:9px 16px;background:var(--surface);border-bottom:1px solid var(--border)}
.brand{font-weight:600}.brand b{color:var(--muted);font-weight:500}
.spacer{flex:1}
.icon{cursor:pointer;border:1px solid var(--border);background:var(--bg);color:var(--fg);border-radius:8px;padding:6px 10px;font-size:15px;line-height:1}
.icon:hover{border-color:var(--accent)}
.search-box{position:relative}
#search{width:260px;max-width:40vw;padding:8px 12px;border:1px solid var(--border);border-radius:9px;background:var(--bg);color:var(--fg);font-size:14px}
#search:focus{outline:2px solid var(--accent);border-color:var(--accent)}
.results{position:absolute;top:110%;right:0;width:340px;max-height:60vh;overflow:auto;background:var(--bg);border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 24px var(--shadow);z-index:110}
.results a{display:block;padding:9px 13px;text-decoration:none;color:var(--fg);border-bottom:1px solid var(--border)}
.results a:last-child{border-bottom:none}
.results a:hover,.results a.sel{background:var(--accent-weak)}
.results .r-part{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.shell{display:grid;grid-template-columns:var(--sidebar-w) minmax(0,1fr)}
.sidebar{position:sticky;top:51px;align-self:start;height:calc(100vh - 51px);overflow:auto;padding:16px 10px;border-right:1px solid var(--border);background:var(--surface)}
.nav{list-style:none;margin:0;padding:0}
.nav-part{margin:0 0 14px}
.part-label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);padding:4px 10px;font-weight:700}
.nav-part ul{list-style:none;margin:2px 0 0;padding:0}
.nav-link{display:block;padding:6px 12px;margin:1px 0;border-radius:7px;text-decoration:none;color:var(--fg);font-size:14px;border-left:2px solid transparent}
.nav-link:hover{background:var(--surface2)}
.nav-link.active{background:var(--accent-weak);color:var(--accent);border-left-color:var(--accent);font-weight:600}
.main{min-width:0;padding:0 44px 90px;max-width:1040px}
.chapter{display:none;padding-top:26px}
.chapter.visible{display:block;animation:fade .25s ease}
@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.chapter-head{margin-bottom:6px}
.part-tag{display:inline-block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);background:var(--accent-weak);padding:3px 10px;border-radius:999px}
.chapter-toc{float:right;width:240px;margin:6px 0 16px 24px;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--surface);font-size:13.5px}
.chapter-toc .toc-head{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:700}
.chapter-toc ul{list-style:none;margin:8px 0 0;padding:0}
.chapter-toc li{margin:3px 0}.chapter-toc .t3{padding-left:14px;font-size:12.5px}
.chapter-toc a{text-decoration:none;color:var(--muted)}.chapter-toc a:hover,.chapter-toc a.active{color:var(--accent)}
.doc{max-width:74ch}
.doc h1{font-size:2.05rem;line-height:1.2;margin:.1em 0 .5em;padding-bottom:.25em;border-bottom:2px solid var(--border)}
.doc h2{font-size:1.5rem;margin:1.7em 0 .5em;padding-bottom:.2em;border-bottom:1px solid var(--border)}
.doc h3{font-size:1.2rem;margin:1.4em 0 .4em}.doc h4{font-size:1.03rem;margin:1.2em 0 .3em}
.anchor{opacity:0;text-decoration:none;color:var(--muted);margin-right:.35em}
h1:hover .anchor,h2:hover .anchor,h3:hover .anchor{opacity:.55}
.doc a{color:var(--accent);text-decoration:none}.doc a:hover{text-decoration:underline}
.doc p{margin:.7em 0}.doc ul,.doc ol{margin:.6em 0;padding-left:1.5em}.doc li{margin:.25em 0}
.task-list{list-style:none;padding-left:.2em}.task-item{display:flex;gap:.5em;align-items:flex-start}.task-item input{margin-top:.5em}
blockquote{margin:1em 0;padding:.5em 1em;border-left:4px solid var(--accent);background:var(--accent-weak);border-radius:0 8px 8px 0}
blockquote p{margin:.35em 0}
blockquote.ddia{border-left-color:#8250df;background:color-mix(in srgb, #8250df 10%, transparent)}
html[data-theme=dark] blockquote.ddia{background:color-mix(in srgb, #8250df 22%, transparent)}
code{font-family:"SFMono-Regular",Consolas,Menlo,monospace;font-size:.86em;background:var(--code-bg);padding:.15em .4em;border-radius:5px;border:1px solid var(--border)}
.math{font-family:"Cambria Math","Latin Modern Math",Georgia,"Times New Roman",serif;font-style:italic;white-space:nowrap;padding:0 .05em}
.math sup,.math sub{font-style:normal}
.math b{font-style:normal;font-weight:700}
h1 .math,h2 .math,h3 .math,h4 .math{font-size:.95em}
.code-wrap{position:relative;margin:1.1em 0}
.code-wrap::before{content:attr(data-lang);position:absolute;top:0;left:0;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);background:var(--surface);padding:2px 9px;border:1px solid var(--border);border-bottom:none;border-radius:8px 0 0 0}
.code-wrap pre{margin:0;padding:28px 15px 13px;overflow:auto;background:var(--code-bg);border:1px solid var(--border);border-radius:9px}
.code-wrap pre code{background:none;border:none;padding:0;font-size:13.5px;line-height:1.55}
.copy-btn{position:absolute;top:4px;right:6px;cursor:pointer;font-size:11px;border:1px solid var(--border);background:var(--bg);color:var(--muted);border-radius:6px;padding:3px 9px;z-index:2}
.copy-btn:hover{color:var(--accent);border-color:var(--accent)}.copy-btn.ok{color:var(--ok);border-color:var(--ok)}
figure.diagram{margin:1.2em 0;border:1px solid var(--border);border-radius:10px;background:var(--surface);overflow:hidden}
figure.diagram figcaption{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);padding:6px 12px;border-bottom:1px solid var(--border);background:var(--surface2)}
pre.ascii{margin:0;padding:14px 16px;overflow:auto;font-family:"SFMono-Regular",Consolas,Menlo,monospace;font-size:12.5px;line-height:1.35;white-space:pre}
.mermaid{margin:1.2em 0;padding:14px;border:1px solid var(--border);border-radius:10px;background:var(--surface);text-align:center;overflow:auto}
figure.diagram-fig{margin:1.3em 0;max-width:74ch}
figure.diagram-fig .mermaid{margin:0}
figure.diagram-fig figcaption{font-size:12.5px;color:var(--muted);text-align:center;margin-top:6px;font-style:italic}
.bigo-chart{border:1px solid var(--border);border-radius:10px;background:var(--surface);padding:14px 14px 8px}
.bigo-chart svg{width:100%;height:auto;display:block}
.bigo-chart .bigo-toggles{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px}
.bigo-chart .bigo-toggles button{cursor:pointer;border:1px solid var(--border);background:var(--bg);color:var(--fg);border-radius:999px;padding:4px 12px;font-size:12.5px;display:flex;align-items:center;gap:6px}
.bigo-chart .bigo-toggles button .sw{width:11px;height:11px;border-radius:3px;display:inline-block}
.bigo-chart .bigo-toggles button.off{opacity:.4}
.bigo-chart .bigo-slider{display:flex;align-items:center;gap:10px;justify-content:center;margin-top:8px;font-size:13px;color:var(--muted)}
.bigo-chart .bigo-slider input{flex:1;max-width:260px}
.table-wrap{overflow:auto;margin:1.1em 0}
table{border-collapse:collapse;width:100%;font-size:14.5px}
th,td{border:1px solid var(--border);padding:7px 11px;text-align:left}
thead th{background:var(--surface)}tbody tr:nth-child(even){background:var(--surface)}
hr{border:none;border-top:1px solid var(--border);margin:1.7em 0}
details.solution{margin:1em 0;border:1px solid var(--border);border-radius:9px;background:var(--surface);max-width:74ch}
details.solution>summary{cursor:pointer;padding:10px 14px;font-weight:600;list-style:none}
details.solution>summary::-webkit-details-marker{display:none}
details.solution>summary::before{content:"▶";color:var(--accent);margin-right:8px;font-size:.8em;display:inline-block;transition:.15s}
details.solution[open]>summary::before{transform:rotate(90deg)}
details.solution>div{padding:0 14px 8px}
.refs{margin:2em 0 0;padding:14px 18px;border:1px dashed var(--border);border-radius:10px;background:var(--surface);max-width:74ch}
.refs h2{border:none;font-size:1.05rem;margin:.2em 0 .5em}
.refs ul{margin:0;padding-left:1.2em}
.pager{display:flex;justify-content:space-between;gap:12px;margin:40px 0 0;max-width:74ch}
.pg{text-decoration:none;color:var(--accent);border:1px solid var(--border);border-radius:9px;padding:10px 14px;font-size:14px;max-width:48%}
.pg:hover{border-color:var(--accent);background:var(--accent-weak)}
.foot{margin-top:50px;padding-top:16px;border-top:1px solid var(--border);color:var(--muted);font-size:13px}
/* algorithm visualiser widget */
.viz{margin:1.3em 0;padding:16px;border:1px solid var(--accent);border-radius:12px;background:var(--surface);max-width:74ch}
.viz-title{font-weight:700;margin:0 0 4px}
.viz-sub{font-size:13px;color:var(--muted);margin:0 0 12px}
.viz-array{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
.viz-cell{position:relative;min-width:40px;height:46px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:8px;background:var(--bg);font-family:monospace;font-size:15px;transition:.2s}
.viz-cell .idx{position:absolute;top:-16px;font-size:10px;color:var(--muted)}
.viz-cell.inwin{background:var(--accent-weak);border-color:var(--accent)}
.viz-cell.ptrL{box-shadow:inset 0 -4px 0 #d29922}
.viz-cell.ptrR{box-shadow:inset 0 -4px 0 #8250df}
.viz-cell.ptrL.ptrR{box-shadow:inset 0 -4px 0 #cf222e}
.viz-cell.lo{box-shadow:inset 0 -4px 0 #d29922}
.viz-cell.hi{box-shadow:inset 0 -4px 0 #8250df}
.viz-cell.mid{background:var(--accent-weak);border-color:var(--accent);font-weight:700}
.viz-cell.done{background:#1a7f3722;border-color:var(--ok)}
.viz-cell.drop{opacity:.35}
.viz-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}
.viz-controls button{cursor:pointer;border:1px solid var(--border);background:var(--bg);color:var(--fg);border-radius:8px;padding:6px 12px;font-size:13px}
.viz-controls button:hover{border-color:var(--accent)}
.viz-controls button:disabled{opacity:.4;cursor:default}
.viz-status{font-size:13.5px;margin-top:10px;min-height:1.4em;color:var(--fg)}
.viz-legend{font-size:12px;color:var(--muted);margin-top:8px;display:flex;gap:14px;flex-wrap:wrap}
.viz-legend span::before{content:"";display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:middle}
.lg-l::before{background:#d29922}.lg-r::before{background:#8250df}.lg-w::before{background:var(--accent)}
@media(max-width:1024px){.chapter-toc{display:none}}
@media(max-width:860px){
 .shell{grid-template-columns:1fr}
 .sidebar{position:fixed;left:0;top:51px;width:var(--sidebar-w);z-index:90;transform:translateX(-100%);transition:transform .22s}
 .sidebar.open{transform:none}
 .main{padding:0 18px 70px}#search{width:150px}
}
@media print{.topbar,.sidebar,.progress,.pager,.copy-btn,.chapter-toc{display:none!important}
 .shell{display:block}.main{padding:0;max-width:none}.chapter{display:block!important}
 details.solution>div{display:block!important}a{color:inherit}}
`;

const JS = String.raw`
(function(){
"use strict";
var INDEX=JSON.parse(document.getElementById('search-index').textContent);
var chapters=[].slice.call(document.querySelectorAll('.chapter'));
var order=chapters.map(function(c){return c.id;});

/* theme */
var stored=localStorage.getItem('cf2-theme');
if(stored)document.documentElement.setAttribute('data-theme',stored);
document.getElementById('theme').addEventListener('click',function(){
  var d=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',d);localStorage.setItem('cf2-theme',d);
  renderMermaid(true);
  document.querySelectorAll('.bigo-chart').forEach(function(h){if(h.__redraw)h.__redraw();});
});

/* sidebar toggle (mobile) */
var sb=document.getElementById('sidebar');
document.getElementById('menu').addEventListener('click',function(){sb.classList.toggle('open');});

/* chapter routing */
function showChapter(id,push){
  if(order.indexOf(id)===-1)id=order[0];
  chapters.forEach(function(c){c.classList.toggle('visible',c.id===id);});
  document.querySelectorAll('.nav-link').forEach(function(a){a.classList.toggle('active',a.dataset.chapter===id);});
  if(push)history.replaceState(null,'',' '+'#'+id);
  window.scrollTo({top:0});
  var active=document.querySelector('.nav-link.active');
  if(active)active.scrollIntoView({block:'nearest'});
  enhance(document.getElementById(id));
  renderMermaid(false);
  if(window.innerWidth<=860)sb.classList.remove('open');
  buildChapterSpy(document.getElementById(id));
}
function parseHash(){
  var h=decodeURIComponent(location.hash.replace(/^#/,''));
  if(!h)return{chapter:order[0],anchor:null};
  // anchor ids look like "<chapterId>--<slug>"; chapterId may contain no '--'
  var found=order.filter(function(id){return h===id||h.indexOf(id+'--')===0;})
                 .sort(function(a,b){return b.length-a.length;})[0];
  return{chapter:found||order[0],anchor:h};
}
function go(){
  var p=parseHash();
  showChapter(p.chapter,false);
  if(p.anchor&&p.anchor!==p.chapter){
    var el=document.getElementById(p.anchor);
    if(el)setTimeout(function(){el.scrollIntoView();},40);
  }
}
window.addEventListener('hashchange',go);

/* nav + pager clicks */
document.addEventListener('click',function(e){
  var link=e.target.closest('.nav-link,[data-goto]');
  if(link){
    var id=link.dataset.chapter||link.dataset.goto;
    if(id){e.preventDefault();location.hash=id;}
  }
});

/* enhancements applied lazily per chapter (idempotent) */
function enhance(root){
  if(!root||root.dataset.enhanced)return;
  // highlight
  if(window.hljs)root.querySelectorAll('pre code').forEach(function(b){window.hljs.highlightElement(b);});
  // copy buttons
  root.querySelectorAll('.copy-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var code=btn.parentElement.querySelector('code');if(!code)return;
      navigator.clipboard.writeText(code.innerText).then(function(){
        btn.textContent='Copied!';btn.classList.add('ok');
        setTimeout(function(){btn.textContent='Copy';btn.classList.remove('ok');},1300);
      });
    });
  });
  // collapsible solutions
  root.querySelectorAll('.doc p').forEach(function(p){
    var t=(p.textContent||'').trim().toLowerCase();
    if(t==='solution:'||t==='solution'||t==='solution (variable window):'){
      var det=document.createElement('details');det.className='solution';
      var s=document.createElement('summary');s.textContent='Show solution';
      var box=document.createElement('div');det.appendChild(s);det.appendChild(box);
      p.parentNode.insertBefore(det,p);
      var n=p.nextElementSibling,move=[];
      while(n&&(n.classList.contains('code-wrap')||(n.tagName==='P'&&n.textContent.indexOf('⏱')===0))){move.push(n);n=n.nextElementSibling;}
      move.forEach(function(el){box.appendChild(el);});p.remove();
    }
  });
  // inject algorithm visualisers where relevant
  injectViz(root);
  // render any author-injected Big-O charts
  renderBigOCharts(root);
  // tag reading-companion (📖) blockquotes so they get the callout style
  root.querySelectorAll('.doc blockquote').forEach(function(bq){
    var t=(bq.textContent||'').trim();
    if(t.indexOf('📖')===0||t.indexOf('DDIA')===0)bq.classList.add('ddia');
  });
  root.dataset.enhanced='1';
}

/* ---- Mermaid ---- */
var mermaidReady=false;
function renderMermaid(force){
  var m=window.__mermaid;if(!m)return setTimeout(function(){renderMermaid(force);},120);
  var dark=document.documentElement.getAttribute('data-theme')==='dark';
  if(!mermaidReady||force){
    m.initialize({startOnLoad:false,theme:dark?'dark':'default',securityLevel:'loose'});
    mermaidReady=true;
    if(force){ // re-render all already-rendered diagrams on theme switch
      document.querySelectorAll('.mermaid[data-processed]').forEach(function(d){
        d.removeAttribute('data-processed');d.innerHTML=d.getAttribute('data-src')||d.textContent;
      });
    }
  }
  var nodes=[].slice.call(document.querySelectorAll('.chapter.visible .mermaid:not([data-processed])'));
  nodes.forEach(function(n){if(!n.getAttribute('data-src'))n.setAttribute('data-src',n.textContent);});
  if(nodes.length)m.run({nodes:nodes});
}

/* ---- per-chapter scroll spy for the floating TOC ---- */
function buildChapterSpy(root){
  if(!root)return;
  var links=[].slice.call(root.querySelectorAll('.chapter-toc a'));
  if(!links.length)return;
  var map=links.map(function(a){return{a:a,el:document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)))};}).filter(function(x){return x.el;});
  function spy(){var pos=window.scrollY+100,cur=null;map.forEach(function(x){if(x.el.offsetTop<=pos)cur=x;});links.forEach(function(a){a.classList.remove('active');});if(cur)cur.a.classList.add('active');}
  window.removeEventListener('scroll',window.__spy||function(){});window.__spy=spy;window.addEventListener('scroll',spy,{passive:true});spy();
}

/* ---- progress bar ---- */
var bar=document.querySelector('.progress span');
window.addEventListener('scroll',function(){var h=document.documentElement,max=h.scrollHeight-h.clientHeight;bar.style.width=(max>0?h.scrollTop/max*100:0)+'%';},{passive:true});

/* ---- search ---- */
var search=document.getElementById('search'),results=document.getElementById('results'),sel=-1;
function runSearch(){
  var q=search.value.trim().toLowerCase();
  if(!q){results.hidden=true;results.innerHTML='';return;}
  var hits=INDEX.filter(function(c){return (c.title+' '+c.label+' '+c.part).toLowerCase().indexOf(q)!==-1;}).slice(0,12);
  if(!hits.length){results.innerHTML='<a>No matches</a>';results.hidden=false;return;}
  results.innerHTML=hits.map(function(c){return '<a href="#'+c.id+'" data-goto="'+c.id+'"><span class="r-part">'+c.part+'</span><br>'+c.title+'</a>';}).join('');
  results.hidden=false;sel=-1;
}
search.addEventListener('input',runSearch);
search.addEventListener('keydown',function(e){
  var items=[].slice.call(results.querySelectorAll('a[data-goto]'));
  if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(sel+1,items.length-1);}
  else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(sel-1,0);}
  else if(e.key==='Enter'){if(items[sel]){location.hash=items[sel].dataset.goto;search.blur();results.hidden=true;search.value='';}return;}
  else if(e.key==='Escape'){results.hidden=true;search.blur();return;}
  items.forEach(function(a,i){a.classList.toggle('sel',i===sel);});
  if(items[sel])items[sel].scrollIntoView({block:'nearest'});
});
document.addEventListener('click',function(e){if(!e.target.closest('.search-box'))results.hidden=true;});

/* ---- keyboard: j/k chapter nav, / focus search ---- */
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  if(e.key==='/'){e.preventDefault();search.focus();return;}
  var cur=parseHash().chapter,i=order.indexOf(cur);
  if(e.key==='j'&&i<order.length-1)location.hash=order[i+1];
  if(e.key==='k'&&i>0)location.hash=order[i-1];
});

/* =====================================================================
 * Algorithm visualisers — injected into specific chapters by id.
 * Each builds steps[] of {arr-state} and animates with play/step.
 * =================================================================== */
function makeArrayEl(values){
  var wrap=document.createElement('div');wrap.className='viz-array';
  values.forEach(function(v,i){
    var c=document.createElement('div');c.className='viz-cell';c.dataset.i=i;
    c.innerHTML='<span class="idx">'+i+'</span>'+v;wrap.appendChild(c);
  });
  return wrap;
}
function buildViz(opts){
  // opts: {title, sub, values, steps:[{classes:{i:['ptrL']}, status}], legend}
  var box=document.createElement('div');box.className='viz';
  box.innerHTML='<p class="viz-title">▶ '+opts.title+'</p><p class="viz-sub">'+opts.sub+'</p>';
  var arr=makeArrayEl(opts.values);box.appendChild(arr);
  var status=document.createElement('div');status.className='viz-status';box.appendChild(status);
  if(opts.legend){var lg=document.createElement('div');lg.className='viz-legend';lg.innerHTML=opts.legend;box.appendChild(lg);}
  var ctr=document.createElement('div');ctr.className='viz-controls';
  ctr.innerHTML='<button data-a="first">⏮</button><button data-a="prev">◀ Prev</button><button data-a="play">▶ Play</button><button data-a="next">Next ▶</button><span class="viz-step"></span>';
  box.appendChild(ctr);
  var cells=[].slice.call(arr.querySelectorAll('.viz-cell'));
  var step=0,timer=null;
  function apply(){
    var s=opts.steps[step];
    cells.forEach(function(c){c.className='viz-cell';});
    Object.keys(s.classes||{}).forEach(function(i){(s.classes[i]||[]).forEach(function(cl){if(cells[i])cells[i].classList.add(cl);});});
    status.textContent=s.status||'';
    box.querySelector('.viz-step').textContent='Step '+(step+1)+' / '+opts.steps.length;
    ctr.querySelector('[data-a=prev]').disabled=step===0;
    ctr.querySelector('[data-a=next]').disabled=step===opts.steps.length-1;
  }
  function stop(){if(timer){clearInterval(timer);timer=null;ctr.querySelector('[data-a=play]').textContent='▶ Play';}}
  ctr.addEventListener('click',function(e){
    var a=e.target.dataset.a;if(!a)return;
    if(a==='first'){stop();step=0;apply();}
    if(a==='prev'){stop();if(step>0)step--;apply();}
    if(a==='next'){stop();if(step<opts.steps.length-1)step++;apply();}
    if(a==='play'){
      if(timer){stop();return;}
      ctr.querySelector('[data-a=play]').textContent='⏸ Pause';
      timer=setInterval(function(){if(step<opts.steps.length-1){step++;apply();}else stop();},900);
    }
  });
  apply();
  return box;
}
// Two pointers: reverse-in-place style convergence on a palindrome check
function vizTwoPointers(){
  var vals=['r','a','c','e','c','a','r'],steps=[],l=0,r=vals.length-1;
  function snap(st){var cl={};cl[l]=['ptrL'];cl[r]=(cl[r]||[]).concat('ptrR');for(var k=l;k<=r;k++){cl[k]=(cl[k]||[]).concat('inwin');}return{classes:cl,status:st};}
  steps.push(snap('Start: left=0, right='+r+'. Compare ends.'));
  while(l<r){
    steps.push(snap('Compare s['+l+']="'+vals[l]+'" vs s['+r+']="'+vals[r]+'" → '+(vals[l]===vals[r]?'match ✓':'mismatch ✗')));
    l++;r--;
    if(l<=r)steps.push(snap('Move inward: left='+l+', right='+r+'.'));
  }
  steps.push({classes:(function(){var c={};vals.forEach(function(_,i){c[i]=['done'];});return c;})(),status:'Pointers met — string is a palindrome ✓'});
  return buildViz({title:'Two Pointers — Palindrome check',sub:'Watch left/right pointers converge from both ends.',values:vals,steps:steps,
    legend:'<span class="lg-l">left</span><span class="lg-r">right</span><span class="lg-w">in window</span>'});
}
// Sliding window: max sum subarray of size k
function vizSlidingWindow(){
  var vals=[1,3,2,6,4,5],k=3,steps=[],sum=0,best=-Infinity,bestL=0;
  for(var i=0;i<k;i++)sum+=vals[i];
  best=sum;
  function snap(l,r,st){var cl={};for(var x=l;x<=r;x++)cl[x]=['inwin'];cl[l]=(cl[l]||[]).concat('ptrL');cl[r]=(cl[r]||[]).concat('ptrR');return{classes:cl,status:st};}
  steps.push(snap(0,k-1,'Build first window [0..'+(k-1)+'] sum='+sum+' (best='+best+')'));
  for(var rr=k;rr<vals.length;rr++){
    var ll=rr-k+1;
    sum+=vals[rr]-vals[rr-k];
    if(sum>best){best=sum;bestL=ll;}
    steps.push(snap(ll,rr,'Slide: +'+vals[rr]+' −'+vals[rr-k]+' → sum='+sum+' (best='+best+')'));
  }
  steps.push(snap(bestL,bestL+k-1,'Max sum window = '+best));
  return buildViz({title:'Sliding Window — Max sum of size k='+k,sub:'The fixed-width window slides one step at a time; sum updates in O(1).',values:vals,steps:steps,
    legend:'<span class="lg-l">window start</span><span class="lg-r">window end</span><span class="lg-w">in window</span>'});
}
// Binary search
function vizBinarySearch(){
  var vals=[1,3,5,7,9,11,13,15],target=11,steps=[],lo=0,hi=vals.length-1;
  steps.push({classes:mark(lo,hi,null),status:'Search for '+target+'. lo=0, hi='+hi});
  function mark(lo,hi,mid){var c={};for(var i=lo;i<=hi;i++)c[i]=['inwin'];if(lo<=hi){c[lo]=(c[lo]||[]).concat('lo');c[hi]=(c[hi]||[]).concat('hi');}if(mid!=null)c[mid]=(c[mid]||[]).concat('mid');for(var j=0;j<vals.length;j++){if(j<lo||j>hi)c[j]=(c[j]||[]).concat('drop');}return c;}
  while(lo<=hi){
    var mid=(lo+hi)>>1;
    steps.push({classes:mark(lo,hi,mid),status:'mid='+mid+' → value '+vals[mid]});
    if(vals[mid]===target){steps.push({classes:(function(){var c=mark(mid,mid,mid);c[mid]=['done'];return c;})(),status:'Found '+target+' at index '+mid+' ✓'});break;}
    else if(vals[mid]<target){lo=mid+1;steps.push({classes:mark(lo,hi,null),status:vals[mid]+' < '+target+' → search right half (lo='+lo+')'});}
    else{hi=mid-1;steps.push({classes:mark(lo,hi,null),status:vals[mid]+' > '+target+' → search left half (hi='+hi+')'});}
  }
  return buildViz({title:'Binary Search — target '+target,sub:'The search range halves each step: O(log n).',values:vals,steps:steps,
    legend:'<span class="lg-l">lo</span><span class="lg-r">hi</span><span class="lg-w">range</span>'});
}
function injectViz(root){
  var map={twoptr:vizTwoPointers,window:vizSlidingWindow,binsearch:vizBinarySearch};
  var fn=map[root.id];if(!fn)return;
  var firstHr=root.querySelector('.doc hr')||root.querySelector('.doc h2');
  var widget=fn();
  if(firstHr)firstHr.parentNode.insertBefore(widget,firstHr);
  else root.querySelector('.doc').appendChild(widget);
}

/* ---- Big-O growth chart (interactive SVG) ----
 * Plots auxiliary-memory growth curves on shared axes with per-curve toggles
 * and an n-slider. Pure SVG, theme-aware, no dependencies. */
function renderBigOCharts(root){
  root.querySelectorAll('.bigo-chart[data-chart="bigo"]').forEach(function(host){
    if(host.dataset.built)return;host.dataset.built='1';
    var W=640,H=360,pad={l:54,r:16,t:16,b:42};
    var plotW=W-pad.l-pad.r,plotH=H-pad.t-pad.b;
    var curves=[
      {key:'1',label:'O(1)',color:'#1a7f37',f:function(n){return 1;}},
      {key:'logn',label:'O(log n)',color:'#0969da',f:function(n){return Math.log2(Math.max(1,n));}},
      {key:'n',label:'O(n)',color:'#bf8700',f:function(n){return n;}},
      {key:'nlogn',label:'O(n log n)',color:'#bc4c00',f:function(n){return n*Math.log2(Math.max(2,n));}},
      {key:'n2',label:'O(n\u00b2)',color:'#cf222e',f:function(n){return n*n;}}
    ];
    var on={};curves.forEach(function(c){on[c.key]=true;});
    var nMax=16;
    var svgNS='http://www.w3.org/2000/svg';
    function el(tag,attrs){var e=document.createElementNS(svgNS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);return e;}
    var svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Big-O growth chart'});
    function col(v,f){return (getComputedStyle(document.documentElement).getPropertyValue(v)||f).trim();}
    function x(n){return pad.l+(n/nMax)*plotW;}
    function draw(){
      var gridColor=col('--border','#d0d7de'),fgColor=col('--muted','#656d76');
      while(svg.firstChild)svg.removeChild(svg.firstChild);
      var yMax=4;
      curves.forEach(function(c){if(on[c.key])yMax=Math.max(yMax,c.f(nMax));});
      function y(v){return pad.t+plotH-(Math.min(v,yMax)/yMax)*plotH;}
      svg.appendChild(el('line',{x1:pad.l,y1:pad.t,x2:pad.l,y2:pad.t+plotH,stroke:gridColor,'stroke-width':1}));
      svg.appendChild(el('line',{x1:pad.l,y1:pad.t+plotH,x2:pad.l+plotW,y2:pad.t+plotH,stroke:gridColor,'stroke-width':1}));
      var xl=el('text',{x:pad.l+plotW/2,y:H-8,'text-anchor':'middle','font-size':12,fill:fgColor});xl.textContent='input size  n \u2192';svg.appendChild(xl);
      var yl=el('text',{x:14,y:pad.t+plotH/2,'text-anchor':'middle','font-size':12,fill:fgColor,transform:'rotate(-90 14 '+(pad.t+plotH/2)+')'});yl.textContent='memory used \u2192';svg.appendChild(yl);
      [0,0.25,0.5,0.75,1].forEach(function(frac){
        var t=Math.round(frac*nMax),xx=x(t);
        svg.appendChild(el('line',{x1:xx,y1:pad.t+plotH,x2:xx,y2:pad.t+plotH+4,stroke:gridColor}));
        var tx=el('text',{x:xx,y:pad.t+plotH+18,'text-anchor':'middle','font-size':11,fill:fgColor});tx.textContent=t;svg.appendChild(tx);
      });
      curves.forEach(function(c){
        if(!on[c.key])return;
        var d='';
        for(var n=0;n<=nMax;n+=nMax/120){var px=x(n),py=y(c.f(n));d+=(d?'L':'M')+px.toFixed(1)+' '+py.toFixed(1)+' ';}
        svg.appendChild(el('path',{d:d,fill:'none',stroke:c.color,'stroke-width':2.5,'stroke-linejoin':'round'}));
        var ey=y(c.f(nMax));
        var lbl=el('text',{x:pad.l+plotW-2,y:Math.max(pad.t+10,Math.min(ey-4,pad.t+plotH)),'text-anchor':'end','font-size':11,'font-weight':'700',fill:c.color});
        lbl.textContent=c.label;svg.appendChild(lbl);
      });
    }
    draw();
    host.appendChild(svg);
    var tg=document.createElement('div');tg.className='bigo-toggles';
    curves.forEach(function(c){
      var b=document.createElement('button');b.type='button';
      b.innerHTML='<span class="sw" style="background:'+c.color+'"></span>'+c.label;
      b.addEventListener('click',function(){on[c.key]=!on[c.key];b.classList.toggle('off',!on[c.key]);draw();});
      tg.appendChild(b);
    });
    host.appendChild(tg);
    var sl=document.createElement('div');sl.className='bigo-slider';
    var pre=document.createElement('span');pre.innerHTML='n = <b class="nval">16</b>';
    var input=document.createElement('input');input.type='range';input.min=4;input.max=64;input.value=16;input.step=1;
    input.addEventListener('input',function(){nMax=+input.value;pre.querySelector('.nval').textContent=nMax;draw();});
    sl.appendChild(pre);sl.appendChild(input);
    host.appendChild(sl);
    host.__redraw=draw;
  });
}

/* boot */
function boot(){go();}
if(document.readyState!=='loading')boot();else document.addEventListener('DOMContentLoaded',boot);
window.addEventListener('load',function(){renderMermaid(false);});
})();
`;

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
