// Chapter 708 - Heaps (locked articles)
export default {
  '4638': {
    t: 'Heaps',
    c: `
A **binary min-heap** keeps the smallest element instantly accessible at the top, no matter how big the collection gets. (Max-heap = same with reversed comparisons.)

## Two invariants

1. **Shape:** a complete binary tree — filled level by level, left to right. This lets an array store it: children of \`i\` live at \`2i+1\`, \`2i+2\`; parent at \`(i-1)//2\`. No pointers needed!
2. **Order:** every parent ≤ its children. Note: *not* fully sorted — only the root is guaranteed minimum.

<div class="svg-wrap">
<svg viewBox="0 0 720 240" role="img" aria-label="Heap tree and array layout">
  <g stroke="#9d9d9d" stroke-width="1.5"><line x1="180" y1="62" x2="100" y2="118"/><line x1="180" y1="62" x2="260" y2="118"/><line x1="100" y1="138" x2="55" y2="190"/><line x1="100" y1="138" x2="145" y2="190"/><line x1="260" y1="138" x2="215" y2="190"/><line x1="260" y1="138" x2="305" y2="190"/></g>
  <g font-size="13">
    <circle cx="180" cy="50" r="24" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2.2"/><text x="180" y="55" text-anchor="middle" font-weight="700">3</text>
    <circle cx="100" cy="128" r="23" fill="rgba(76,159,254,.15)" stroke="#4c9ffe"/><text x="100" y="133" text-anchor="middle">9</text>
    <circle cx="260" cy="128" r="23" fill="rgba(255,161,22,.18)" stroke="#ffa116"/><text x="260" y="133" text-anchor="middle">4</text>
    <circle cx="55"  cy="200" r="20" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="55" y="205" text-anchor="middle">17</text>
    <circle cx="145" cy="200" r="20" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="145" y="205" text-anchor="middle">12</text>
    <circle cx="215" cy="200" r="20" fill="rgba(239,71,67,.14)" stroke="#ef4743"/><text x="215" y="205" text-anchor="middle">6</text>
    <circle cx="305" cy="200" r="20" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="305" y="205" text-anchor="middle">10</text>
  </g>
  <g font-family="ui-monospace, monospace" font-size="12.5">
    <text x="400" y="60" fill="currentColor" opacity=".75">array form:</text>
    <rect x="400" y="72" width="46" height="34" rx="7" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="423" y="94" text-anchor="middle" font-weight="700">3</text><text x="423" y="122" text-anchor="middle" opacity=".6">0</text>
    <rect x="446" y="72" width="46" height="34" rx="7" fill="rgba(76,159,254,.15)" stroke="#4c9ffe"/><text x="469" y="94" text-anchor="middle">9</text><text x="469" y="122" text-anchor="middle" opacity=".6">1</text>
    <rect x="492" y="72" width="46" height="34" rx="7" fill="rgba(255,161,22,.18)" stroke="#ffa116"/><text x="515" y="94" text-anchor="middle">4</text><text x="515" y="122" text-anchor="middle" opacity=".6">2</text>
    <rect x="538" y="72" width="46" height="34" rx="7" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="561" y="94" text-anchor="middle" opacity=".6">17</text><text x="561" y="122" text-anchor="middle" opacity=".6">3</text>
    <rect x="584" y="72" width="46" height="34" rx="7" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="607" y="94" text-anchor="middle" opacity=".6">12</text><text x="607" y="122" text-anchor="middle" opacity=".6">4</text>
    <rect x="630" y="72" width="46" height="34" rx="7" fill="rgba(239,71,67,.14)" stroke="#ef4743"/><text x="653" y="94" text-anchor="middle">6</text><text x="653" y="122" text-anchor="middle" opacity=".6">5</text>
    <text x="400" y="155" fill="currentColor" opacity=".75">children of idx i → 2i+1, 2i+2</text>
    <text x="400" y="178" fill="currentColor" opacity=".75">parent of idx i → (i−1) // 2</text>
    <text x="400" y="205" font-size="12" fill="#ef4743">note: 6 sits below 9's side but above nothing wrong — only parent ≤ child holds</text>
  </g>
</svg>
</div>

## The two repairs

- **Sift-up** (after appending at the end): swap with parent while smaller — O(log n). Used by insert.
- **Sift-down** (after replacing the root with the last element): swap with the *smaller* child while larger — O(log n). Used by pop-min.

\`\`\`python
import heapq                       # min-heap on a plain list
h = []
heapq.heappush(h, 4)
smallest = heapq.heappop(h)
\`\`\`

| Operation | Cost |
|---|---|
| peek min | O(1) |
| push / pop | O(log n) |
| heapify existing array | **O(n)** (better than n pushes!) |
| arbitrary search | O(n) — heaps are not for searching |

## Max-heap trick

Python has only a min-heap; negate values on push and negate again on pop.

## When to reach for a heap

The tell: you keep needing **only the current best** among a changing collection — not full sorting. Scheduling by deadline, merging many sorted streams, streaming top-k, Dijkstra's frontier.
`,
  },
  '4649': {
    t: 'Heap examples',
    c: `
Two canonical heap choreographies worth tracing until automatic.

## Example 1 — merging k sorted lists

Keep one heap holding each list's current head. Pop the global minimum, advance that one list, push its next:

<div class="svg-wrap">
<svg viewBox="0 0 720 210" role="img" aria-label="K-way merge with heap">
  <defs><marker id="he" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffa116"/></marker></defs>
  <g font-family="ui-monospace, monospace" font-size="12.5">
    <text x="40" y="52" fill="currentColor" opacity=".7">L1:</text><rect x="80" y="36" width="40" height="26" rx="6" fill="rgba(45,181,93,.2)" stroke="#2db55d" stroke-width="2"/><text x="100" y="54" text-anchor="middle">1</text><rect x="120" y="36" width="40" height="26" rx="6" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="140" y="54" text-anchor="middle" opacity=".55">4</text><rect x="160" y="36" width="40" height="26" rx="6" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="180" y="54" text-anchor="middle" opacity=".55">7</text>
    <text x="40" y="92" fill="currentColor" opacity=".7">L2:</text><rect x="80" y="76" width="40" height="26" rx="6" fill="rgba(76,159,254,.16)" stroke="#4c9ffe"/><text x="100" y="94" text-anchor="middle">2</text><rect x="120" y="76" width="40" height="26" rx="6" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="140" y="94" text-anchor="middle" opacity=".55">6</text>
    <text x="40" y="132" fill="currentColor" opacity=".7">L3:</text><rect x="80" y="116" width="40" height="26" rx="6" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="100" y="134" text-anchor="middle">5</text>
  </g>
  <path d="M124 49 C 220 90, 300 105, 356 108" stroke="#ffa116" stroke-width="1.8" fill="none" marker-end="url(#he)"/>
  <path d="M124 89 C 220 100, 300 107, 356 110" stroke="#ffa116" stroke-width="1.8" fill="none" marker-end="url(#he)"/>
  <path d="M124 129 C 220 112, 300 111, 356 112" stroke="#ffa116" stroke-width="1.8" fill="none" marker-end="url(#he)"/>
  <g>
    <rect x="360" y="88" width="150" height="42" rx="9" fill="rgba(255,161,22,.15)" stroke="#ffa116"/><text x="435" y="106" text-anchor="middle" font-size="12.5" font-weight="700">heap = {1, 2, 5}</text><text x="435" y="123" text-anchor="middle" font-size="11.5" opacity=".75">pop min → output</text>
  </g>
  <text x="600" y="115" font-size="13" font-family="ui-monospace, monospace" fill="#2db55d" font-weight="700">out: 1,2,…</text>
  <text x="360" y="170" text-anchor="middle" font-size="12.5" fill="currentColor" opacity=".7">each of N elements costs ≤ log k ⇒ O(N log k), beats concatenating + sorting (O(N log N))</text>
</svg>
</div>

[23. Merge k Sorted Lists](#/problems/merge-k-sorted-lists) — the interview favorite. Push tuples \`(val, node)\` so ties break without comparing nodes.

## Example 2 — running median

Two balanced halves: a **max-heap** `lo` (smaller half) and a **min-heap** `hi` (larger half).

- Insert: add to one half, then rebalance sizes (\`len(lo)\` equals \`len(hi)\` or +1)
- Median: tops of both heaps (average if even)

Every operation stays **O(log n)** and the median is always O(1) away — [295. Find Median from Data Stream](#/problems/find-median-from-data-stream). Invariant to state out loud: *"every element of lo ≤ every element of hi."*

## Also heap-powered

Task scheduler with cooldowns ([621](#/problems/task-scheduler)), seat allocation ([1845](#/problems/seat-reservation-manager)), event simulation ([1353](#/problems/maximum-number-of-events-that-can-be-attended)) — anywhere "process next by priority" appears.
`,
  },
  '4641': {
    t: 'Top k',
    c: `
"Return the k largest/smallest/frequent…" — the single most common heap interview shape.

## Three strategies compared (n items, k wanted)

| Approach | Time | Space | Verdict |
|---|---|---|---|
| Sort everything | O(n log n) | O(1)–O(n) | fine when k ≈ n |
| Max-heap all, pop k times | O(n + k log n) | O(n) | good, slightly heavy |
| **Min-heap of size k** | **O(n log k)** | **O(k)** | best for small k, streams |

## The counterintuitive winner

For *largest* k elements keep a **min**-heap of size k: anything smaller than the current min can never make the cut, so evict the root whenever size exceeds k.

<div class="svg-wrap">
<svg viewBox="0 0 720 175" role="img" aria-label="Min-heap of size k keeps the largest k">
  <defs><marker id="tk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ef4743"/></marker></defs>
  <text x="360" y="22" text-anchor="middle" fill="currentColor" font-weight="700">keep top-3 of stream … 9, 4, 7, 1, 8 …</text>
  <g font-size="13" font-family="ui-monospace, monospace">
    <text x="70" y="70">after 9,4,7 →</text>
    <g><circle cx="230" cy="62" r="19" fill="rgba(45,181,93,.2)" stroke="#2db55d"/><text x="230" y="67" text-anchor="middle">4</text><circle cx="185" cy="112" r="17" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="185" y="117" text-anchor="middle">9</text><circle cx="278" cy="112" r="17" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="278" y="117" text-anchor="middle">7</text></g>
    <text x="340" y="92" fill="#ffa116" font-weight="700">see 1 → 1 &lt; min(4): discard</text>
    <text x="70" y="152">see 8 → 8 &gt; min(4):</text>
    <text x="330" y="152" fill="#ef4743" font-weight="700">pop 4, push 8 → {7,8,9}</text>
  </g>
  <path d="M300 148 L 320 148" stroke="#ef4743" stroke-width="1.8" marker-end="url(#tk)"/>
</svg>
</div>

\`\`\`python
import heapq
def top_k(nums, k):
    h = []
    for x in nums:
        if len(h) < k:
            heapq.heappush(h, x)
        elif x > h[0]:
            heapq.heapreplace(h, x)   # pop+push in one sift
    return sorted(h, reverse=True)
\`\`\`

For frequencies: count first, then heap on \`(count, value)\` pairs — [347. Top K Frequent Elements](#/problems/top-k-frequent-elements), [692. Top K Frequent Words](#/problems/top-k-frequent-words) (mind tie-breaking order!), [973. K Closest Points to Origin](#/problems/k-closest-points-to-origin), [215. Kth Largest Element in an Array](#/problems/kth-largest-element-in-an-array).

## Interview sound bites

- *"Why min-heap for largest k?"* — because we evict from the weak end; the heap holds the current champions.
- *"Streaming?"* — size-k heap never grows past k: perfect for data you can't hold in memory.
- *"Alternative?"* — quickselect averages O(n) if returning unordered is acceptable, worst case O(n²).
`,
  },
  '4847': {
    t: 'Heap quiz',
    c: `
Five questions before Greedy.

**Q1.** Where is the maximum of a min-heap stored?

- A. Root — B. Some leaf — C. Always last array slot — D. Rightmost leaf only

<details><summary>Solution</summary><p><strong>B.</strong> A max must be a leaf (it can't be less than any child); which leaf depends on history.</p></details>

**Q2.** Heapify (build-heap) of n elements costs…

- A. O(n log n) — B. O(n) — C. O(n²) — D. O(log n)

<details><summary>Solution</summary><p><strong>B.</strong> Bottom-up sifting sums a geometric series; most nodes sift barely at all.</p></details>

**Q3.** K largest of n with a size-k min-heap costs…

- A. O(n) — B. O(n log k) — C. O(k log n) — D. O(n log n)

<details><summary>Solution</summary><p><strong>B.</strong> Each of n elements does ≤ one O(log k) heap operation.</p></details>

**Q4.** Running median uses two heaps so that…

- A. Sorting is avoided entirely — B. lo.max ≤ hi.min and sizes differ ≤ 1, making the middle always at the two roots — C. Memory halves — D. Updates become O(1)

<details><summary>Solution</summary><p><strong>B.</strong> Balanced partitions put the median(s) exactly at heap tops; updates cost O(log n).</p></details>

**Q5.** Which problem does NOT naturally need a heap?

- A. Merge k sorted lists — B. Sliding-window maximum — C. K closest points — D. Validate BST

<details><summary>Solution</summary><p><strong>D.</strong> BST validation needs inorder/bounds reasoning, not priorities. (Fun fact: sliding window max prefers a monotonic deque.)</p></details>
`,
  },
  '4848': {
    t: 'Bonus problems, heaps',
    c: `
Extra reps with priority queues.

| Problem | Difficulty | trains |
|---|---|---|
| [703. Kth Largest Element in a Stream](#/problems/kth-largest-element-in-a-stream) | Easy | bounded heap |
| [1046. Last Stone Weight](#/problems/last-stone-weight) | Easy | max-heap sim |
| [215. Kth Largest Element in an Array](#/problems/kth-largest-element-in-an-array) | Medium | top-k / quickselect |
| [973. K Closest Points to Origin](#/problems/k-closest-points-to-origin) | Medium | custom comparator |
| [347. Top K Frequent Elements](#/problems/top-k-frequent-elements) | Medium | count + heap |
| [621. Task Scheduler](#/problems/task-scheduler) | Medium | greedy + heap math |
| [1834. Single-Threaded CPU](#/problems/single-threaded-cpu) | Medium | event-driven PQ |
| [295. Find Median from Data Stream](#/problems/find-median-from-data-stream) | Hard | two heaps |
| [23. Merge k Sorted Lists](#/problems/merge-k-sorted-lists) | Hard | k-way merge |
| [502. IPO](#/problems/ipo) | Hard | two-PQ sweep |
| [871. Minimum Number of Refueling Stops](#/problems/minimum-number-of-refueling-stops) | Hard | reachable-fuel max-heap |

**Challenge goals:** solve 215 three ways (sort, size-k heap, quickselect) and be able to defend each complexity; then do 871 — it's "top-k thinking" applied greedily.
`,
  },
};
