// Chapter 714 - Bonus (locked articles)
export default {
  '4688': {
    t: 'Difference array',
    c: `
The **difference array** is prefix sums run backwards: it turns *range updates* into O(1) work, deferring the cost to a single final pass.

## The trick

To add \`v\` to every element of \`nums[l..r]\`: do only two writes —

\`\`\`python
diff[l] += v
diff[r + 1] -= v
\`\`\`

Then one prefix-sum pass reconstructs the real array:

<div class="svg-wrap">
<svg viewBox="0 0 720 200" role="img" aria-label="Difference array range update">
  <text x="360" y="20" text-anchor="middle" fill="currentColor" font-weight="700">add 5 to [1..3]: two writes instead of three (imagine millions)</text>
  <g font-size="13">
    <rect x="80"  y="40" width="90" height="38" rx="8" stroke="#6b7280" fill="none"/><text x="125" y="64" text-anchor="middle">diff: 0</text>
    <rect x="170" y="40" width="90" height="38" rx="8" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="215" y="64" text-anchor="middle" font-weight="700">+5</text>
    <rect x="260" y="40" width="90" height="38" rx="8" stroke="#6b7280" fill="none"/><text x="305" y="64" text-anchor="middle">0</text>
    <rect x="350" y="40" width="90" height="38" rx="8" stroke="#6b7280" fill="none"/><text x="395" y="64" text-anchor="middle">0</text>
    <rect x="440" y="40" width="100" height="38" rx="8" fill="rgba(239,71,67,.15)" stroke="#ef4743"/><text x="490" y="64" text-anchor="middle" font-weight="700">−5</text>
    <rect x="540" y="40" width="90" height="38" rx="8" stroke="#6b7280" fill="none"/><text x="585" y="64" text-anchor="middle">0</text>
  </g>
  <g font-size="12.5">
    <text x="360" y="112" text-anchor="middle" fill="currentColor" opacity=".75">prefix-sum pass →</text>
    <g>
      <rect x="140" y="128" width="80" height="36" rx="8" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/><text x="180" y="151" text-anchor="middle">0</text>
      <rect x="220" y="128" width="80" height="36" rx="8" fill="rgba(45,181,93,.25)" stroke="#2db55d"/><text x="260" y="151" text-anchor="middle" font-weight="700">5</text>
      <rect x="300" y="128" width="80" height="36" rx="8" fill="rgba(45,181,93,.25)" stroke="#2db55d"/><text x="340" y="151" text-anchor="middle" font-weight="700">5</text>
      <rect x="380" y="128" width="80" height="36" rx="8" fill="rgba(45,181,93,.25)" stroke="#2db55d"/><text x="420" y="151" text-anchor="middle" font-weight="700">5</text>
      <rect x="460" y="128" width="80" height="36" rx="8" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/><text x="500" y="151" text-anchor="middle">0</text>
      <rect x="540" y="128" width="80" height="36" rx="8" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/><text x="580" y="151" text-anchor="middle">0</text>
    </g>
    <text x="660" y="188" text-anchor="end" font-size="11.5" opacity=".6">k updates: O(k) + O(n) total — not O(k·n)</text>
  </g>
</svg>
</div>

Why it works: the running sum "turns on" at \`l\` and "turns off" after \`r\`.

## Where it wins

- Thousands of range-add ops then read once: [370. Range Addition](#/problems/range-addition) (premium), flight bookings ([1109. Corporate Flight Bookings](#/problems/corporate-flight-bookings))
- Character-count deltas over ranges ([2381. Shifting Letters II](#/problems/shifting-letters-ii))
- 2D version with four corner stamps for grid increments ([2536](#/problems/increment-submatrices-by-one))

> Symmetry to remember: **prefix sums** = many reads after few writes; **difference array** = many writes before one read.
`,
  },
  '4549': {
    t: 'Tries',
    c: `
A **trie** (prefix tree) stores strings by sharing common prefixes — lookups cost the word's length, not the dictionary's size.

## Shape

<div class="svg-wrap">
<svg viewBox="0 0 720 210" role="img" aria-label="Trie storing cat, car, dog">
  <g stroke="#9d9d9d" stroke-width="1.5">
    <line x1="120" y1="60" x2="70" y2="105"/><line x1="120" y1="60" x2="150" y2="105"/>
    <line x1="70" y1="125" x2="40" y2="165"/><line x1="70" y1="125" x2="105" y2="165"/>
    <line x1="150" y1="125" x2="185" y2="165"/>
    <line x1="430" y1="60" x2="400" y2="105"/><line x1="430" y1="60" x2="480" y2="105"/>
    <line x1="400" y1="125" x2="380" y2="165"/>
  </g>
  <g font-size="14">
    <circle cx="120" cy="48" r="20" fill="rgba(139,92,246,.14)" stroke="#8b5cf6"/><text x="120" y="53" text-anchor="middle">root</text>
    <circle cx="70"  cy="115" r="18" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="70" y="120" text-anchor="middle">c</text>
    <circle cx="150" cy="115" r="18" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="150" y="120" text-anchor="middle">d</text>
    <circle cx="40"  cy="175" r="17" fill="rgba(255,161,22,.18)" stroke="#ffa116"/><text x="40" y="180" text-anchor="middle">a</text>
    <circle cx="105" cy="175" r="17" stroke="#6b7280" fill="none"/><text x="105" y="180" text-anchor="middle" opacity=".55">t*</text>
    <circle cx="185" cy="175" r="17" stroke="#6b7280" fill="none"/><text x="185" y="180" text-anchor="middle" opacity=".55">r*</text>
    <circle cx="430" cy="48" r="20" fill="rgba(139,92,246,.14)" stroke="#8b5cf6"/><text x="430" y="53" text-anchor="middle" opacity="0">.</text>
    <circle cx="400" cy="115" r="18" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="400" y="120" text-anchor="middle">o</text>
    <circle cx="480" cy="115" r="18" stroke="#6b7280" fill="none"/><text x="480" y="120" text-anchor="middle" opacity=".55">…</text>
    <circle cx="380" cy="175" r="17" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="380" y="180" text-anchor="middle">g*</text>
    <text x="240" y="30" fill="currentColor" opacity=".65" font-size="12">stores {cat, car, dog} — shared prefixes are single paths; * = end-of-word flag</text>
  </g>
</svg>
</div>

## Node structure & core operations

\`\`\`python
class Node:
    def __init__(self):
        self.children = {}
        self.end = False

class Trie:
    def __init__(self):
        self.root = Node()

    def insert(self, word):
        cur = self.root
        for ch in word:
            cur = cur.children.setdefault(ch, Node())
        cur.end = True

    def search(self, word):            # exact
        return (n := self._walk(word)) and n.end

    def starts_with(self, prefix):
        return bool(self._walk(prefix))

    def _walk(self, s):
        cur = self.root
        for ch in s:
            if ch not in cur.children:
                return None
            cur = cur.children[ch]
        return cur
\`\`\`

Every operation: **O(L)** regardless of how many words are stored.

## When tries beat hash sets

- Prefix queries ("all words starting with…") — impossible for maps
- Autocomplete / spell-check walks
- Word-search on grids: prune DFS by "no trie path continues this way" ([212. Word Search II](#/problems/word-search-ii))
- Counting distinct prefixes ([14. Longest Common Prefix](#/problems/longest-common-prefix) alternatives)

## Variants worth naming

Compressed tries (radix), Aho–Corasick (multi-pattern), and the bitwise trie behind max-XOR problems ([421. Maximum XOR of Two Numbers](#/problems/maximum-xor-of-two-numbers-in-an-array)).
`,
  },
  '4550': {
    t: 'Bit manipulation',
    c: `
Bits are just base-2 digits, and a handful of identities solve whole problem families in O(1).

## The toolbox

| Expression | Meaning |
|---|---|
| \`x & 1\` | last bit (odd/even test) |
| \`x >> k\` | divide by 2ᵏ |
| \`x << k\` | multiply by 2ᵏ |
| \`x & (x - 1)\` | **clear lowest set bit** (Kernighan count) |
| \`x & (-x)\` | isolate lowest set bit |
| \`x ^ y\` | bits where they differ |
| \`x | (1 << k)\` | set bit k · \`x & ~(1 << k)\` clear it |

## The five classic tricks

**1. Count set bits** — loop \`x &= x-1\`; runs once per set bit:
\`\`\`python
def popcount(x):
    n = 0
    while x:
        x &= x - 1
        n += 1
    return n
\`\`\`
[191. Number of 1 Bits](#/problems/number-of-1-bits), [338. Counting Bits](#/problems/counting-bits)

**2. The single odd duck** — pairs cancel under XOR (\`a^a=0\`), so XOR-ing everything leaves the unpaired value: [136. Single Number](#/problems/single-number)

**3. Missing number** — XOR indices 0..n against all values; everything cancels but the absent one: [268. Missing Number](#/problems/missing-number)

**4. Subsets as bitmasks** — integer i from 0..2ⁿ−1 encodes an include/exclude decision per element:

<div class="svg-wrap">
<svg viewBox="0 0 720 160" role="img" aria-label="Bitmask subsets">
  <text x="360" y="22" text-anchor="middle" fill="currentColor" font-weight="700">n = 3 → masks 0..7 enumerate all subsets</text>
  <g font-family="ui-monospace, monospace" font-size="12.5">
    <text x="150" y="55">mask 101 → take a₀, skip a₁, take a₂ → {a₀, a₂}</text>
    <rect x="130" y="72" width="34" height="30" rx="6" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="147" y="92" text-anchor="middle">1</text>
    <rect x="164" y="72" width="34" height="30" rx="6" stroke="#6b7280" fill="none"/><text x="181" y="92" text-anchor="middle" opacity=".5">0</text>
    <rect x="198" y="72" width="34" height="30" rx="6" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="215" y="92" text-anchor="middle">1</text>
    <text x="280" y="92" opacity=".7">← bit k = decision for element k</text>
  </g>
  <text x="360" y="135" text-anchor="middle" font-size="12" opacity=".65">subset DP over masks: dp[mask] built from submasks — powerset in disguise</text>
</svg>
</div>

**5. Parity/power checks** — \`n & (n-1) == 0\` ⇔ power of two ([231](#/problems/power-of-two)); XOR-based carry loops implement addition ([371](#/problems/sum-of-two-integers)).

## Interview framing

Say the invariant, not just the trick: *"XOR is addition without carry, so equal values annihilate."* Explanations earn more than incantations.
`,
  },
  '4650': {
    t: 'Intervals',
    c: `
Interval problems share one move: **sort by start**, then sweep maintaining the current merged interval (or a heap of active ends).

## The three overlap cases

After sorting by start, compare each new interval \`(s, e)\` with the current merged end:

<div class="svg-wrap">
<svg viewBox="0 0 720 190" role="img" aria-label="Interval merge cases">
  <defs><marker id="iv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffa116"/></marker></defs>
  <g font-size="12">
    <text x="50" y="42" fill="currentColor" opacity=".7">case A:</text><rect x="120" y="28" width="110" height="24" rx="7" fill="rgba(76,159,254,.15)" stroke="#4c9ffe"/><text x="175" y="44" text-anchor="middle">cur</text><rect x="250" y="28" width="110" height="24" rx="7" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="305" y="44" text-anchor="middle">next ⊂ inside → extend end</text>
    <text x="50" y="88" fill="currentColor" opacity=".7">case B:</text><rect x="120" y="74" width="110" height="24" rx="7" fill="rgba(76,159,254,.15)" stroke="#4c9ffe"/><rect x="205" y="74" width="110" height="24" rx="7" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="330" y="90" text-anchor="middle">partial overlap → extend end</text>
    <text x="50" y="134" fill="currentColor" opacity=".7">case C:</text><rect x="120" y="120" width="110" height="24" rx="7" fill="rgba(76,159,254,.15)" stroke="#4c9ffe"/><rect x="290" y="120" width="110" height="24" rx="7" fill="rgba(239,71,67,.15)" stroke="#ef4743"/><text x="415" y="136" text-anchor="middle">gap → push cur, start new</text>
  </g>
  <path d="M230 40 C 260 55, 300 62, 335 66" stroke="#ffa116" stroke-width="1.6" stroke-dasharray="5 4" fill="none"/>
  <path d="M315 86 C 350 96, 380 98, 400 99" stroke="#ffa116" stroke-width="1.6" stroke-dasharray="5 4" fill="none"/>
</svg>
</div>

\`\`\`python
intervals.sort()                      # by start
merged = []
for s, e in intervals:
    if merged and s <= merged[-1][1]:          # overlap (touching counts)
        merged[-1][1] = max(merged[-1][1], e)   # extend
    else:
        merged.append([s, e])                    # new block
\`\`\`
[56. Merge Intervals](#/problems/merge-intervals) — write from memory.

## The family tree

| Problem | Twist | Practice |
|---|---|---|
| Insert one interval into merged list | splice mid-sweep | [57](#/problems/insert-interval) |
| Minimum removals to de-overlap | keep earliest ends (greedy ch.) | [435](#/problems/non-overlapping-intervals) |
| Meeting rooms — can one room host all? | detect any conflict | [252 (premium)](#/problems/meeting-rooms) |
| Meeting rooms II — fewest rooms | **events sort** or min-heap of ends | [253 (premium)](#/problems/meeting-rooms-ii) |

The events technique generalizes best: +1 at every start, −1 at every end, sort the events, track running sum — its peak is the answer. (Notice: that's the difference array idea from earlier, applied to time.)

## Pitfalls

- Touching intervals (\`[1,4] [4,5]\`): decide whether endpoints collide *per problem statement*.
- Always compare against \`max(cur_end)\`, not the previous interval's end — extensions can overshoot.
`,
  },
  '4551': {
    t: 'Modular arithmetic',
    c: `
Modular arithmetic keeps numbers small when answers explode combinatorially — ubiquitous in hard problems and system design questions alike.

## The rules that matter

\`(a op b) % M = ((a % M) op (b % M)) % M\` holds for **+ − ×** — but **not division** (use modular inverse, rare in interviews):

\`\`\`python
MOD = 10**9 + 7
(a * b) % MOD                       # safe even when a*b huge? NO in other langs:
# Java/C++: cast or reduce first — (a % MOD) * (b % MOD) % MOD
\`\`\`

In Python big ints make overflow moot, but interviewers asking about Java want exactly the parenthesized reduction above.

## Subtraction & negatives — the classic bug

\`(a - b) % M\` can be negative in C++/Java. Normalize:

\`\`\`java
int res = ((a - b) % MOD + MOD) % MOD;
\`\`\`

This single line prevents most wrong answers on counting problems.

## Patterns where mod appears

- **Counting answers modulo 1e9+7** — paths, tilings, string constructions ([1573](#/problems/number-of-ways-to-split-a-string), [1269](#/problems/number-of-ways-to-stay-in-the-same-place-after-some-steps))
- **Cyclic structures** — index wrapping: \`grid[(r + dr + R) % R]\`; circular arrays ([189. Rotate Array](#/problems/rotate-array) uses \`nums[(i+k)%n]\`)
- **Pigeonhole arguments** — among n+1 prefix mods some residue repeats ⇒ a subarray divisible by K ([974. Subarray Sums Divisible by K](#/problems/subarray-sums-divisible-by-k)):
  \`\`\`python
  cnt = defaultdict(int); cnt[0] = 1
  total = ans = 0
  for x in nums:
      total = (total + x) % k
      ans += cnt[total]              # same residue ⇒ divisible gap
      cnt[total] += 1
  \`\`\`
  Note \`((total % k) + k) % k\` when negatives appear.

> Say why the modulus never breaks equality checks: reductions preserve congruence classes, so "equal mod M" reasoning stays sound.
`,
  },
  '4841': {
    t: "Dijkstra's",
    c: `
When edge costs differ, BFS distances stop being correct — replace the FIFO queue with a **min-heap keyed by distance**: Dijkstra's algorithm.

## The algorithm

Repeatedly settle the closest unsettled node; relax its edges:

\`\`\`python
import heapq
def dijkstra(graph, src):                 # graph[u] = [(v, w), ...]
    dist = {src: 0}
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, float('inf')):
            continue                       # stale entry — skip
        for v, w in graph[u]:
            nd = d + w
            if nd < dist.get(v, float('inf')):
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist
\`\`\`

Complexity **O((V + E) log V)**. Requires non-negative weights (negative edges break the settling argument — that's Bellman-Ford territory, rarely asked).

## Watch it flow

<div class="svg-wrap">
<svg viewBox="0 0 720 210" role="img" aria-label="Dijkstra relaxation steps">
  <defs><marker id="dj" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
  <g font-size="13">
    <circle cx="90" cy="105" r="26" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2.2"/><text x="90" y="103" text-anchor="middle" font-weight="700">S</text><text x="90" y="118" text-anchor="middle" font-size="10.5">d=0 ✓</text>
    <circle cx="300" cy="55" r="24" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="300" y="53" text-anchor="middle">A</text><text x="300" y="68" text-anchor="middle" font-size="10.5">d=4 ✓</text>
    <circle cx="300" cy="155" r="24" fill="rgba(255,161,22,.2)" stroke="#ffa116"/><text x="300" y="153" text-anchor="middle">B</text><text x="300" y="168" text-anchor="middle" font-size="10.5">d=2</text>
    <circle cx="520" cy="105" r="24" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="520" y="103" text-anchor="middle">C</text><text x="520" y="118" text-anchor="middle" font-size="10.5">d=7?</text>
    <path d="M116 95 C 180 78, 230 66, 275 59" stroke="#9d9d9d" stroke-width="1.7" marker-end="url(#dj)"/><text x="196" y="62" font-size="11" fill="currentColor" opacity=".75">w=4</text>
    <path d="M116 115 C 180 132, 230 145, 275 152" stroke="#9d9d9d" stroke-width="1.7" marker-end="url(#dj)"/><text x="196" y="158" font-size="11" fill="currentColor" opacity=".75">w=2</text>
    <path d="M322 63 C 400 75, 450 85, 494 96" stroke="#9d9d9d" stroke-width="1.7" marker-end="url(#dj)"/><text x="410" y="66" font-size="11" fill="currentColor" opacity=".75">w=3</text>
    <path d="M324 148 C 400 138, 450 126, 494 114" stroke="#ffa116" stroke-width="1.9" marker-end="url(#dj)"/><text x="408" y="152" font-size="11" fill="#ffa116" font-weight="700">w=5 → 2+5=7</text>
  </g>
  <text x="360" y="200" text-anchor="middle" font-size="12" fill="currentColor" opacity=".7">B pops first (smaller key); C settles via B at 7 — heap always yields the global nearest frontier node</text>
</svg>
</div>

## Recognizing Dijkstra

*"Minimum cost/time/fuel…"* with **weighted** moves: [743. Network Delay Time](#/problems/network-delay-time), [1631. Path With Minimum Effort](#/problems/path-with-minimum-effort), [787. Cheapest Flights Within K Stops](#/problems/cheapest-flights-within-k-stops) (careful — the K-stop limit needs Bellman-Ford-style layered relaxation or a stops-dimension in state), [1514. Path with Maximum Probability](#/problems/path-with-maximum-probability) (maximize product ⇒ log-transform or negate).

## Family map

| Edge type | Tool |
|---|---|
| unweighted | BFS |
| weighted ≥ 0 | Dijkstra |
| negative edges | Bellman-Ford |
| MST (connect all cheaply) | Kruskal/Prim |
`,
  },
  '4651': {
    t: 'Final quiz',
    c: `
A mixed bag across the bonus topics. Target 7+/8.

**Q1.** Applying 10⁵ range-additions then reading once — best tool?

- A. Segment tree only — B. Difference array + one prefix pass — C. Re-scan ranges — D. Sort everything

<details><summary>Solution</summary><p><strong>B.</strong> O(updates + n). Segment trees shine for interleaved update+query, which isn't the case here.</p></details>

**Q2.** Trie lookup of a word of length L costs…

- A. O(1) — B. O(log alphabet) — C. O(L) — D. O(total words)

<details><summary>Solution</summary><p><strong>C.</strong> One step per character, independent of dictionary size.</p></details>

**Q3.** <code>x &amp; (x−1)</code> does what?

- A. Sets lowest bit — B. Clears lowest set bit — C. Reverses bits — D. Divides by two

<details><summary>Solution</summary><p><strong>B.</strong> Basis of fast popcount loops.</p></details>

**Q4.** Sorted-by-start intervals [1,4], [2,3]: merged result end should become…

- A. 3 — B. 4 — C. 7 — D. invalid input

<details><summary>Solution</summary><p><strong>B.</strong> Contained interval extends nothing: new end = max(4, 3) = 4.</p></details>

**Q5.** (a − b) mod M in Java may be…

- A. Always correct — B. Negative; normalize with ((a−b)%M+M)%M — C. Zero — D. Overflow-proof automatically

<details><summary>Solution</summary><p><strong>B.</strong> Java/C++ remainder takes the dividend's sign.</p></details>

**Q6.** Weighted shortest path, all weights positive?

- A. Plain BFS suffices — B. Dijkstra — C. Binary search — D. Union-Find

<details><summary>Solution</summary><p><strong>B.</strong> Non-uniform costs invalidate FIFO ordering guarantees.</p></details>

**Q7.** Why does Dijkstra forbid negative weights?

- A. Heap can't store them — B. A settled node could later be improved through negative edges, breaking the greedy invariant — C. Overflow — D. It doesn't

<details><summary>Solution</summary><p><strong>B.</strong> Settling assumes finality; negative cycles violate it.</p></details>

**Q8.** Among n+1 prefix sums mod K, some residue repeats because…

- A. Hashing luck — B. Pigeonhole: only K residues exist — C. Sorting — D. Never

<details><summary>Solution</summary><p><strong>B.</strong> Repeated residue ⇒ their difference (a contiguous subarray sum) ≡ 0 (mod K).</p></details>
`,
  },
  '4552': {
    t: 'Next steps',
    c: `
You've covered the interview canon. Here's how to convert coverage into offers.

## Consolidate (week 1–2)

- Redo your hardest 30 problems from blank editors — recognition must become recall.
- For every pattern in this course, maintain a personal one-page cheat sheet: template, complexity, signature problems. Writing it beats rereading mine.
- Fill chapter quizzes you scored below 5/5.

## Extend (weeks 3+)

Once the core feels solid, layer on:

| Direction | Topics | Entry points |
|---|---|---|
| Advanced DS | Union-Find, segment trees, BITs, monotonic deques revisited | [547. Number of Provinces](#/problems/number-of-provinces), [307. Range Sum Query - Mutable](#/problems/range-sum-query-mutable) |
| Graph depth | topological variants, MST, SCC | [1584. Min Cost to Connect All Points](#/problems/min-cost-to-connect-all-points) |
| Harder DP | bitmask DP, digit DP, interval DP | [312. Burst Balloons](#/problems/burst-balloons), [847. Shortest Path Visiting All Nodes](#/problems/shortest-path-visiting-all-nodes) |
| Company tags | filter by company in this app's sidebar | target lists for interviews scheduled |

## Simulate reality

- Full mock every week (see Interviews and tools chapter) until the format feels boring.
- Practice one "hard" problem cold weekly — interviews occasionally exceed medium; composure matters more than the extra IQ point.
- Keep the mistake journal going; review before every real interview.

## The bar to aim for

You're interview-ready for most screens when you can, given an unseen medium: restate it, propose brute force within 2 minutes, land the optimal approach within 10, code it bug-light, and name the pattern family. That's trainable — and you've now trained it.

Good hunting. 🥷 *(No emoji in commits, though.)*
`,
  },
};
