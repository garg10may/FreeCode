// Chapter 707 part A - Binary trees (locked articles)
export default {
  '4722': {
    t: 'Binary trees',
    c: `
A **binary tree** is a hierarchy where every node has at most two children. Lists gave you one \`next\`; trees give you two — which makes them the natural home for recursion.

## Vocabulary you must own

<div class="svg-wrap">
<svg viewBox="0 0 720 260" role="img" aria-label="Binary tree anatomy">
  <g stroke="#9d9d9d" stroke-width="1.6"><line x1="360" y1="70" x2="240" y2="130"/><line x1="360" y1="70" x2="480" y2="130"/><line x1="240" y1="150" x2="170" y2="205"/><line x1="240" y1="150" x2="310" y2="205"/><line x1="480" y1="150" x2="550" y2="205"/></g>
  <g font-size="14">
    <circle cx="360" cy="55" r="26" fill="rgba(255,161,22,.2)" stroke="#ffa116" stroke-width="2"/><text x="360" y="60" text-anchor="middle">3</text>
    <circle cx="240" cy="140" r="26" fill="rgba(76,159,254,.15)" stroke="#4c9ffe"/><text x="240" y="145" text-anchor="middle">9</text>
    <circle cx="480" cy="140" r="26" fill="rgba(76,159,254,.15)" stroke="#4c9ffe"/><text x="480" y="145" text-anchor="middle">20</text>
    <circle cx="170" cy="215" r="22" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="170" y="220" text-anchor="middle">4</text>
    <circle cx="310" cy="215" r="22" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="310" y="220" text-anchor="middle">5</text>
    <circle cx="550" cy="215" r="22" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="550" y="220" text-anchor="middle">7</text>
  </g>
  <g font-size="12" fill="currentColor" opacity=".75">
    <text x="408" y="42">root</text><text x="196" y="112" text-anchor="end">left child</text><text x="524" y="112">right child</text>
    <text x="120" y="250" text-anchor="middle">leaves: 4, 5, 7</text>
    <text x="360" y="250" text-anchor="middle">height = 2 (edges) · depth(20) = 1</text>
  </g>
</svg>
</div>

- **depth(node)** = edges from root down to it
- **height** = deepest node's depth
- **leaf** = no children; **complete/perfect/full** have precise meanings worth reviewing before interviews

## The universal recursive truth

Any binary tree question starts from: *"if I knew the answer for my left subtree and right subtree, how do I build mine?"*

\`\`\`python
def solve(node):
    if not node:
        return base_answer          # empty tree convention!
    left  = solve(node.left)
    right = solve(node.right)
    return combine(node.val, left, right)
\`\`\`

Examples of \`combine\`: depth → \`max(l, r) + 1\`; sum → \`val + l + r\`; same-tree → boolean and.

The empty-node base case is where tree bugs live. Decide it first, every time.

## Traversals preview

Four orders matter (DFS pre/in/post + BFS level). They get their own lessons next — but the one-line summary:

| Order | Visit order | Signature use |
|---|---|---|
| preorder | node, L, R | copying trees, serializing |
| inorder | L, node, R | **sorted order in BSTs** |
| postorder | L, R, node | deleting, bottom-up aggregation |
| level | by depth | BFS, width problems |

### Practice
[104. Maximum Depth](#/problems/maximum-depth-of-binary-tree) · [226. Invert Binary Tree](#/problems/invert-binary-tree) · [100. Same Tree](#/problems/same-tree)
`,
  },
  '4686': {
    t: 'Binary trees - DFS',
    c: `
Depth-first search commits to one branch all the way down before backtracking. The three DFS orders differ only in *when* the node is processed relative to its subtrees.

## The three orders on one tree

<div class="svg-wrap">
<svg viewBox="0 0 720 230" role="img" aria-label="DFS orders">
  <g stroke="#9d9d9d" stroke-width="1.5"><line x1="180" y1="70" x2="110" y2="125"/><line x1="180" y1="70" x2="250" y2="125"/><line x1="110" y1="145" x2="80" y2="185"/><line x1="110" y1="145" x2="140" y2="185"/></g>
  <g font-size="13">
    <circle cx="180" cy="55" r="23" fill="rgba(255,161,22,.25)" stroke="#ffa116" stroke-width="2.4"/><text x="180" y="60" text-anchor="middle" font-weight="700">1</text>
    <circle cx="110" cy="135" r="23" fill="rgba(45,181,93,.22)" stroke="#2db55d"/><text x="110" y="140" text-anchor="middle">2</text>
    <circle cx="250" cy="135" r="23" fill="rgba(76,159,254,.16)" stroke="#4c9ffe"/><text x="250" y="140" text-anchor="middle">3</text>
    <circle cx="80"  cy="192" r="19" fill="rgba(139,92,246,.18)" stroke="#8b5cf6"/><text x="80"  y="196" text-anchor="middle">4</text>
    <circle cx="140" cy="192" r="19" fill="rgba(139,92,246,.18)" stroke="#8b5cf6"/><text x="140" y="196" text-anchor="middle">5</text>
  </g>
  <g font-size="13" font-family="ui-monospace, monospace">
    <text x="330" y="70"><tspan fill="#ffa116" font-weight="700">preorder:</tspan>  1 2 4 5 3   <tspan opacity=".65">(node first — top-down)</tspan></text>
    <text x="330" y="100"><tspan fill="#2db55d" font-weight="700">inorder:</tspan>   4 2 5 1 3   <tspan opacity=".65">(node middle)</tspan></text>
    <text x="330" y="130"><tspan fill="#8b5cf6" font-weight="700">postorder:</tspan> 4 5 2 3 1   <tspan opacity=".65">(node last — bottom-up)</tspan></text>
    <text x="330" y="175" opacity=".75">same walk, three moments of "process":</text>
    <text x="330" y="200" opacity=".75">arrive · finish-left · finish-right</text>
  </g>
</svg>
</div>

\`\`\`python
def dfs(node):
    if not node:
        return
    # process(node.val)        ← preorder position
    dfs(node.left)
    # process(node.val)        ← inorder position
    dfs(node.right)
    # process(node.val)        ← postorder position
\`\`\`

## Choosing an order

- Need parents before children (clone, serialize, prefix sums along path) → **preorder**
- Need children before parent (heights, sizes, delete, "most of anything computed bottom-up") → **postorder**
- BST sorted output / validation → **inorder**

## Iterative DFS with an explicit stack

Same logic, stack instead of call frames — know both forms:

\`\`\`python
st = [root]
while st:
    node = st.pop()
    visit(node)
    if node.right: st.append(node.right)   # right first so left pops first
    if node.left:  st.append(node.left)
\`\`\`

## Complexity

Every node entered once: **O(n)** time. Space = max depth of recursion stack: **O(h)** — O(log n) balanced, O(n) degenerate chain. Say both when asked.

### Practice
[144/94/145 traversals] · [104. Maximum Depth](#/problems/maximum-depth-of-binary-tree) · [543. Diameter of Binary Tree](#/problems/diameter-of-binary-tree) (postorder!) · [124. Binary Tree Maximum Path Sum](#/problems/binary-tree-maximum-path-sum)
`,
  },
  '4619': {
    t: 'Binary trees - BFS',
    c: `
Breadth-first search sweeps the tree **level by level**, powered by a queue.

<div class="svg-wrap">
<svg viewBox="0 0 720 240" role="img" aria-label="BFS levels and queue state">
  <defs><marker id="ba" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
  <g stroke="#9d9d9d" stroke-width="1.5">
    <line x1="360" y1="66" x2="200" y2="126"/><line x1="360" y1="66" x2="520" y2="126"/>
    <line x1="200" y1="146" x2="120" y2="200"/><line x1="200" y1="146" x2="280" y2="200"/><line x1="520" y1="146" x2="600" y2="200"/>
  </g>
  <g font-size="13">
    <circle cx="360" cy="50" r="24" fill="rgba(255,161,22,.22)" stroke="#ffa116" stroke-width="2.2"/><text x="360" y="55" text-anchor="middle" font-weight="700">3</text>
    <circle cx="200" cy="136" r="24" fill="rgba(45,181,93,.20)" stroke="#2db55d"/><text x="200" y="141" text-anchor="middle">9</text>
    <circle cx="520" cy="136" r="24" fill="rgba(45,181,93,.20)" stroke="#2db55d"/><text x="520" y="141" text-anchor="middle">20</text>
    <circle cx="120" cy="210" r="21" fill="rgba(76,159,254,.16)" stroke="#4c9ffe"/><text x="120" y="215" text-anchor="middle">4</text>
    <circle cx="280" cy="210" r="21" fill="rgba(76,159,254,.16)" stroke="#4c9ffe"/><text x="280" y="215" text-anchor="middle">5</text>
    <circle cx="600" cy="210" r="21" fill="rgba(76,159,254,.16)" stroke="#4c9ffe"/><text x="600" y="215" text-anchor="middle">7</text>
  </g>
  <g font-size="11.5" fill="currentColor" opacity=".7">
    <rect x="20" y="44" width="52" height="18" rx="9" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><text x="46" y="57" text-anchor="middle">L0</text>
    <rect x="20" y="130" width="52" height="18" rx="9" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><text x="46" y="143" text-anchor="middle">L1</text>
    <rect x="20" y="204" width="52" height="18" rx="9" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><text x="46" y="217" text-anchor="middle">L2</text>
  </g>
  <text x="360" y="245" text-anchor="middle" font-size="12.5" fill="#ffa116" font-weight="700">queue evolution: [3] → [9,20] → [4,5,7]</text>
</svg>
</div>

\`\`\`python
from collections import deque
q = deque([root])
while q:
    for _ in range(len(q)):        # exactly one level
        node = q.popleft()
        if node.left:  q.append(node.left)
        if node.right: q.append(node.right)
\`\`\`

The inner \`for _ in range(len(q))\` snapshot is what separates *level* problems from plain traversal.

## Level-order unlocks

- **Right side view** — last node of each level ([199](#/problems/binary-tree-right-side-view))
- **Level averages / zigzag / largest per level** — same skeleton ([637](#/problems/average-of-levels-in-binary-tree), [103](#/problems/binary-tree-zigzag-level-order-traversal), [515](#/problems/find-largest-value-in-each-tree-row))
- **Minimum depth** — BFS can stop *early*: first leaf found is guaranteed nearest ([111](#/problems/minimum-depth-of-binary-tree))

## DFS vs BFS — pick by target geometry

| You need… | Use | Why |
|---|---|---|
| depth/ancestors/path-to-root | DFS | follows depth naturally |
| levels, nearest nodes, width | BFS | processes in distance order |
| early exit on "nearest X" | BFS | first hit wins |
| all paths / combinations | DFS/backtracking | explores branches fully |

Both are O(n) time; space O(w) for BFS (max level width) vs O(h) for DFS.
`,
  },
  '4622': {
    t: 'Binary search trees',
    c: `
A **BST** imposes one rule everywhere: *everything in the left subtree < node < everything in the right subtree*. That single invariant turns search into a guided walk.

<div class="svg-wrap">
<svg viewBox="0 0 720 240" role="img" aria-label="BST property">
  <g stroke="#9d9d9d" stroke-width="1.5">
    <line x1="360" y1="64" x2="220" y2="128"/><line x1="360" y1="64" x2="500" y2="128"/>
    <line x1="220" y1="148" x2="140" y2="206"/><line x1="220" y1="148" x2="300" y2="206"/>
    <line x1="500" y1="148" x2="430" y2="206"/><line x1="500" y1="148" x2="580" y2="206"/>
  </g>
  <g font-size="13.5">
    <circle cx="360" cy="50" r="25" fill="rgba(255,161,22,.2)" stroke="#ffa116" stroke-width="2.2"/><text x="360" y="55" text-anchor="middle" font-weight="700">8</text>
    <circle cx="220" cy="138" r="24" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="220" y="143" text-anchor="middle">&lt;8</text>
    <circle cx="500" cy="138" r="24" fill="rgba(76,159,254,.17)" stroke="#4c9ffe"/><text x="500" y="143" text-anchor="middle">&gt;8</text>
    <circle cx="140" cy="212" r="21" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="140" y="217" text-anchor="middle" opacity=".6">…&lt;8</text>
    <circle cx="300" cy="212" r="21" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="300" y="217" text-anchor="middle" opacity=".6">…&lt;8</text>
    <circle cx="430" cy="212" r="21" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="430" y="217" text-anchor="middle" opacity=".6">…&gt;8</text>
    <circle cx="580" cy="212" r="21" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="580" y="217" text-anchor="middle" opacity=".6">…&gt;8</text>
  </g>
  <text x="360" y="165" text-anchor="middle" font-size="12" fill="currentColor" opacity=".7">searching 6: go left at 8, done deciding half the world each step</text>
</svg>
</div>

Search/insert follow the path downward: **O(h)** — O(log n) if balanced, but a sorted insertion order degrades to a linked list (**O(n)**). Balanced variants (AVL/red-black) exist so real libraries stay logarithmic.

## Search & insert

\`\`\`python
def search(node, target):
    while node and node.val != target:
        node = node.left if target < node.val else node.right
    return node
\`\`\`

Insert = search until falling off, attach there. Deletion has three cases (leaf / one child / two children — swap in inorder successor); know the story even if you don't memorize code: [450. Delete Node in a BST](#/problems/delete-node-in-a-bst).

## The inorder superpower

Inorder traversal of a BST visits values **in sorted order**. Consequences interviewers love:

- validate a BST: inorder must be strictly increasing ([98. Validate Binary Search Tree](#/problems/validate-binary-search-tree)) — or pass down allowed *(low, high)* bounds recursively
- k-th smallest: inorder, stop at k ([230. Kth Smallest Element in a BST](#/problems/kth-smallest-element-in-a-bst))
- find closest value / floor / ceiling: walk down keeping best-so-far ([270. Closest Binary Search Tree Value](#/problems/closest-binary-search-tree-value))

## Common trap

Checking only \`node.left.val < node.val < node.right.val\` is **wrong** — the constraint applies to entire subtrees. Always carry bounds:

\`\`\`python
def valid(node, lo=float('-inf'), hi=float('inf')):
    if not node: return True
    if not lo < node.val < hi: return False
    return valid(node.left, lo, node.val) and valid(node.right, node.val, hi)
\`\`\`
`,
  },
  '4625': {
    t: 'Trees quiz',
    c: `
Five questions on trees before graphs.

**Q1.** Height of an empty subtree (null child) should return…

- A. 1 — B. 0 — C. −1 or 0 depending on your edge-counting convention, decided consistently — D. infinity

<details><summary>Solution</summary><p><strong>C.</strong> Pick a convention (nodes count: null=0; edges count: null=−1) and apply it everywhere. Mixing conventions is the classic off-by-one.</p></details>

**Q2.** Which traversal yields sorted output on a BST?

- A. preorder — B. inorder — C. postorder — D. level order

<details><summary>Solution</summary><p><strong>B.</strong> Left(smaller), node, right(bigger) = ascending sequence.</p></details>

**Q3.** DFS space complexity on a balanced tree of n nodes?

- A. O(n) always — B. O(log n) recursion depth — C. O(1) — D. O(n log n)

<details><summary>Solution</summary><p><strong>B.</strong> Stack depth equals height h = O(log n) balanced, O(n) worst-case chain.</p></details>

**Q4.** To get "last node on each level", cheapest approach?

- A. Sort all values — B. BFS recording each level's final node — C. Preorder — D. Two hash maps

<details><summary>Solution</summary><p><strong>B.</strong> Right-side view = per-level tail via the BFS level snapshot loop.</p></details>

**Q5.** Why is checking only direct children insufficient for validating a BST?

- A. It isn't — B. Grandchildren can violate an ancestor's bound (e.g. deep-left node bigger than root) — C. Duplicates only — D. Only for unbalanced trees

<details><summary>Solution</summary><p><strong>B.</strong> Each node constrains an interval; propagate (lo, hi) bounds or use monotonic inorder.</p></details>
`,
  },
};
