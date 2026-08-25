// Chapter 703 - Arrays and strings (locked articles)
export default {
  '4500': {
    t: 'Arrays and strings',
    c: `
Arrays and strings are the backbone of interviews. They are both **ordered collections** you index with integers — most languages even treat a string as an array of characters.

## How an array actually lives in memory

An array is a *contiguous* block. That single fact explains every one of its properties:

<div class="svg-wrap">
<svg viewBox="0 0 720 170" role="img" aria-label="Array memory layout">
  <text x="360" y="20" text-anchor="middle" fill="currentColor" font-weight="700">arr = [10, 20, 30, 40, 50]   base = 0x100</text>
  <g font-size="13">
    <rect x="120" y="45" width="96" height="46" rx="8" fill="rgba(255,161,22,.14)" stroke="#ffa116"/><text x="168" y="73" text-anchor="middle">10</text>
    <rect x="216" y="45" width="96" height="46" rx="8" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="264" y="73" text-anchor="middle">20</text>
    <rect x="312" y="45" width="96" height="46" rx="8" fill="rgba(45,181,93,.14)" stroke="#2db55d"/><text x="360" y="73" text-anchor="middle">30</text>
    <rect x="408" y="45" width="96" height="46" rx="8" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="456" y="73" text-anchor="middle">40</text>
    <rect x="504" y="45" width="96" height="46" rx="8" fill="rgba(239,71,67,.12)" stroke="#ef4743"/><text x="552" y="73" text-anchor="middle">50</text>
    <g font-size="11" opacity=".65" fill="currentColor"><text x="168" y="108" text-anchor="middle">idx 0</text><text x="264" y="108" text-anchor="middle">idx 1</text><text x="360" y="108" text-anchor="middle">idx 2</text><text x="456" y="108" text-anchor="middle">idx 3</text><text x="552" y="108" text-anchor="middle">idx 4</text></g>
    <g font-family="ui-monospace, monospace" font-size="10.5" opacity=".5" fill="currentColor"><text x="168" y="126" text-anchor="middle">0x100</text><text x="264" y="126" text-anchor="middle">0x104</text><text x="360" y="126" text-anchor="middle">0x108</text><text x="456" y="126" text-anchor="middle">0x10C</text><text x="552" y="126" text-anchor="middle">0x110</text></g>
    <path d="M60 68 H112" stroke="#ffa116" stroke-width="1.8" marker-end="url(#arw)"/>
    <defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffa116"/></marker></defs>
    <text x="58" y="52" text-anchor="end" font-size="12" fill="currentColor" opacity=".7">address = base + idx × size</text>
  </g>
</svg>
</div>

Because addresses are computable, **reading \`arr[i]\` is O(1)**. But inserting into the middle means shifting everything after it — **O(n)**:

| Operation | Array | Notes |
|---|---|---|
| Read / write by index | O(1) | the superpower |
| Append (amortized, dynamic array) | O(1) | occasional resize |
| Insert / delete in middle | O(n) | shifting |
| Search unsorted | O(n) | unless sorted → binary search |

## Strings

- Strings are **immutable** in Java, Python and JavaScript. Every "modification" builds a new string.
- Building a string with repeated concatenation in a loop is a classic **O(n²)** trap. Collect parts in a list and join once at the end.
- In Python, \`list(s)\` gives you mutability; in Java use \`char[]\` or \`StringBuilder\`.

## The two techniques this chapter teaches

Almost every array/string problem in interviews reduces to one of these pictures:

**Two pointers** — two indices cooperating over the same array:

<div class="svg-wrap">
<svg viewBox="0 0 720 120" role="img" aria-label="Two pointers converging">
  <g font-size="13"><rect x="80" y="35" width="70" height="40" rx="8" fill="rgba(255,161,22,.14)" stroke="#ffa116"/><text x="115" y="60" text-anchor="middle">1</text><rect x="150" y="35" width="70" height="40" rx="8" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/><text x="185" y="60" text-anchor="middle">2</text><rect x="290" y="35" width="70" height="40" rx="8" fill="rgba(139,92,246,.14)" stroke="#8b5cf6"/><text x="325" y="60" text-anchor="middle">…</text><rect x="430" y="35" width="70" height="40" rx="8" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/><text x="465" y="60" text-anchor="middle">7</text><rect x="500" y="35" width="70" height="40" rx="8" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="535" y="60" text-anchor="middle">9</text></g>
  <g font-weight="700" font-size="13"><text x="115" y="100" text-anchor="middle" fill="#ffa116">L</text><text x="535" y="100" text-anchor="middle" fill="#2db55d">R</text></g>
  <g stroke="#9d9d9d" stroke-width="1.6"><line x1="115" y1="86" x2="115" y2="88" /><line x1="240" y1="55" x2="286" y2="55" stroke-dasharray="4 4"/><line x1="360" y1="55" x2="426" y2="55" stroke-dasharray="4 4"/></g>
  <text x="360" y="24" text-anchor="middle" font-size="12" fill="currentColor" opacity=".6">move L right / R left based on a condition → O(n) instead of O(n²)</text>
</svg>
</div>

**Sliding window** — a growing/shrinking subarray that never re-scans:

<div class="svg-wrap">
<svg viewBox="0 0 720 130" role="img" aria-label="Sliding window">
  <g font-size="13"><rect x="90" y="40" width="56" height="38" rx="7" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="118" y="64" text-anchor="middle">a</text><rect x="146" y="40" width="56" height="38" rx="7" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="174" y="64" text-anchor="middle">b</text><rect x="202" y="40" width="56" height="38" rx="7" fill="rgba(45,181,93,.30)" stroke="#2db55d" stroke-width="2"/><text x="230" y="64" text-anchor="middle" font-weight="700">c</text><rect x="258" y="40" width="56" height="38" rx="7" fill="rgba(255,161,22,.15)" stroke="#ffa116" stroke-dasharray="5 3"/><text x="286" y="64" text-anchor="middle">b</text><rect x="314" y="40" width="56" height="38" rx="7" stroke="#6b7280" stroke-dasharray="3 3" fill="none"/><text x="342" y="64" text-anchor="middle" opacity=".5">a</text><rect x="370" y="40" width="56" height="38" rx="7" stroke="#6b7280" stroke-dasharray="3 3" fill="none"/><text x="398" y="64" text-anchor="middle" opacity=".5">c</text></g>
  <rect x="82" y="32" width="184" height="54" rx="10" fill="none" stroke="#2db55d" stroke-width="2"/>
  <text x="174" y="105" text-anchor="middle" font-size="12" fill="#2db55d" font-weight="700">window: grow right until invalid…</text>
  <text x="480" y="105" text-anchor="middle" font-size="12" fill="#ffa116" font-weight="700">…then shrink from the left</text>
</svg>
</div>

Master these two pictures and you can walk into most easy/medium array interviews cold.

### Practice
[Two Sum](#/problems/two-sum) · [Best Time to Buy and Sell Stock](#/problems/best-time-to-buy-and-sell-stock) · [Contains Duplicate](#/problems/contains-duplicate)
`,
  },
  '4503': {
    t: 'Prefix sum',
    c: `
**Prefix sums** precompute running totals so any range-sum query becomes subtraction.

## The idea

\`prefix[i] = nums[0] + nums[1] + … + nums[i-1]\` (with \`prefix[0] = 0\`, the empty prefix).

Then the sum of any window \`[l, r)\` is just:

$$\\text{sum}(l, r) = \\text{prefix}[r] - \\text{prefix}[l]$$

<div class="svg-wrap">
<svg viewBox="0 0 720 210" role="img" aria-label="Prefix sum construction and query">
  <text x="360" y="20" text-anchor="middle" fill="currentColor" font-weight="700">nums = [1, 2, 3, 4, 5]</text>
  <g font-size="13">
    <rect x="150" y="35" width="72" height="36" rx="8" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="186" y="58" text-anchor="middle">1</text>
    <rect x="222" y="35" width="72" height="36" rx="8" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="258" y="58" text-anchor="middle">2</text>
    <rect x="294" y="35" width="72" height="36" rx="8" fill="rgba(255,161,22,.2)" stroke="#ffa116"/><text x="330" y="58" text-anchor="middle" font-weight="700">3</text>
    <rect x="366" y="35" width="72" height="36" rx="8" fill="rgba(255,161,22,.2)" stroke="#ffa116"/><text x="402" y="58" text-anchor="middle" font-weight="700">4</text>
    <rect x="438" y="35" width="72" height="36" rx="8" fill="rgba(255,161,22,.2)" stroke="#ffa116"/><text x="474" y="58" text-anchor="middle" font-weight="700">5</text>
  </g>
  <text x="540" y="58" font-size="12.5" fill="currentColor" opacity=".75">← query sum(2..4)?</text>
  <text x="360" y="102" text-anchor="middle" font-size="12.5" fill="currentColor" opacity=".7">prefix = [0, 1, 3, 6, 10, 15]</text>
  <g font-size="13">
    <rect x="114" y="120" width="60" height="34" rx="7" fill="rgba(139,92,246,.14)" stroke="#8b5cf6"/><text x="144" y="142" text-anchor="middle">0</text>
    <rect x="174" y="120" width="60" height="34" rx="7" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="204" y="142" text-anchor="middle" opacity=".6">1</text>
    <rect x="234" y="120" width="60" height="34" rx="7" fill="rgba(45,181,93,.18)" stroke="#2db55d" stroke-width="2"/><text x="264" y="142" text-anchor="middle" font-weight="700">3</text>
    <rect x="294" y="120" width="60" height="34" rx="7" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="324" y="142" text-anchor="middle" opacity=".6">6</text>
    <rect x="354" y="120" width="60" height="34" rx="7" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="384" y="142" text-anchor="middle" opacity=".6">10</text>
    <rect x="414" y="120" width="60" height="34" rx="7" fill="rgba(45,181,93,.18)" stroke="#2db55d" stroke-width="2"/><text x="444" y="142" text-anchor="middle" font-weight="700">15</text>
  </g>
  <g font-size="13.5" font-weight="700"><text x="264" y="176" text-anchor="middle" fill="#2db55d">P[2] = 3</text><text x="444" y="176" text-anchor="middle" fill="#2db55d">P[5] = 15</text><text x="356" y="196" text-anchor="middle" fill="#ffa116">answer = 15 − 3 = 12 ✓</text></g>
  <g stroke="#9d9d9d" stroke-width="1.5"><line x1="270" y1="156" x2="430" y2="156" stroke-dasharray="4 4"/></g>
</svg>
</div>

Build once in O(n); answer each range query in **O(1)**.

## Implementation

\`\`\`python
prefix = [0]
for x in nums:
    prefix.append(prefix[-1] + x)

# sum of nums[l..r] inclusive:
def range_sum(l, r):
    return prefix[r + 1] - prefix[l]
\`\`\`

The leading \`0\` removes all "index − 1" special-casing at the left edge — adopt this convention everywhere.

## Where it shows up

- **Range sum queries** — [303. Range Sum Query - Immutable](#/problems/range-sum-query-immutable)
- **Subarray sums equal to K** — pair prefix with a hash map of counts: [560. Subarray Sum Equals K](#/problems/subarray-sum-equals-k)
- **Product of array except self** — prefix × suffix products: [238. Product of Array Except Self](#/problems/product-of-array-except-self)
- **2D version** — prefix over rectangles answers any rectangle sum in O(1): [304. Range Sum Query 2D](#/problems/range-sum-query-2d-immutable)

## Common pitfalls

- Off-by-one: decide whether \`prefix[i]\` includes \`nums[i]\`. The \`prefix[0]=0\`, exclusive convention above avoids the bug entirely.
- Negative numbers break sliding-window solutions but **not** prefix sums + hash map — that's exactly why 560 uses the latter.

> **Pattern recognition:** "sum of a *range*" or "*count subarrays with property X*" ⇒ think prefix sums before writing any loop-nested-loop.
`,
  },
  '4504': {
    t: 'More common patterns',
    c: `
A rapid tour of the smaller-but-frequent array patterns. Each has a signature move you should recognize on sight.

## 1. Kadane's algorithm — maximum subarray

Keep the best subarray *ending here*; either extend the previous best or restart:

\`\`\`python
cur = best = nums[0]
for x in nums[1:]:
    cur = max(x, cur + x)   # extend, or start fresh at x
    best = max(best, cur)
\`\`\`

<div class="svg-wrap">
<svg viewBox="0 0 720 140" role="img" aria-label="Kadane decision at each element">
  <g font-size="13">
    <rect x="60"  y="40" width="80" height="40" rx="8" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="100" y="65" text-anchor="middle">−2</text>
    <rect x="140" y="40" width="80" height="40" rx="8" fill="rgba(239,71,67,.14)" stroke="#ef4743"/><text x="180" y="65" text-anchor="middle">1</text>
    <rect x="220" y="40" width="80" height="40" rx="8" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="260" y="65" text-anchor="middle">−3</text>
    <rect x="300" y="40" width="80" height="40" rx="8" fill="rgba(255,161,22,.22)" stroke="#ffa116" stroke-width="2"/><text x="340" y="65" text-anchor="middle" font-weight="700">4</text>
    <rect x="380" y="40" width="80" height="40" rx="8" fill="rgba(255,161,22,.22)" stroke="#ffa116" stroke-width="2"/><text x="420" y="65" text-anchor="middle" font-weight="700">−1</text>
    <rect x="460" y="40" width="80" height="40" rx="8" fill="rgba(255,161,22,.22)" stroke="#ffa116" stroke-width="2"/><text x="500" y="65" text-anchor="middle" font-weight="700">2</text>
    <rect x="540" y="40" width="80" height="40" rx="8" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="580" y="65" text-anchor="middle">1</text>
  </g>
  <text x="340" y="110" text-anchor="middle" font-size="12.5" fill="#ffa116" font-weight="700">restart when cur + x &lt; x  →  orange = current best subarray [4,−1,2]</text>
</svg>
</div>

Practice: [53. Maximum Subarray](#/problems/maximum-subarray)

## 2. Sorting as preprocessing

Many problems become trivial after sorting: deduplication, "closest pair of values", meeting-room style merging, two-pointer pairing. Sorting costs O(n log n) but converts structure-less data into structure. Ask yourself: *"if the input were sorted, would the problem be easy?"*

## 3. Intervals — sort by start, then sweep

See the full treatment in the [Intervals bonus lesson](#/course/4650). Signature: sort by start point, keep track of the current merged interval's end.

## 4. Rotate / reverse tricks

Reversing segments in-place solves rotation without extra memory:
\`rotate(nums, k)\`: reverse whole array → reverse first k → reverse rest.

\`\`\`java
// rotate right by k, O(1) space
reverse(nums, 0, n - 1);
reverse(nums, 0, k - 1);
reverse(nums, k, n - 1);
\`\`\`

Practice: [189. Rotate Array](#/problems/rotate-array)

## 5. Fast write-pointer partitioning

One pointer reads (\`i\`), one writes (\`w\`). Keep the prefix \`[0, w)\` holding only what we want:

\`\`\`python
w = 0
for x in nums:          # e.g. keep non-zeros
    if x != 0:
        nums[w] = x
        w += 1
\`\`\`

This single idea solves [26. Remove Duplicates](#/problems/remove-duplicates-from-sorted-array), [27. Remove Element](#/problems/remove-element), [283. Move Zeroes](#/problems/move-zeroes).

## Choosing between them

| Clue in the problem | Pattern |
|---|---|
| "max sum of contiguous…" | Kadane |
| "range / subarray sum" | Prefix sums |
| Sorted input, find pair/triplet | Two pointers |
| "subwindow under constraint" | Sliding window |
| "remove/reorder in place" | Read/write pointers |
| "would be trivial if sorted" | Sort first |
`,
  },
  '4505': {
    t: 'Arrays and strings quiz',
    c: `
Test yourself — try to answer before opening the solution. Aim for 5/5 before moving to Hashing.

**Q1.** You must answer 10⁵ range-sum queries on a static array of length 10⁵. Best complexity?

- A. O(n) per query — rescan the range each time
- B. O(n log n) total with a segment tree only
- C. O(n) build + O(1) per query using prefix sums
- D. O(n²) preprocessing

<details><summary>Solution</summary><p><strong>C.</strong> Static array + many range queries is the textbook prefix-sum setup: build once O(n), each query O(1).</p></details>

**Q2.** What is the amortized cost of appending to a dynamic array (e.g. Python list)?

- A. Always O(1), never anything else happens
- B. O(1) amortized — occasional doubling costs O(n) but averages out
- C. O(log n)
- D. O(n) always

<details><summary>Solution</summary><p><strong>B.</strong> Doubling capacity makes the total cost of n appends O(n), so the amortized per-append cost is O(1).</p></details>

**Q3.** In Java/Python, repeatedly doing \`s = s + ch\` inside an n-iteration loop costs:

- A. O(n) total
- B. O(n log n)
- C. O(n²) — each concatenation copies the whole string
- D. O(1) per operation

<details><summary>Solution</summary><p><strong>C.</strong> Strings are immutable; each concat allocates and copies. Accumulate in a list / <code>StringBuilder</code> and join once.</p></details>

**Q4.** Two pointers L and R converge on a sorted array checking \`arr[L] + arr[R]\`. Total work?

- A. O(log n) — B. O(n) — C. O(n log n) — D. O(n²)

<details><summary>Solution</summary><p><strong>B.</strong> Each step moves one pointer inward permanently; there are at most n steps.</p></details>

**Q5.** Which clue most strongly suggests a sliding window?

- A. "Input is sorted"
- B. "Longest/shortest contiguous subarray satisfying a constraint"
- C. "Return two indices"
- D. "Count distinct elements anywhere"

<details><summary>Solution</summary><p><strong>B.</strong> Contiguous + monotonic constraint = window. Note: windows fail when negatives invalidate the shrink logic — switch to prefix sums + hashmap then.</p></details>
`,
  },
  '4705': {
    t: 'Bonus problems, arrays and strings',
    c: `
Extra reps for this chapter, roughly in increasing difficulty. Solve without hints first; the pattern tags are spoilers.

| Problem | Difficulty | trains |
|---|---|---|
| [88. Merge Sorted Array](#/problems/merge-sorted-array) | Easy | backwards two pointers |
| [121. Best Time to Buy and Sell Stock](#/problems/best-time-to-buy-and-sell-stock) | Easy | running min (1D DP-lite) |
| [169. Majority Element](#/problems/majority-element) | Easy | Boyer–Moore vote |
| [283. Move Zeroes](#/problems/move-zeroes) | Easy | read/write pointers |
| [13. Roman to Integer](#/problems/roman-to-integer) | Easy | lookahead parsing |
| [58. Length of Last Word](#/problems/length-of-last-word) | Easy | string trimming |
| [167. Two Sum II](#/problems/two-sum-ii-input-array-is-sorted) | Medium | converging pointers |
| [209. Minimum Size Subarray Sum](#/problems/minimum-size-subarray-sum) | Medium | variable window (positives!) |
| [15. 3Sum](#/problems/3sum) | Medium | sort + fixed anchor + two pointers |
| [11. Container With Most Water](#/problems/container-with-most-water) | Medium | pointer movement proof |
| [151. Reverse Words in a String](#/problems/reverse-words-in-a-string) | Medium | tokenizing cleanly |
| [42. Trapping Rain Water](#/problems/trapping-rain-water) | Hard | prefix-max / two pointers |
| [41. First Missing Positive](#/problems/first-missing-positive) | Hard | index-as-hash |

**Challenge goals:** finish 3Sum in under 20 minutes with zero bugs on duplicates; explain out loud why Container With Most Water never skips the optimal answer (the exchange argument).
`,
  },
};
