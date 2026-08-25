// Chapter 713 - Interviews and tools (locked articles)
export default {
  '4545': {
    t: 'Code templates',
    c: `
Memorize these skeletons cold — in the room you assemble solutions from them, not from scratch.

## Binary search (boundary style)

\`\`\`python
lo, hi = 0, len(nums)            # search [lo, hi)
while lo < hi:
    mid = (lo + hi) // 2
    if ok(mid): hi = mid
    else:       lo = mid + 1
return lo                        # first index with ok() true
\`\`\`

## BFS on grid

\`\`\`python
from collections import deque
def bfs(grid, sr, sc):
    R, C = len(grid), len(grid[0])
    seen = {(sr, sc)}
    q = deque([(sr, sc, 0)])
    while q:
        r, c, d = q.popleft()
        for nr, nc in ((r+1,c),(r-1,c),(r,c+1),(r,c-1)):
            if 0 <= nr < R and 0 <= nc < C and (nr,nc) not in seen and passable(grid[nr][nc]):
                seen.add((nr, nc))
                q.append((nr, nc, d + 1))
\`\`\`

## Backtracking skeleton

\`\`\`python
def backtrack(state, path):
    if is_goal(state):
        out.append(path[:])
        return
    for choice in sorted(options(state)):   # sorted helps dedup/prune
        if not feasible(choice, state):
            continue                         # prune
        apply(choice); path.append(choice)
        backtrack(next(state), path)
        undo(choice); path.pop()
\`\`\`

## Tree recursion (postorder accumulate)

\`\`\`python
def dfs(node):
    if not node:
        return NEUTRAL                       # 0 / -inf / True … decide first!
    left, right = dfs(node.left), dfs(node.right)
    return combine(node.val, left, right)
\`\`\`

## Top-down DP with memo

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=None)
def best(i, j):
    if i == GOAL: return BASE
    return OPT(best(next1(i, j)), best(next2(i, j)))
\`\`\`

## Two-pointer window

\`\`\`python
left = best = 0
for right, x in enumerate(nums):
    add(x)
    while invalid():
        remove(nums[left]); left += 1
    best = max(best, right - left + 1)
\`\`\`

> Drill: rewrite each from an empty editor weekly. Muscle memory buys you minutes and calm.
`,
  },
  '4546': {
    t: 'Stages of an interview',
    c: `
A 45-minute technical screen has a rhythm. Manage it deliberately.

<div class="svg-wrap">
<svg viewBox="0 0 720 150" role="img" aria-label="Interview timeline">
  <defs><marker id="ta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffa116"/></marker></defs>
  <line x1="40" y1="75" x2="690" y2="75" stroke="#9d9d9d" stroke-width="2"/>
  <g font-size="12">
    <circle cx="80"  cy="75" r="8" fill="#ffa116"/><text x="80"  y="52" text-anchor="middle" font-weight="700">Intro</text><text x="80" y="102" text-anchor="middle" opacity=".65">2 min</text>
    <circle cx="200" cy="75" r="8" fill="#4c9ffe"/><text x="200" y="52" text-anchor="middle" font-weight="700">Clarify</text><text x="200" y="102" text-anchor="middle" opacity=".65">5 min</text>
    <circle cx="320" cy="75" r="8" fill="#8b5cf6"/><text x="320" y="52" text-anchor="middle" font-weight="700">Approach</text><text x="320" y="102" text-anchor="middle" opacity=".65">8–10 min</text>
    <circle cx="450" cy="75" r="8" fill="#2db55d"/><text x="450" y="52" text-anchor="middle" font-weight="700">Code</text><text x="450" y="102" text-anchor="middle" opacity=".65">15–20 min</text>
    <circle cx="580" cy="75" r="8" fill="#ef4743"/><text x="580" y="52" text-anchor="middle" font-weight="700">Test/fix</text><text x="580" y="102" text-anchor="middle" opacity=".65">5–8 min</text>
  </g>
  <path d="M40 75 H690" stroke="none"/>
</svg>
</div>

## What each stage must produce

**Intro (2m)** — greet, one-line background. Nerves peak here; over-practicing this minute pays off.

**Clarify (5m)** — never accept the first sentence. Ask: input sizes? negatives? duplicates? empty? multiple answers OK? Restate the goal. *This is graded communication, not stalling.*

**Approach (8–10m)** — brute force out loud → complexity → improve. Get explicit buy-in: *"shall I code this?"* Coding an unapproved wrong approach is the classic time sink.

**Code (15–20m)** — narrate while writing; names matter (\`left\` beats \`l\`); stub helper functions and keep moving.

**Test & fix (5–8m)** — dry-run a small example line by line, then edges: empty, single element, duplicates, extremes. Bugs found by *you* read as thoroughness, not failure.

## Signals interviewers actually score

| Signal | Green | Red |
|---|---|---|
| Problem framing | asked about constraints | jumped to code |
| Communication | thinking aloud, structured | silent typing |
| When stuck | revisits examples, simplifies | freezes/goes quiet |
| Testing | self-caught bugs | "done?" at first compile |
`,
  },
  '4547': {
    t: 'Cheatsheets',
    c: `
The numbers to know cold — complexity of every structure you might reach for.

## Data structure operations (average case)

| Structure | Access | Search | Insert | Delete | Space |
|---|---|---|---|---|---|
| Array | O(1) | O(n) | O(n) | O(n) | O(n) |
| Dynamic array append | — | — | O(1)* | — | O(n) |
| Stack / Queue | — | O(n) | O(1) | O(1) | O(n) |
| Hash map / set | — | **O(1)** | O(1) | O(1) | O(n) |
| BST balanced | O(log n) | O(log n) | O(log n) | O(log n) | O(n) |
| Heap | peek O(1) | O(n) | O(log n) | pop-min O(log n) | O(n) |
| Trie (per word length L) | — | O(L) | O(L) | O(L) | O(total chars) |

*amortized

## Sorting algorithms

| Algorithm | Time | Space | Stable | Note |
|---|---|---|---|---|
| Merge sort | O(n log n) | O(n) | yes | lists' favorite |
| Quick sort | O(n log n) avg | O(log n) | no | quickselect cousin |
| Heap sort | O(n log n) | O(1) | no | in-place |
| Counting/bucket | O(n + k) | O(k) | yes | bounded keys |
| Built-in sort | O(n log n) | — | lang-dep | Timsort/PDQ — fine to use! |

## Graph algorithms

| Algorithm | Complexity | Use |
|---|---|---|
| BFS / DFS | O(V + E) | reachability, unweighted shortest (BFS), components |
| Topological sort | O(V + E) | dependency order |
| Dijkstra (+binary heap) | O((V+E) log V) | weighted shortest, non-negative |
| Union-Find (α(n)) | ~O(E · α(n)) | dynamic connectivity, Kruskal |

## Common recurrences → complexities

| Recurrence | Result | Seen in |
|---|---|---|
| T(n)=T(n/2)+O(1) | O(log n) | binary search |
| T(n)=2T(n/2)+O(n) | O(n log n) | merge sort |
| T(n)=T(n−1)+O(n) | O(n²) | quicksort worst |
| sum over tree nodes | O(n) | any full traversal |

## Bit tricks worth knowing

\`x & 1\` parity · \`x >> 1\` halve · \`x & (x−1)\` clear lowest set bit · \`x ^ y\` diff bits · \`1 << k\` k-th bit mask.
`,
  },
  '4548': {
    t: 'Mock interviews',
    c: `
Knowledge ≠ performance under observation. Mocks convert one into the other.

## Running your own mocks (even solo)

1. **Pick an unseen medium** problem, set a 35-minute timer.
2. **Talk aloud the entire time** — to a rubber duck, a recording, or a friend. Silence is the #1 failure mode.
3. Follow the five stages strictly (clarify → approach → approval → code → test).
4. Afterwards grade yourself like an interviewer would:

| Dimension | Score 1–5 |
|---|---|
| Problem understanding & clarifying questions | |
| Solution correctness & optimality | |
| Code quality while observed | |
| Communication & structure | |
| Testing & debugging discipline | |

5. Log the weakest dimension — next mock, overcorrect toward it.

## Partner mocks

Swap roles with a friend or use peer platforms. As interviewer you learn what rambling looks like — that perspective alone improves your own narration. Give feedback in the format: *one thing done well, one thing to change, done.*

## The pre-interview week

- Re-solve, don't re-read: redo your 20 hardest logged problems from blank files.
- One mock per day, alternating languages.
- Prepare your intro and two project stories (STAR format) so small talk costs nothing.
- Sleep > cramming: pattern recall degrades sharply with fatigue — this is measured, not motivational fluff.

> Track everything in this app's notes fields; before each mock, skim last session's mistake journal. The compounding is real.
`,
  },
};
