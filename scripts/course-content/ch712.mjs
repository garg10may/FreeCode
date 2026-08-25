// Chapter 712 - Dynamic programming (locked articles)
export default {
  '4539': {
    t: 'Dynamic programming',
    c: `
Dynamic programming (DP) = **recursion + not repeating yourself**. When the same subproblems keep reappearing, cache their answers — exponential collapses to polynomial.

## The two telltale signs

1. **Overlapping subproblems** — the recursion tree revisits identical states.
2. **Optimal substructure** — an optimal answer is built from optimal answers to smaller inputs.

Fibonacci shows both painfully:

<div class="svg-wrap">
<svg viewBox="0 0 720 220" role="img" aria-label="Overlapping subproblems in fib">
  <g stroke="#9d9d9d" stroke-width="1.4"><line x1="360" y1="48" x2="200" y2="96"/><line x1="360" y1="48" x2="520" y2="96"/><line x1="200" y1="116" x2="120" y2="160"/><line x1="200" y1="116" x2="280" y2="160"/><line x1="520" y1="116" x2="440" y2="160"/><line x1="520" y1="116" x2="600" y2="160"/></g>
  <g font-size="13" font-family="ui-monospace, monospace">
    <circle cx="360" cy="36" r="21" fill="rgba(255,161,22,.18)" stroke="#ffa116"/><text x="360" y="41" text-anchor="middle">f(5)</text>
    <circle cx="200" cy="106" r="20" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="200" y="111" text-anchor="middle">f(4)</text>
    <circle cx="520" cy="106" r="20" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="520" y="111" text-anchor="middle" font-weight="700">f(3)②</text>
    <circle cx="120" cy="170" r="19" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="120" y="175" text-anchor="middle" font-weight="700">f(3)①</text>
    <circle cx="280" cy="170" r="19" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="280" y="175" text-anchor="middle">f(2)</text>
    <circle cx="440" cy="170" r="19" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="440" y="175" text-anchor="middle">f(2)</text>
    <circle cx="600" cy="170" r="19" fill="rgba(239,71,67,.14)" stroke="#ef4743"/><text x="600" y="175" text-anchor="middle">f(1)</text>
  </g>
  <text x="660" y="212" text-anchor="end" font-size="12" fill="#ef4743" font-weight="700">f(2), f(3) recomputed — memoize them!</text>
</svg>
</div>

Plain recursion: O(φⁿ). With a one-line cache: O(n). That's DP's entire magic.

## Top-down vs bottom-up

| | Memoized recursion (top-down) | Tabulation (bottom-up) |
|---|---|---|
| Style | write natural recursion, add \`@cache\`/map | loop from base cases upward |
| Pros | matches problem statement; computes only needed states | no stack limits, easy space tricks |
| Cons | recursion depth | must order states correctly |

Interview advice: prototype top-down, then convert if asked for "the DP table".

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
\`\`\`

## What counts as a "state"?

The arguments of your recursion: usually (index, remaining capacity, last choice…). If you can name a state precisely and give its recurrence, you have solved the problem — coding is clerical.
`,
  },
  '4540': {
    t: 'Framework for DP',
    c: `
A repeatable five-step framework. Use it on every DP question until it's reflex.

## The steps

<div class="svg-wrap">
<svg viewBox="0 0 720 150" role="img" aria-label="DP framework steps">
  <g font-size="12">
    <rect x="20"  y="35" width="128" height="66" rx="10" fill="rgba(255,161,22,.15)" stroke="#ffa116"/><text x="84"  y="62" text-anchor="middle" font-weight="700">1 · State</text><text x="84" y="82" text-anchor="middle" opacity=".7">what dp[i] means</text>
    <rect x="168" y="35" width="128" height="66" rx="10" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><text x="232" y="62" text-anchor="middle" font-weight="700">2 · Recurrence</text><text x="232" y="82" text-anchor="middle" opacity=".7">dp[i] from smaller</text>
    <rect x="316" y="35" width="128" height="66" rx="10" fill="rgba(139,92,246,.14)" stroke="#8b5cf6"/><text x="380" y="62" text-anchor="middle" font-weight="700">3 · Base cases</text><text x="380" y="82" text-anchor="middle" opacity=".7">smallest truths</text>
    <rect x="464" y="35" width="128" height="66" rx="10" fill="rgba(45,181,93,.15)" stroke="#2db55d"/><text x="528" y="62" text-anchor="middle" font-weight="700">4 · Order</text><text x="528" y="82" text-anchor="middle" opacity=".7">deps ready first</text>
    <rect x="612" y="35" width="90" height="66" rx="10" fill="rgba(239,71,67,.12)" stroke="#ef4743"/><text x="657" y="62" text-anchor="middle" font-weight="700">5 · Answer</text><text x="657" y="82" text-anchor="middle" opacity=".7">where? which cell?</text>
  </g>
</svg>
</div>

## Applied: climbing stairs ([70](#/problems/climbing-stairs))

1. **State:** \`dp[i]\` = ways to reach step i
2. **Recurrence:** came from i−1 (1-step) or i−2 (2-step) ⇒ \`dp[i] = dp[i-1] + dp[i-2]\`
3. **Base:** \`dp[0]=1, dp[1]=1\`
4. **Order:** ascending
5. **Answer:** \`dp[n]\`

## Applied: house robber ([198](#/problems/house-robber))

1. \`dp[i]\` = max loot considering first i houses
2. rob or skip: \`dp[i] = max(dp[i-1], dp[i-2] + nums[i])\`
3. \`dp[0]=0\` (empty prefix)
4. ascending
5. \`dp[n]\`

Notice both recurrences are "**best of my available final decisions**". That's what a recurrence *is*.

## Sanity checks before coding

- Does state capture everything the future depends on? (If not, add a dimension.)
- Are dependencies strictly "smaller"? (Guarantees termination.)
- Can two different paths reach the same state? (That's why caching pays.)

## Space optimization preview

When \`dp[i]\` needs only the previous row/cell, keep those variables instead of the whole table:

\`\`\`python
prev2, prev1 = 1, 1            # stairs
for _ in range(2, n + 1):
    prev2, prev1 = prev1, prev1 + prev2
return prev1
\`\`\`

Mentioning this O(n)→O(1) trick unprompted signals seniority.
`,
  },
  '4541': {
    t: '1D problems',
    c: `
One-dimensional DP: the state tracks position along a sequence (plus occasionally a small extra flag). Master these three archetypes.

## Archetype 1 — count paths/ways (additive)

Climbing stairs generalized: min-cost climbing path where each step costs \`cost[i]\`:

\`\`\`python
# dp[i] = cheapest total to stand on step i
prev2, prev1 = 0, 0
for c in cost:
    prev2, prev1 = prev1, min(prev1, prev2) + c
return min(prev1, prev2)
\`\`\`
[746. Min Cost Climbing Stairs](#/problems/min-cost-climbing-stairs)

## Archetype 2 — take/skip with constraints (robber family)

Houses in a line, can't rob adjacent:

<div class="svg-wrap">
<svg viewBox="0 0 720 170" role="img" aria-label="House robber decisions">
  <g font-size="13">
    <rect x="60"  y="40" width="90" height="44" rx="9" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="105" y="67" text-anchor="middle" font-weight="700">$2 ✓</text>
    <rect x="150" y="40" width="90" height="44" rx="9" stroke="#6b7280" fill="none" stroke-dasharray="5 4"/><text x="195" y="67" text-anchor="middle" opacity=".55">$7 ✗</text>
    <rect x="240" y="40" width="90" height="44" rx="9" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="285" y="67" text-anchor="middle" font-weight="700">$9 ✓</text>
    <rect x="330" y="40" width="90" height="44" rx="9" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="375" y="67" text-anchor="middle" font-weight="700">$3 ✓</text>
    <rect x="420" y="40" width="90" height="44" rx="9" stroke="#6b7280" fill="none" stroke-dasharray="5 4"/><text x="465" y="67" text-anchor="middle" opacity=".55">$1 ✗</text>
    <rect x="510" y="40" width="90" height="44" rx="9" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="555" y="67" text-anchor="middle" font-weight="700">$5 ✓</text>
  </g>
  <text x="360" y="120" text-anchor="middle" font-size="12.5" fill="#2db55d" font-weight="700">dp[i] = max(dp[i-1] , dp[i-2] + nums[i]) → 2+9+... best = 2+9+... here 2+9+5 vs alternatives</text>
  <text x="360" y="145" text-anchor="middle" font-size="12" opacity=".65">green = robbed; never two adjacent — recurrence enforces it automatically</text>
</svg>
</div>

[198](#/problems/house-robber), circular version [213](#/problems/house-robber-ii) (run twice: use-first / drop-first), tree version appears later.

## Archetype 3 — subsequence reasoning (LIS)

Longest increasing subsequence: \`dp[i]\` = LIS ending at i; look back at all j<i:

\`\`\`python
dp = [1] * n
for i in range(n):
    for j in range(i):
        if nums[j] < nums[i]:
            dp[i] = max(dp[i], dp[j] + 1)
return max(dp)
\`\`\`

O(n²) baseline everyone should know; the O(n log n) patience-sorting trick is a bonus flex ([300. LIS](#/problems/longest-increasing-subsequence)).

## Recognizing 1-D DP

"count ways", "min/max cost reaching position i", "can you reach/make X" over a single sequence — with small local dependency windows. Write state sentence first, code second.

### Practice set
[70](#/problems/climbing-stairs) · [198](#/problems/house-robber) · [746](#/problems/min-cost-climbing-stairs) · [300](#/problems/longest-increasing-subsequence) · [139. Word Break](#/problems/word-break)
`,
  },
  '4542': {
    t: 'Multi-dimensional problems',
    c: `
Add dimensions when the future depends on more than position: a budget left, items considered so far, a second pointer into another string.

## Knapsack — the canonical 2D

n items, weights w[i], values v[i], capacity W. State: \`dp[i][cap]\` = best value using first i items within cap:

$$dp[i][c] = \\max\\big(dp[i-1][c],\\; dp[i-1][c-w_i] + v_i\\big)$$

(skip it | take it — only possible when \`w_i ≤ c\`)

<div class="svg-wrap">
<svg viewBox="0 0 720 190" role="img" aria-label="Knapsack table dependency">
  <g font-size="11.5" font-family="ui-monospace, monospace" fill="currentColor" opacity=".75">
    <text x="60" y="30">cap →</text>
    <text x="40" y="52">i=2</text><text x="40" y="82">i=3</text>
  </g>
  <g font-size="12">
    <rect x="80"  y="38" width="64" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="112" y="56" text-anchor="middle">dp[2][c]</text>
    <rect x="144" y="38" width="64" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="176" y="56" text-anchor="middle">dp[2][c+1]</text>
    <rect x="208" y="38" width="72" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="244" y="56" text-anchor="middle">dp[2][c+w]</text>
    <rect x="80"  y="74" width="64" height="26" rx="6" fill="rgba(255,161,22,.18)" stroke="#ffa116"/><text x="112" y="92" text-anchor="middle">← skip</text>
    <rect x="208" y="74" width="72" height="26" rx="6" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="244" y="92" text-anchor="middle" font-weight="700">+ take</text>
    <path d="M112 66 V72" stroke="#ffa116" stroke-width="1.8"/>
    <path d="M244 66 C 230 72, 180 78, 152 84" stroke="#2db55d" stroke-width="1.8" fill="none"/>
  </g>
  <text x="430" y="58" font-size="12.5" fill="currentColor" opacity=".75">row i reads only row i−1 ⇒ keep two rows (or reverse-scan one)</text>
  <text x="430" y="84" font-size="12.5" fill="#ef4743">forward scan on 1-row knapsack = item reuse bug!</text>
</svg>
</div>

\`\`\`python
dp = [0] * (W + 1)
for w, v in items:
    for c in range(W, w - 1, -1):     # backwards: each item once
        dp[c] = max(dp[c], dp[c - w] + v)
return dp[W]
\`\`\`

**Direction matters:** backward loop = 0/1 knapsack (each item once); forward loop = unbounded ("coin change" style reuse).

## Two-sequence DP — edit distance family

State \`dp[i][j]\` = answer for prefixes \`a[:i]\`, \`b[:j]\`. Recurrence considers the last pair:

\`\`\`python
# longest common subsequence
if a[i-1] == b[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1
else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
\`\`\`

Same skeleton solves [1143. LCS](#/problems/longest-common-subsequence), [72. Edit Distance](#/problems/edit-distance) (min of insert/delete/replace), and [712](#/problems/minimum-ascii-delete-sum-for-two-strings).

### Practice set
[416. Partition Equal Subset Sum](#/problems/partition-equal-subset-sum) · [494. Target Sum](#/problems/target-sum) · [1143](#/problems/longest-common-subsequence) · [72](#/problems/edit-distance)
`,
  },
  '4543': {
    t: 'Matrix DP',
    c: `
Grids make states visual: \`dp[r][c]\` sits literally on the map, depending on cells above/left (or wherever movement allows).

## Unique paths II — counting with obstacles

\`dp[r][c]\` = ways to reach cell (r,c):

$$dp[r][c] = \\big(dp[r-1][c] + dp[r][c-1]\\big) \\times [\\text{cell open}]$$

<div class="svg-wrap">
<svg viewBox="0 0 720 210" role="img" aria-label="Grid DP accumulation">
  <g font-size="12.5">
    <g><rect x="140" y="40" width="60" height="42" rx="8" fill="rgba(255,161,22,.2)" stroke="#ffa116"/><text x="170" y="66" text-anchor="middle" font-weight="700">1</text></g>
    <g><rect x="200" y="40" width="60" height="42" rx="8" stroke="#6b7280" fill="none"/><text x="230" y="66" text-anchor="middle">1</text><rect x="260" y="40" width="60" height="42" rx="8" stroke="#6b7280" fill="none"/><text x="290" y="66" text-anchor="middle">1</text></g>
    <g><rect x="140" y="82" width="60" height="42" rx="8" stroke="#6b7280" fill="none"/><text x="170" y="108" text-anchor="middle">1</text><rect x="200" y="82" width="60" height="42" rx="8" fill="rgba(239,71,67,.16)" stroke="#ef4743"/><text x="230" y="108" text-anchor="middle">🚫</text><rect x="260" y="82" width="60" height="42" rx="8" stroke="#6b7280" fill="none"/><text x="290" y="108" text-anchor="middle">0</text></g>
    <g><rect x="140" y="124" width="60" height="42" rx="8" stroke="#6b7280" fill="none"/><text x="170" y="150" text-anchor="middle">1</text><rect x="200" y="124" width="60" height="42" rx="8" stroke="#6b7280" fill="none"/><text x="230" y="150" text-anchor="middle">1</text><rect x="260" y="124" width="60" height="42" rx="8" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="290" y="150" text-anchor="middle" font-weight="700">1</text></g>
    <path d="M296 145 H 350" stroke="#2db55d" stroke-width="1.8" marker-end="url(#gp)"/>
    <defs><marker id="gp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2db55d"/></marker></defs>
  </g>
  <text x="450" y="70" font-size="12.5" fill="currentColor" opacity=".75">each cell = sum of reachable neighbors ↑ and ←</text>
  <text x="450" y="95" font-size="12.5" fill="#ef4743">obstacle zeroes its cell AND blocks flow through it</text>
  <text x="450" y="120" font-size="12.5" fill="#2db55d">answer = bottom-right cell</text>
  <text x="170" y="188" text-anchor="middle" font-size="12" opacity=".65">grid = the DP table itself — often updatable in place</text>
</svg>
</div>

\`\`\`python
dp = [[0]*ncol for _ in range(nrow)]
dp[0][0] = 1 if grid[0][0] == 0 else 0
for r in range(nrow):
    for c in range(ncol):
        if grid[r][c] == 1: continue          # obstacle
        if r: dp[r][c] += dp[r-1][c]
        if c: dp[r][c] += dp[r][c-1]
return dp[-1][-1]
\`\`\`

[63. Unique Paths II](#/problems/unique-paths-ii); without obstacles it's [62](#/problems/unique-paths).

## Minimum path sums — same shape, min instead of +

$$dp[r][c] = grid[r][c] + \\min(dp[r-1][c], dp[r][c-1])$$

[64. Minimum Path Sum](#/problems/minimum-path-sum); triangle variant compresses a whole row ([120](#/problems/triangle)).

## When moves go further

Diagonals allowed? Add that term. K moves? Add a dimension. Falling-path variants ([931](#/problems/minimum-falling-path-sum)) just widen the neighbor set — the framework never changes: state sentence, neighbor set, base row/column.

> Matrix DP complexity = number of cells × work per cell — say "O(rows·cols)" explicitly.
`,
  },
  '4544': {
    t: 'Dynamic programming quiz',
    c: `
Five checks on DP fundamentals.

**Q1.** What makes memoization worthwhile on a recursion?

- A. Any recursion benefits — B. Overlapping subproblems: identical states recur — C. Deep stacks — D. Sorted input

<details><summary>Solution</summary><p><strong>B.</strong> Distinct-state count bounds the work after caching.</p></details>

**Q2.** Climbing stairs recurrence is <code>dp[i]=dp[i-1]+dp[i-2]</code>. Why addition, not min/max?

- A. Convention — B. We're counting distinct ways; each way arrives via exactly one last move class — C. Fibonacci heritage — D. To allow negatives

<details><summary>Solution</summary><p><strong>B.</strong> Counting DPs add disjoint option sets; optimization DPs take min/max.</p></details>

**Q3.** In 0/1 knapsack's single-array version, iterating capacities backwards ensures…

- A. Cache friendliness only — B. Each item is used at most once (row i−1 values still intact) — C. Negative weights handled — D. Faster inner loop

<details><summary>Solution</summary><p><strong>B.</strong> Forward scanning would read already-updated cells = taking the item multiple times.</p></details>

**Q4.** Edit distance recurrence branches over…

- A. Sort orders — B. Replace (diag), delete (up), insert (left) — each mapping to one edit — C. Random splits — D. Heap operations

<details><summary>Solution</summary><p><strong>B.</strong> Three edits cover all alignments of the last characters.</p></details>

**Q5.** Grid DP with obstacles: an obstacle cell should get value…

- A. Infinity — B. Zero contribution (skip accumulation into/out of it) — C. −1 — D. Its own weight

<details><summary>Solution</summary><p><strong>B.</strong> Zero paths pass through; leaving it out of neighbors' sums blocks flow.</p></details>
`,
  },
  '4714': {
    t: 'Bonus problems, dynamic programming',
    c: `
Final DP reps spanning every archetype in the chapter.

| Problem | Difficulty | trains |
|---|---|---|
| [509. Fibonacci Number](#/problems/fibonacci-number) | Easy | warm-up memo |
| [70. Climbing Stairs](#/problems/climbing-stairs) | Easy | counting |
| [746. Min Cost Climbing Stairs](#/problems/min-cost-climbing-stairs) | Easy | min-cost 1D |
| [198. House Robber](#/problems/house-robber) | Medium | take/skip |
| [213. House Robber II](#/problems/house-robber-ii) | Medium | circular handling |
| [322. Coin Change](#/problems/coin-change) | Medium | unbounded knapsack |
| [518. Coin Change II](#/problems/coin-change-ii) | Medium | counting combos |
| [300. Longest Increasing Subsequence](#/problems/longest-increasing-subsequence) | Medium | subsequence DP |
| [139. Word Break](#/problems/word-break) | Medium | segmentation |
| [416. Partition Equal Subset Sum](#/problems/partition-equal-subset-sum) | Medium | 0/1 knapsack |
| [494. Target Sum](#/problems/target-sum) | Medium | subset transform |
| [152. Maximum Product Subarray](#/problems/maximum-product-subarray) | Medium | track max & min |
| [1143. Longest Common Subsequence](#/problems/longest-common-subsequence) | Medium | 2-sequence |
| [64. Minimum Path Sum](#/problems/minimum-path-sum) | Medium | matrix |
| [91. Decode Ways](#/problems/decode-ways) | Medium | tricky bases |
| [312. Burst Balloons](#/problems/burst-balloons) | Hard | interval DP |

**Challenge goals:** explain Coin Change vs Coin Change II loop-order difference out loud; solve Decode Ways with zero-based cases passing ("0" alone, leading zeros).
`,
  },
};
