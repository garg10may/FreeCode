// Chapter 707 part B - Graphs (locked articles)
export default {
  '4721': {
    t: 'Graphs',
    c: `
A **graph** is nodes (vertices) connected by edges — trees and linked lists are just special graphs. Interviews test three skills: *representing* the graph, *traversing* it, and recognizing which traversal solves the question.

## The four shapes you'll meet

<div class="svg-wrap">
<svg viewBox="0 0 720 170" role="img" aria-label="Graph types">
  <g font-size="11.5" fill="currentColor" opacity=".75">
    <text x="90" y="150" text-anchor="middle">undirected</text>
    <text x="270" y="150" text-anchor="middle">directed</text>
    <text x="450" y="150" text-anchor="middle">weighted</text>
    <text x="630" y="150" text-anchor="middle">DAG</text>
  </g>
  <g stroke="#9d9d9d" stroke-width="1.6">
    <line x1="60" y1="55" x2="115" y2="95"/><line x1="120" y1="50" x2="100" y2="100" transform="rotate(20 110 75)"/>
  </g>
  <g font-size="13">
    <circle cx="60" cy="45" r="17" fill="rgba(76,159,254,.15)" stroke="#4c9ffe"/><text x="60" y="50" text-anchor="middle">A</text>
    <circle cx="125" cy="100" r="17" fill="rgba(76,159,254,.15)" stroke="#4c9ffe"/><text x="125" y="105" text-anchor="middle">B</text>
    <circle cx="255" cy="50" r="17" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="255" y="55" text-anchor="middle">A</text>
    <circle cx="285" cy="105" r="17" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="285" y="110" text-anchor="middle">B</text>
    <path d="M262 66 L278 89" stroke="#9d9d9d" stroke-width="1.6" marker-end="url(#ga)"/>
    <circle cx="415" cy="55" r="17" fill="rgba(255,161,22,.16)" stroke="#ffa116"/><text x="415" y="60" text-anchor="middle">A</text>
    <circle cx="485" cy="95" r="17" fill="rgba(255,161,22,.16)" stroke="#ffa116"/><text x="485" y="100" text-anchor="middle">B</text>
    <text x="443" y="62" font-size="11" fill="#ef4743" font-weight="700">7</text><path d="M430 63 L468 86" stroke="#9d9d9d" stroke-width="1.6"/>
    <circle cx="585" cy="70" r="17" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="585" y="75" text-anchor="middle">A</text>
    <circle cx="650" cy="40" r="17" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="650" y="45" text-anchor="middle">B</text>
    <circle cx="665" cy="105" r="17" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="665" y="110" text-anchor="middle">C</text>
    <path d="M600 60 L635 48" stroke="#9d9d9d" stroke-width="1.5" marker-end="url(#ga)"/>
    <path d="M600 82 L648 99" stroke="#9d9d9d" stroke-width="1.5" marker-end="url(#ga)"/>
  </g>
  <defs><marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#9d9d9d"/></marker></defs>
</svg>
</div>

## Representation: adjacency list wins

\`\`\`python
from collections import defaultdict
graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
graph[v].append(u)      # only if undirected
\`\`\`

Space O(V + E), neighbor iteration O(deg). Adjacency matrices are rare in interviews except dense small grids.

## The two traversals solve ~everything at this level

| Question | Tool |
|---|---|
| is X reachable from Y? | DFS or BFS |
| shortest path, unweighted edges | **BFS** |
| count connected components / islands | flood fill (either) |
| detect a cycle | DFS with colors / BFS topological |
| order tasks by prerequisites | topological sort (BFS Kahn's) |
| shortest path, weighted | Dijkstra (bonus chapter) |

## The one template to internalize

\`\`\`python
def bfs(start):
    seen = {start}
    q = deque([start])
    while q:
        node = q.popleft()
        for nb in graph[node]:
            if nb not in seen:
                seen.add(nb)          # mark on enqueue!
                q.append(nb)
\`\`\`

Marking on **enqueue** (not dequeue) prevents duplicate queue entries — the #1 correctness bug.

Grids are graphs in disguise: each cell connects to its 4 neighbors; "island" problems are just flood fills over cells ([200. Number of Islands](#/problems/number-of-islands)).
`,
  },
  '4626': {
    t: 'Graphs - DFS',
    c: `
Graph DFS = tree DFS plus **a visited set** (graphs can revisit you; trees can't).

## Connected components & islands

Every unvisited node starts a flood that claims its entire component:

\`\`\`python
def num_components(graph, n):
    seen = set()
    comps = 0
    def dfs(u):
        seen.add(u)
        for v in graph[u]:
            if v not in seen:
                dfs(v)
    for u in range(n):
        if u not in seen:
            comps += 1
            dfs(u)
    return comps
\`\`\`

On grids, \`dfs(r, c)\` visits 4-directional neighbors and "sinks" land cells to avoid re-marking — [200. Number of Islands](#/problems/number-of-islands), [695. Max Area of Island](#/problems/max-area-of-island).

## Cycle detection (directed graphs)

Three colors: white (unseen), gray (on current recursion path), black (finished). Seeing **gray** again means a back-edge → cycle:

<div class="svg-wrap">
<svg viewBox="0 0 720 130" role="img" aria-label="Cycle via back edge">
  <defs><marker id="ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
  <g font-size="13">
    <circle cx="80" cy="70" r="21" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="80" y="75" text-anchor="middle">A</text>
    <circle cx="240" cy="70" r="21" fill="rgba(255,161,22,.2)" stroke="#ffa116" stroke-width="2.4"/><text x="240" y="75" text-anchor="middle">B</text>
    <circle cx="400" cy="70" r="21" fill="rgba(239,71,67,.14)" stroke="#ef4743" stroke-width="2.4"/><text x="400" y="75" text-anchor="middle">C</text>
    <path d="M101 64 H216" stroke="#9d9d9d" stroke-width="1.7" marker-end="url(#ca)"/>
    <path d="M261 64 H376" stroke="#9d9d9d" stroke-width="1.7" marker-end="url(#ca)"/>
    <path d="M392 88 C 340 125, 180 125, 96 92" stroke="#ef4743" stroke-width="2" stroke-dasharray="6 4" fill="none" marker-end="url(#ca)"/>
  </g>
  <g font-size="12" fill="currentColor" opacity=".75">
    <text x="160" y="52" text-anchor="middle">tree edge</text>
    <text x="330" y="118" text-anchor="middle" fill="#ef4743">back edge C→B (B still gray) ⇒ cycle!</text>
  </g>
</svg>
</div>

For **undirected** graphs, one extra rule: skipping the vertex you just came from isn't enough with multi-edges — track parent, or count visited-neighbor touches.

## Topological ordering preview

Postorder DFS reversed gives an order where every edge points forward — the "finish times" view of prerequisite chains ([210. Course Schedule II](#/problems/course-schedule-ii)). If you prefer queues, Kahn's algorithm in the next lesson does it level-by-level.

## Complexity

O(V + E): each vertex enters the recursion once, each edge examined once (twice if undirected). Recursion depth up to V — for big inputs, convert to iterative with an explicit stack.
`,
  },
  '4631': {
    t: 'Graphs - BFS',
    c: `
Unweighted shortest paths belong to BFS. The first time BFS reaches a node, it arrived via fewest edges — guaranteed.

## Why FIFO = fewest edges

The queue holds nodes in non-decreasing distance order: all distance-k nodes before any distance-(k+1) node.

<div class="svg-wrap">
<svg viewBox="0 0 720 190" role="img" aria-label="BFS layers give shortest distances">
  <g font-size="13">
    <circle cx="90" cy="95" r="24" fill="rgba(255,161,22,.22)" stroke="#ffa116" stroke-width="2.2"/><text x="90" y="100" text-anchor="middle" font-weight="700">S</text>
    <circle cx="280" cy="45" r="22" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="280" y="50" text-anchor="middle">a</text>
    <circle cx="280" cy="145" r="22" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="280" y="150" text-anchor="middle">b</text>
    <circle cx="480" cy="45" r="22" fill="rgba(76,159,254,.17)" stroke="#4c9ffe"/><text x="480" y="50" text-anchor="middle">c</text>
    <circle cx="480" cy="145" r="22" fill="rgba(76,159,254,.17)" stroke="#4c9ffe"/><text x="480" y="150" text-anchor="middle">d</text>
    <circle cx="640" cy="95" r="22" fill="rgba(139,92,246,.18)" stroke="#8b5cf6" stroke-dasharray="5 3"/><text x="640" y="100" text-anchor="middle">T</text>
  </g>
  <g stroke="#9d9d9d" stroke-width="1.6"><line x1="114" y1="85" x2="256" y2="53"/><line x1="114" y1="105" x2="256" y2="137"/><line x1="302" y1="42" x2="456" y2="43"/><line x1="302" y1="148" x2="456" y2="147"/><line x1="502" y1="54" x2="619" y2="87"/></g>
  <g font-size="12" fill="currentColor" opacity=".7"><text x="90" y="140" text-anchor="middle">dist 0</text><text x="280" y="185" text-anchor="middle">dist 1</text><text x="480" y="185" text-anchor="middle">dist 2</text><text x="640" y="135" text-anchor="middle">dist 3 → answer</text></g>
</svg>
</div>

## Shortest path template

\`\`\`python
def shortest_len(graph, s, t):
    dist = {s: 0}
    q = deque([s])
    while q:
        u = q.popleft()
        if u == t:
            return dist[u]
        for v in graph[u]:
            if v not in dist:
                dist[v] = dist[u] + 1     # record when discovered
                q.append(v)
    return -1
\`\`\`

Reconstructing the actual path? Store \`parent[v] = u\` alongside and walk backwards from \`t\`.

## Word-ladder style state graphs

Sometimes "neighbors" are computed, not given: words differing by one letter, lock combinations, board moves. Generate neighbors on the fly and run the same BFS — [127. Word Ladder](#/problems/word-ladder), [752. Open the Lock](#/problems/open-the-lock), [1926. Nearest Exit from Entrance in Maze](#/problems/nearest-exit-from-entrance-in-maze).

## Multi-source BFS

Seed the queue with *all* sources at distance 0 — each cell ends up labeled with distance to its nearest source. One line changes, whole new problem class: [542. 01 Matrix](#/problems/01-matrix), [1091. Shortest Path in Binary Matrix](#/problems/shortest-path-in-binary-matrix), rotten oranges ([994](#/problems/rotting-oranges)).

> Complexity remains **O(V + E)** — every node enqueued once, every edge touched once.
`,
  },
  '4635': {
    t: 'Implicit graphs',
    c: `
No adjacency list arrives with these problems — you must notice that states and moves form a graph yourself.

## The translation recipe

1. **What is a node?** A full description of the situation: a word, a lock code ("0256"), a board position.
2. **What is an edge?** One allowed move: change one letter, rotate one wheel, swap two cells.
3. **What is start/target?** Then BFS shortest-path machinery applies unchanged.

<div class="svg-wrap">
<svg viewBox="0 0 720 150" role="img" aria-label="State space as implicit graph">
  <defs><marker id="ia" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
  <g font-size="13" font-family="ui-monospace, monospace">
    <circle cx="90" cy="75" r="30" fill="rgba(255,161,22,.16)" stroke="#ffa116" stroke-width="2"/><text x="90" y="80" text-anchor="middle">"0000"</text>
    <circle cx="300" cy="40" r="30" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="300" y="45" text-anchor="middle">"1000"</text>
    <circle cx="300" cy="112" r="30" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="300" y="117" text-anchor="middle">"9000"</text>
    <circle cx="520" cy="75" r="30" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="520" y="80" text-anchor="middle">"…"</text>
    <circle cx="655" cy="75" r="26" fill="rgba(45,181,93,.18)" stroke="#2db55d" stroke-width="2"/><text x="655" y="80" text-anchor="middle" font-weight="700">target</text>
  </g>
  <g stroke="#9d9d9d" stroke-width="1.6"><path d="M119 68 C 180 45, 230 42, 268 41" fill="none" marker-end="url(#ia)"/><path d="M119 83 C 180 106, 230 110, 268 111" fill="none" marker-end="url(#ia)"/><path d="M330 50 C 420 60, 460 65, 489 71" fill="none" marker-end="url(#ia)"/><path d="M550 78 L 627 77" fill="none" marker-end="url(#ia)"/></g>
  <text x="360" y="145" text-anchor="middle" font-size="12" fill="currentColor" opacity=".65">edges = turn one dial ±1 · deadends = forbidden nodes to skip · shortest turns = BFS levels</text>
</svg>
</div>

Open the Lock ([752](#/problems/open-the-lock)) is exactly this picture; Word Ladder swaps dials for letters.

## Grids: the most common implicit graph

Cells are nodes; walls block edges; 4-neighbor moves are edges. Flood fill = DFS/BFS over cells. Escape/puzzle problems add rules to edge generation ([490. The Maze](#/problems/the-maze), [1036. Escape a Large Maze](#/problems/escape-a-large-maze) — where blocking only 1300 obstacles suffices, a beautiful insight).

## Choosing the search

- Fewest *moves*, uniform cost → plain BFS
- Cost varies per move → weighted (Dijkstra, bonus chapter)
- Must explore all possibilities / count configurations → backtracking (next chapter)
- State space huge but target near → **bidirectional BFS**: expand from both ends, meet in middle — turns 10⁶ frontier into ~2×10³ ([752](#/problems/open-the-lock) showcase)

> Interview phrase that scores points: *"I'll model each state as a node and moves as edges, then BFS guarantees minimal steps."*
`,
  },
  '4644': {
    t: 'Graphs quiz',
    c: `
Five checks on graphs.

**Q1.** Unweighted maze, fewest steps from entrance to exit?

- A. DFS — B. BFS — C. Dijkstra — D. sort rows

<details><summary>Solution</summary><p><strong>B.</strong> Uniform edge cost ⇒ first arrival is optimal. Dijkstra would work but is overkill.</p></details>

**Q2.** Marking visited on dequeue instead of enqueue causes…

- A. Nothing — B. Possible duplicate queue entries and wrong distances/perf — C. Infinite loops always — D. Missing components

<details><summary>Solution</summary><p><strong>B.</strong> The same node can be queued several times before being processed; distances may be recorded late.</p></details>

**Q3.** Counting islands = ?

- A. Sorting rows — B. Flood-fill from every unvisited land cell, counting floods — C. Union of diagonals — D. BFS from corner

<details><summary>Solution</summary><p><strong>B.</strong> Each unvisited land cell starts exactly one component flood.</p></details>

**Q4.** Detecting a cycle in a directed graph needs distinguishing:

- A. Tree vs forest — B. Nodes on current path (gray) vs fully explored (black); a gray hit = cycle — C. Weights — D. Nothing special

<details><summary>Solution</summary><p><strong>B.</strong> Back edge into recursion stack = cycle. Plain visited-set alone conflates cross edges with back edges.</p></details>

**Q5.** Prerequisites form a dependency DAG; produce a valid order with…

- A. Preorder DFS — B. Topological sort (Kahn's queue or reversed postorder) — C. BFS shortest path — D. Binary search

<details><summary>Solution</summary><p><strong>B.</strong> Repeatedly take zero-indegree nodes (Kahn) — or finish-time reverse DFS order.</p></details>
`,
  },
  '4709': {
    t: 'Bonus problems, trees and graphs',
    c: `
Consolidation reps across trees and graphs.

| Problem | Difficulty | trains |
|---|---|---|
| [104. Maximum Depth of Binary Tree](#/problems/maximum-depth-of-binary-tree) | Easy | postorder |
| [100. Same Tree](#/problems/same-tree) | Easy | paired recursion |
| [226. Invert Binary Tree](#/problems/invert-binary-tree) | Easy | preorder swap |
| [101. Symmetric Tree](#/problems/symmetric-tree) | Easy | twin recursion |
| [102. Level Order Traversal](#/problems/binary-tree-level-order-traversal) | Medium | BFS snapshot |
| [105. Construct Tree from Preorder+Inorder](#/problems/construct-binary-tree-from-preorder-and-inorder-traversal) | Medium | divide & conquer |
| [98. Validate BST](#/problems/validate-binary-search-tree) | Medium | bounds propagation |
| [230. Kth Smallest in BST](#/problems/kth-smallest-element-in-a-bst) | Medium | inorder stop early |
| [543. Diameter of Binary Tree](#/problems/diameter-of-binary-tree) | Easy | postorder accumulate |
| [200. Number of Islands](#/problems/number-of-islands) | Medium | grid flood fill |
| [133. Clone Graph](#/problems/clone-graph) | Medium | visited map as clones |
| [417. Pacific Atlantic Water Flow](#/problems/pacific-atlantic-water-flow) | Medium | multi-source reverse DFS |
| [210. Course Schedule II](#/problems/course-schedule-ii) | Medium | topological sort |
| [994. Rotting Oranges](#/problems/rotting-oranges) | Medium | multi-source BFS |
| [127. Word Ladder](#/problems/word-ladder) | Hard | implicit graph BFS |
| [297. Serialize and Deserialize Binary Tree](#/problems/serialize-and-deserialize-binary-tree) | Hard | preorder + sentinels |

**Challenge goals:** solve Clone Graph twice — once DFS once BFS; explain why multi-source BFS on Rotting Oranges equals adding a virtual super-source.
`,
  },
};
