// Chapter 711 - Backtracking (locked articles)
export default {
  '4535': {
    t: 'Backtracking',
    c: `
Backtracking is DFS over **decisions**: at every step, try each available option, recurse deeper, then *undo* the choice and try the next. It's how you enumerate — or search for the best among — exponentially many candidates without wasting work.

## The universal skeleton

\`\`\`python
def backtrack(state):
    if is_goal(state):
        record(state)                 # or return True
        return
    for choice in options(state):
        apply(choice, state)          # 1. choose
        backtrack(next_state(state))  # 2. explore
        undo(choice, state)           # 3. un-choose  ← the "backtrack"
\`\`\`

Three verbs — **choose, explore, un-choose**. If your code doesn't visibly undo, you're not backtracking (you're branching copies instead, which is sometimes fine but costs memory).

## What it looks like

Permutations of [1,2,3]:

<div class="svg-wrap">
<svg viewBox="0 0 720 240" role="img" aria-label="Decision tree of permutations">
  <g stroke="#9d9d9d" stroke-width="1.4"><line x1="360" y1="52" x2="180" y2="98"/><line x1="360" y1="52" x2="360" y2="98"/><line x1="360" y1="52" x2="540" y2="98"/><line x1="180" y1="118" x2="100" y2="164"/><line x1="180" y1="118" x2="230" y2="164"/><line x1="540" y1="118" x2="480" y2="164"/><line x1="540" y1="118" x2="610" y2="164"/></g>
  <g font-size="12.5" font-family="ui-monospace, monospace">
    <rect x="320" y="30" width="80" height="28" rx="8" fill="rgba(255,161,22,.16)" stroke="#ffa116"/><text x="360" y="49" text-anchor="middle">[ ]</text>
    <rect x="140" y="96" width="80" height="28" rx="8" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><text x="180" y="115" text-anchor="middle">[1]</text>
    <rect x="320" y="96" width="80" height="28" rx="8" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><text x="360" y="115" text-anchor="middle">[2]</text>
    <rect x="500" y="96" width="80" height="28" rx="8" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><text x="540" y="115" text-anchor="middle">[3]</text>
    <rect x="60"  y="162" width="80" height="28" rx="8" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="100" y="181" text-anchor="middle">[1,2]</text>
    <rect x="195" y="162" width="80" height="28" rx="8" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="235" y="181" text-anchor="middle">[1,3]</text>
    <rect x="440" y="162" width="80" height="28" rx="8" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="480" y="181" text-anchor="middle">[3,1]</text>
    <rect x="575" y="162" width="80" height="28" rx="8" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="615" y="181" text-anchor="middle">[3,2]</text>
    <text x="360" y="222" text-anchor="middle" fill="currentColor" opacity=".65">leaves extend to full permutations; dashed branches = pruned</text>
    <path d="M235 190 C 300 215, 330 218, 356 220" stroke="#ef4743" stroke-width="1.6" stroke-dasharray="5 3" fill="none"/>
  </g>
</svg>
</div>

## Complexity honesty

The tree size is the complexity: permutations \`n!\`, subsets \`2ⁿ\`, combinations \`C(n,k)\`. Exponential is expected and fine — what matters is **not visiting the same node twice** and pruning early.

## Pruning: where speed comes from

- Feasibility: stop a branch the moment it violates a constraint (row/column conflicts in N-Queens)
- Deduplication: sort first, skip equal siblings ([90. Subsets II](#/problems/subsets-ii))
- Bounds: abandon when even a perfect continuation can't beat current best

> Backtracking = correctness first (enumerate), efficiency second (prune). Get the skeleton right, then trim.
`,
  },
  '4536': {
    t: 'Generation',
    c: `
The cleanest backtracking workouts are the big three generators: subsets, permutations, combinations. Learn their exact differences — interviewers probe precisely there.

## Subsets (every element in-or-out)

Each recursion level decides one element's membership:

\`\`\`python
def subsets(nums):
    out, path = [], []
    def dfs(i):
        if i == len(nums):
            out.append(path[:])       # copy!
            return
        path.append(nums[i]); dfs(i + 1)   # take it
        path.pop();                        # undo
        dfs(i + 1)                          # skip it
    dfs(0)
    return out
\`\`\`

Alternative style grows paths forward (\`for j in range(i, n)\`) — same tree, different bookkeeping.

## Combinations — subsets with fixed size k

Same forward loop, but stop extending past k; prune when remaining elements can't reach k:

\`\`\`python
def combine(n, k):
    out, path = [], []
    def dfs(start):
        if len(path) == k:
            out.append(path[:]); return
        need = k - len(path)
        for j in range(start, n + 1 - (need - 1)):   # prune tail
            path.append(j); dfs(j + 1); path.pop()
    dfs(1)
    return out
\`\`\`

## Permutations — order matters, use a used-set

\`\`\`python
def permute(nums):
    out, path, used = [], [], [False] * len(nums)
    def dfs():
        if len(path) == len(nums):
            out.append(path[:]); return
        for i in range(len(nums)):
            if used[i]: continue
            used[i] = True; path.append(nums[i])
            dfs()
            used[i] = False; path.pop()
    dfs()
    return out
\`\`\`

<div class="svg-wrap">
<svg viewBox="0 0 720 130" role="img" aria-label="Generator differences">
  <g font-size="12.5">
    <rect x="20"  y="25" width="210" height="70" rx="10" fill="rgba(45,181,93,.13)" stroke="#2db55d"/><text x="125" y="50" text-anchor="middle" font-weight="700">subsets · C(n,·) = 2ⁿ</text><text x="125" y="72" text-anchor="middle" opacity=".7">position decides in/out</text><text x="125" y="86" text-anchor="middle" opacity=".7">order within path irrelevant</text>
    <rect x="255" y="25" width="210" height="70" rx="10" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/><text x="360" y="50" text-anchor="middle" font-weight="700">combinations · C(n,k)</text><text x="360" y="72" text-anchor="middle" opacity=".7">forward-only starts (j&gt;i)</text><text x="360" y="86" text-anchor="middle" opacity=".7">fixed length k, prune tail</text>
    <rect x="490" y="25" width="210" height="70" rx="10" fill="rgba(139,92,246,.14)" stroke="#8b5cf6"/><text x="595" y="50" text-anchor="middle" font-weight="700">permutations · n!</text><text x="595" y="72" text-anchor="middle" opacity=".7">any unused next</text><text x="595" y="86" text-anchor="middle" opacity=".7">needs used[] flags</text>
  </g>
</svg>
</div>

### Practice
[78. Subsets](#/problems/subsets) · [77. Combinations](#/problems/combinations) · [46. Permutations](#/problems/permutations) — then the dedup variants [90](#/problems/subsets-ii) and [47](#/problems/permutations-ii).
`,
  },
  '4537': {
    t: 'More constrained backtracking',
    c: `
Real backtracking problems add constraints that prune the decision tree hard. Two classics show the pattern.

## Phone letters — constraint-free but multi-domain

Each digit maps to letters; the tree just walks digits ([17. Letter Combinations of a Phone Number](#/problems/letter-combinations-of-a-phone-number)):

\`\`\`python
def letter_combos(digits):
    pad = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
           '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}
    out, path = [], []
    def dfs(i):
        if i == len(digits):
            out.append(''.join(path)); return
        for ch in pad[digits[i]]:
            path.append(ch); dfs(i + 1); path.pop()
    dfs(0)
    return out if digits else []
\`\`\`

## Combination Sum — reusable choices, no duplicates in answers

Choices are values; a branch may reuse the same value, so recurse with \`i\` (not \`i+1\`). Sorting + breaking on overshoot prunes massively ([39. Combination Sum](#/problems/combination-sum)):

\`\`\`python
def combination_sum(candidates, target):
    candidates.sort()
    out, path = [], []
    def dfs(i, remain):
        if remain == 0:
            out.append(path[:]); return
        for j in range(i, len(candidates)):
            if candidates[j] > remain:
                break                     # sorted ⇒ nothing later fits
            path.append(candidates[j])
            dfs(j, remain - candidates[j])   # j again: unlimited reuse
            path.pop()
    dfs(0, target)
    return out
\`\`\`

Compare variants: [40](#/problems/combination-sum-ii) (each value once → recurse with \`j+1\`, skip equal siblings), [216](#/problems/combination-sum-iii) (exactly k numbers).

## N-Queens — feasibility pruning showcase

Place queens row by row; keep three sets (columns, diagonals ↘ keyed by \`r−c\`, anti-diagonals ↙ by \`r+c\`). A column/diagonal clash prunes instantly, keeping the exponential tree tiny in practice ([51. N-Queens](#/problems/n-queens)).

<div class="svg-wrap">
<svg viewBox="0 0 720 150" role="img" aria-label="Constraint keys for queens">
  <g font-size="12.5">
    <rect x="40" y="35" width="200" height="66" rx="10" fill="rgba(45,181,93,.12)" stroke="#2db55d"/><text x="140" y="60" text-anchor="middle" font-weight="700">cols: c</text><text x="140" y="82" text-anchor="middle" opacity=".7">same column forbidden</text>
    <rect x="260" y="35" width="200" height="66" rx="10" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/><text x="360" y="60" text-anchor="middle" font-weight="700">diag ↘ : r − c</text><text x="360" y="82" text-anchor="middle" opacity=".7">constant along the diagonal</text>
    <rect x="480" y="35" width="200" height="66" rx="10" fill="rgba(139,92,246,.14)" stroke="#8b5cf6"/><text x="580" y="60" text-anchor="middle" font-weight="700">anti ↙ : r + c</text><text x="580" y="82" text-anchor="middle" opacity=".7">constant along the anti-diagonal</text>
  </g>
</svg>
</div>

> Constrained backtracking checklist: define state → enumerate choices → prune with cheap checks → undo cleanly.
`,
  },
  '4538': {
    t: 'Backtracking quiz',
    c: `
Five checks.

**Q1.** The step that distinguishes backtracking from plain DFS enumeration is…

- A. Recursion — B. Undoing state changes after exploring a choice — C. Sorting input — D. Memoization

<details><summary>Solution</summary><p><strong>B.</strong> Choose → explore → <em>un-choose</em>; shared mutable state gets restored.</p></details>

**Q2.** Why copy the path into results (<code>path[:]</code>)?

- A. Speed — B. The list keeps mutating during backtracking; stored references would all alias the final state — C. Sorting — D. Type safety

<details><summary>Solution</summary><p><strong>B.</strong> Snapshot at leaf time or lose the answer.</p></details>

**Q3.** Combination Sum recurses with <code>j</code>; Combination Sum II uses <code>j+1</code>. Because…

- A. Style — B. Reuse allowed vs each value usable once — C. Sorting differences — D. Python quirk

<details><summary>Solution</summary><p><strong>B.</strong> Unlimited supply re-picks the same index; single-use moves past it.</p></details>

**Q4.** Removing duplicate output combinations in "candidates may repeat" is done by…

- A. Using a set of lists at the end — B. Sorting, then skipping equal siblings at the same tree level — C. Hashing sums — D. Doubling recursion depth

<details><summary>Solution</summary><p><strong>B.</strong> Equal values adjacent after sorting: allow the first as a sibling, skip subsequent ones.</p></details>

**Q5.** Time to generate all subsets of n items?

- A. O(n) — B. O(n log n) — C. O(2ⁿ·n) counting output copying — D. O(n²)

<details><summary>Solution</summary><p><strong>C.</strong> 2ⁿ leaves, each copied at O(n).</p></details>
`,
  },
  '4713': {
    t: 'Bonus problems, backtracking',
    c: `
Extra reps — write the skeleton first, prune second.

| Problem | Difficulty | trains |
|---|---|---|
| [784. Letter Case Permutation](#/problems/letter-case-permutation) | Medium | binary choices per char |
| [78. Subsets](#/problems/subsets) | Medium | core generator |
| [77. Combinations](#/problems/combinations) | Medium | bounded generator |
| [46. Permutations](#/problems/permutations) | Medium | used[] flags |
| [17. Letter Combinations of a Phone Number](#/problems/letter-combinations-of-a-phone-number) | Medium | cartesian product |
| [39. Combination Sum](#/problems/combination-sum) | Medium | reusable picks |
| [40. Combination Sum II](#/problems/combination-sum-ii) | Medium | sibling dedup |
| [22. Generate Parentheses](#/problems/generate-parentheses) | Medium | validity pruning |
| [79. Word Search](#/problems/word-search) | Medium | grid path undo |
| [131. Palindrome Partitioning](#/problems/palindrome-partitioning) | Medium | cut positions |
| [90. Subsets II](#/problems/subsets-ii) | Medium | sorted sibling skip |
| [47. Permutations II](#/problems/permutations-ii) | Medium | duplicate handling |
| [51. N-Queens](#/problems/n-queens) | Hard | set-based pruning |

**Challenge goals:** Generate Parentheses with zero invalid states ever created (prune via open/close counters, not post-validation); Word Search under 15 minutes with correct board restoration.
`,
  },
};
