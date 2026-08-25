// Chapter 710 - Binary search (locked articles)
export default {
  '4696': {
    t: 'Binary Search',
    c: `
Binary search finds a target in **O(log n)** by halving the search space every step. It's short, famous, and famously easy to get subtly wrong — so we'll build it from invariants, not memorization.

## The core loop with an invariant you can trust

Maintain the statement: *"if the target exists, it lies inside [lo, hi]"* — and make every step keep that sentence true.

<div class="svg-wrap">
<svg viewBox="0 0 720 210" role="img" aria-label="Binary search halving">
  <g font-size="13">
    <text x="60" y="45" fill="currentColor" opacity=".7">step 1:</text>
    <rect x="130" y="28" width="480" height="30" rx="8" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><circle cx="370" cy="43" r="12" fill="#ffa116"/><text x="392" y="48" font-size="11.5">mid</text>
    <text x="620" y="48" font-size="11.5" fill="currentColor" opacity=".65">target &gt; mid → go right</text>
    <text x="60" y="105" fill="currentColor" opacity=".7">step 2:</text>
    <rect x="250" y="88" width="360" height="30" rx="8" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><circle cx="430" cy="103" r="12" fill="#ffa116"/>
    <text x="620" y="108" font-size="11.5" fill="currentColor" opacity=".65">target &lt; mid → go left</text>
    <text x="60" y="165" fill="currentColor" opacity=".7">step 3:</text>
    <rect x="330" y="148" width="180" height="30" rx="8" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="420" y="168" text-anchor="middle" font-weight="700" fill="#2db55d">found ✓</text>
    <path d="M614 43 C 650 70, 640 100, 616 102" stroke="#9d9d9d" stroke-width="1.4" stroke-dasharray="4 3" fill="none"/>
  </g>
  <text x="360" y="200" text-anchor="middle" font-size="12" fill="currentColor" opacity=".6">each comparison discards half ⇒ ⌈log₂ n⌉ steps</text>
</svg>
</div>

\`\`\`python
lo, hi = 0, len(nums) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if nums[mid] == target: return mid
    if nums[mid] < target:  lo = mid + 1
    else:                   hi = mid - 1
return -1
\`\`\`

## The three classic bugs (and their cures)

| Bug | Symptom | Cure |
|---|---|---|
| \`mid = (lo+hi)//2\` overflow (C++/Java) | crash on huge arrays | \`mid = lo + (hi-lo)/2\` |
| forgetting \`+1 / −1\` | infinite loops | always move *past* mid when excluding it |
| wrong while condition for your convention | off-by-one answers | pick **one** invariant style (below) and never mix |

## Two template styles — choose per problem

**Exact match** (above): \`while lo <= hi\`, both halves excluded.

**Boundary search** (first index satisfying predicate): \`while lo < hi\` keeping at least one candidate:

\`\`\`python
lo, hi = 0, len(nums)          # hi is exclusive-ish "possible answer"
while lo < hi:
    mid = (lo + hi) // 2
    if ok(mid): hi = mid        # mid may be the answer — keep it
    else:       lo = mid + 1    # mid is too small — discard
return lo                       # first index where ok() holds
\`\`\`

This second shape powers the next two lessons. Complexity either way: O(log n) time, O(1) space.
`,
  },
  '4532': {
    t: 'On arrays',
    c: `
Most array binary-search questions are the boundary template wearing costumes.

## First/last occurrence of duplicates

\`ok(i) = nums[i] >= target\` gives the **leftmost** insertion point; \`> target\` gives the rightmost+1:

<div class="svg-wrap">
<svg viewBox="0 0 720 150" role="img" aria-label="Leftmost boundary">
  <g font-size="13">
    <rect x="80" y="35" width="66" height="36" rx="7" stroke="#6b7280" fill="none"/><text x="113" y="58" text-anchor="middle">1</text>
    <rect x="146" y="35" width="66" height="36" rx="7" fill="rgba(255,161,22,.22)" stroke="#ffa116" stroke-width="2"/><text x="179" y="58" text-anchor="middle" font-weight="700">2</text>
    <rect x="212" y="35" width="66" height="36" rx="7" fill="rgba(255,161,22,.22)" stroke="#ffa116" stroke-width="2"/><text x="245" y="58" text-anchor="middle" font-weight="700">2</text>
    <rect x="278" y="35" width="66" height="36" rx="7" fill="rgba(255,161,22,.22)" stroke="#ffa116" stroke-width="2"/><text x="311" y="58" text-anchor="middle" font-weight="700">2</text>
    <rect x="344" y="35" width="66" height="36" rx="7" stroke="#6b7280" fill="none"/><text x="377" y="58" text-anchor="middle">5</text>
    <rect x="410" y="35" width="66" height="36" rx="7" stroke="#6b7280" fill="none"/><text x="443" y="58" text-anchor="middle">7</text>
  </g>
  <path d="M160 90 H296" stroke="#ffa116" stroke-width="2.4"/>
  <text x="228" y="115" text-anchor="middle" font-size="12.5" fill="#ffa116" font-weight="700">target 2 → first at idx 1, last at idx 3 = first(≥3) − 1</text>
  <text x="600" y="58" font-size="11.5" fill="currentColor" opacity=".6">sorted, so boundaries are findable in log n</text>
</svg>
</div>

[34. Find First and Last Position](#/problems/find-first-and-last-position-of-element-in-sorted-array), and its library form: Python \`bisect_left/bisect_right\`.

## Rotated sorted array

One half of a rotated array is always sorted; decide which half mid lies in, then test whether target is inside it ([33. Search in Rotated Sorted Array](#/problems/search-in-rotated-sorted-array)):

\`\`\`python
if nums[lo] <= nums[mid]:            # left half sorted
    if nums[lo] <= target < nums[mid]: hi = mid - 1
    else:                              lo = mid + 1
else:                                  # right half sorted
    if nums[mid] < target <= nums[hi]: lo = mid + 1
    else:                              hi = mid - 1
\`\`\`

The \`<=\` on the sortedness check matters when the half has one element. Variant with duplicates ([81](#/problems/search-in-rotated-sorted-array-ii)) degrades to O(n) worst case because equal ends force a shrink step — say this out loud in interviews.

## Peak finding

Compare \`mid\` to its neighbor; walk uphill — guaranteed to terminate on a peak since edges are −∞ ([162. Find Peak Element](#/problems/find-peak-element)).

## Mindset shift

Stop asking "where is X?" and start asking "**for which index does a monotone predicate flip from false to true?**" — sorted or not.
`,
  },
  '4533': {
    t: 'On solution spaces',
    c: `
The most transferable binary-search idea: forget arrays entirely — **binary search the answer** whenever you can phrase a yes/no question whose truth flips exactly once as the number grows.

## The setup

Define \`ok(x)\`: *"is x achievable/sufficient?"* If larger x makes ok() only more true (monotone), then the minimal feasible x is findable in log(range) · cost(ok).

<div class="svg-wrap">
<svg viewBox="0 0 720 170" role="img" aria-label="Monotone predicate flip">
  <line x1="60" y1="120" x2="660" y2="120" stroke="currentColor" opacity=".3"/>
  <g font-size="13" font-family="ui-monospace, monospace">
    <rect x="90"  y="60" width="52" height="26" rx="6" fill="rgba(239,71,67,.15)" stroke="#ef4743"/><text x="116" y="77" text-anchor="middle" fill="#ef4743">no</text>
    <rect x="152" y="60" width="52" height="26" rx="6" fill="rgba(239,71,67,.15)" stroke="#ef4743"/><text x="178" y="77" text-anchor="middle" fill="#ef4743">no</text>
    <rect x="214" y="60" width="52" height="26" rx="6" fill="rgba(239,71,67,.15)" stroke="#ef4743"/><text x="240" y="77" text-anchor="middle" fill="#ef4743">no</text>
    <rect x="276" y="60" width="52" height="26" rx="6" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="302" y="77" text-anchor="middle" fill="#2db55d" font-weight="700">YES</text>
    <rect x="338" y="60" width="52" height="26" rx="6" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="364" y="77" text-anchor="middle" fill="#2db55d">yes</text>
    <rect x="400" y="60" width="52" height="26" rx="6" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="426" y="77" text-anchor="middle" fill="#2db55d">yes</text>
    <text x="302" y="140" text-anchor="middle" fill="#ffa116" font-weight="700">flip point = minimal feasible answer</text>
    <path d="M302 92 V112" stroke="#ffa116" stroke-width="1.8"/>
  </g>
</svg>
</div>

## Worked example — Koko eating bananas

*"Minimum eating speed to finish piles within h hours."* Speed s too slow → no; fast enough → yes, monotonically. Binary search s over [1, max(pile)], with \`ok(s)\` an O(n) sweep:

\`\`\`python
def min_eating_speed(piles, h):
    def ok(s):
        return sum((p + s - 1) // s for p in piles) <= h
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid): hi = mid
        else:       lo = mid + 1
    return lo
\`\`\`

Complexity: O(n · log(max)). Brute forcing every speed would be O(n · max) — hopeless.

## Same skeleton, different ok()

- Split array into k pieces minimizing largest sum — \`ok(cap)\`: greedy-fill pieces under cap ([410](#/problems/split-array-largest-sum))
- Smallest divisor keeping sum-of-quotients ≤ threshold ([1283](#/problems/find-the-smallest-divisor-given-a-threshold))
- Minimum days / ships / stations / radius… ([1011](#/problems/capacity-to-ship-packages-within-d-days), [875](#/problems/koko-eating-bananas))

## Recognizing it

Phrases: *"minimize the maximum…"*, *"maximum of the minimum…"*, *"least capacity/speed/time such that…"*. Those superlatives stacked together are the signature — direct optimization looks exponential, but the *feasibility check* is easy and monotone.
`,
  },
  '4534': {
    t: 'Binary search quiz',
    c: `
Five checks.

**Q1.** Why must updates exclude mid (\`mid+1\`/\`mid−1\`) in exact-match search?

- A. Style — B. mid was already compared; leaving it in range can loop forever — C. Overflow safety — D. Sorting stability

<details><summary>Solution</summary><p><strong>B.</strong> Keeping mid reachable after comparing it risks an infinite loop on 2-element windows.</p></details>

**Q2.** Boundary template keeps <code>hi = mid</code> when ok(mid). Why?

- A. To slow down — B. mid itself might be the first true answer, discarding it would lose optimality — C. Memory — D. Symmetry

<details><summary>Solution</summary><p><strong>B.</strong> Predicate-flip search must preserve candidates; only provably-false mids get discarded.</p></details>

**Q3.** Rotated-array search decides direction using…

- A. Randomness — B. Which half is sorted (compare nums[lo] vs nums[mid]) — C. Array length — D. Target parity

<details><summary>Solution</summary><p><strong>B.</strong> Exactly one half is normally sorted; membership test routes the search.</p></details>

**Q4.** "Minimize the maximum subarray sum with ≤ k splits" is solvable by…

- A. Greedy alone — B. Binary searching cap with a greedy feasibility scan — C. Two pointers — D. Heap

<details><summary>Solution</summary><p><strong>B.</strong> Feasibility of a cap is monotone; each check is one linear pass.</p></details>

**Q5.** Overall complexity of solution-space search with range R and O(n) check?

- A. O(n·R) — B. O(n + log R) — C. O(n·log R) — D. O(R log n)

<details><summary>Solution</summary><p><strong>C.</strong> ~log R checks, each costing O(n).</p></details>
`,
  },
  '4712': {
    t: 'Bonus problems, binary search',
    c: `
Extra reps across all three flavors.

| Problem | Difficulty | trains |
|---|---|---|
| [704. Binary Search](#/problems/binary-search) | Easy | exact match |
| [35. Search Insert Position](#/problems/search-insert-position) | Easy | lower bound |
| [278. First Bad Version](#/problems/first-bad-version) | Easy | pure predicate |
| [69. Sqrt(x)](#/problems/sqrtx) | Easy | solution space |
| [34. Find First and Last Position](#/problems/find-first-and-last-position-of-element-in-sorted-array) | Medium | double boundary |
| [33. Search in Rotated Sorted Array](#/problems/search-in-rotated-sorted-array) | Medium | half-sorted logic |
| [153. Find Minimum in Rotated Sorted Array](#/problems/find-minimum-in-rotated-sorted-array) | Medium | predicate on neighbor |
| [162. Find Peak Element](#/problems/find-peak-element) | Medium | uphill walk |
| [875. Koko Eating Bananas](#/problems/koko-eating-bananas) | Medium | speed space |
| [1011. Capacity To Ship Packages Within D Days](#/problems/capacity-to-ship-packages-within-d-days) | Medium | capacity space |
| [1283. Find the Smallest Divisor Given a Threshold](#/problems/find-the-smallest-divisor-given-a-threshold) | Medium | divisor space |
| [410. Split Array Largest Sum](#/problems/split-array-largest-sum) | Hard | minimize-maximum |
| [4. Median of Two Sorted Arrays](#/problems/median-of-two-sorted-arrays) | Hard | partition search |

**Challenge goals:** implement bisect_left from memory twice without peeking; solve 875 and 1011 back-to-back and notice they are *the same program* with a different \`ok()\`.
`,
  },
};
