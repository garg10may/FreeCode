// Chapter 709 - Greedy (locked articles)
export default {
  '4529': {
    t: 'Greedy algorithms',
    c: `
A greedy algorithm builds the solution one step at a time, **always taking what looks best right now**, and never looks back. It's fast — usually O(n log n) for a sort, then O(n) — but only *correct* when local choices provably don't ruin the future.

## The burden of proof

Greedy = easy to code, easy to get wrong. Before trusting one, produce an argument. The workhorse is the **exchange argument**:

> *"Suppose some optimal solution disagrees with my first greedy choice. Swap its choice for mine — nothing gets worse. Therefore some optimal solution agrees with greed. Repeat for every step."*

<div class="svg-wrap">
<svg viewBox="0 0 720 190" role="img" aria-label="Exchange argument">
  <text x="360" y="22" text-anchor="middle" fill="currentColor" font-weight="700">OPT uses B where greed picks A → swap A in, still optimal</text>
  <g font-size="13">
    <rect x="80"  y="50" width="120" height="44" rx="9" fill="rgba(45,181,93,.2)" stroke="#2db55d" stroke-width="2"/><text x="140" y="77" text-anchor="middle" font-weight="700">greedy A</text>
    <rect x="220" y="50" width="120" height="44" rx="9" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><text x="280" y="77" text-anchor="middle">rest of OPT</text>
    <rect x="360" y="50" width="120" height="44" rx="9" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><text x="420" y="77" text-anchor="middle">…continues</text>
    <path d="M140 130 C 200 160, 340 165, 430 100" stroke="#ef4743" stroke-width="1.8" stroke-dasharray="6 4" fill="none"/>
    <text x="255" y="168" font-size="12.5" fill="#ef4743">if OPT chose B instead: replace B with A — feasibility & value unchanged or better</text>
  </g>
</svg>
</div>

If you can't sketch that argument (or find a counterexample!), the problem probably isn't greedy — it's DP.

## Greedy vs DP

| | Greedy | DP |
|---|---|---|
| Choices considered | one, irrevocable | all states |
| Proof needed | exchange argument | overlapping subproblems |
| Speed | usually O(n log n) | O(n·states) |
| Typical failure | coins {1,3,4}, target 6 → greedy takes 4+1+1=3 coins; true answer is 3+3=**2** | handles it |

That coin counterexample is worth memorizing — interviewers love asking "when does your greedy break?"

## The classic greedy shapes

- Sort by some key, sweep once (intervals, capacity loading)
- Track running best/worst while scanning (jump game reach)
- Take from sorted ends / heaps repeatedly (rearrangements)
`,
  },
  '4647': {
    t: 'Example greedy problems',
    c: `
Three worked problems showing how a greedy is discovered, justified, and coded.

## 1. Interval scheduling — maximize non-overlapping meetings

Sort by **end time**; keep taking every meeting that starts at/after the last kept end:

\`\`\`python
intervals.sort(key=lambda iv: iv[1])
kept = end = 0
for s, e in intervals:
    if s >= end:
        kept += 1
        end = e
return kept
\`\`\`

*Why earliest end?* Finishing soonest leaves maximal room for everyone else — the exchange argument goes through cleanly. ([435. Non-overlapping Intervals](#/problems/non-overlapping-intervals) asks the complement: removals.)

<div class="svg-wrap">
<svg viewBox="0 0 720 150" role="img" aria-label="Interval scheduling by earliest finish">
  <g font-size="12">
    <rect x="60"  y="30" width="150" height="24" rx="7" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="135" y="46" text-anchor="middle">A [0,5)</text>
    <rect x="60"  y="62" width="90"  height="24" rx="7" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="105" y="78" text-anchor="middle" font-weight="700">B [0,3)✓</text>
    <rect x="170" y="62" width="120" height="24" rx="7" fill="rgba(45,181,93,.22)" stroke="#2db55d" stroke-width="2"/><text x="230" y="78" text-anchor="middle" font-weight="700">C [4,8)✓</text>
    <rect x="310" y="62" width="110" height="24" rx="7" stroke="#6b7280" fill="none" stroke-dasharray="4 3"/><text x="365" y="78" text-anchor="middle" opacity=".55">D overlaps C</text>
    <line x1="40" y1="112" x2="660" y2="112" stroke="currentColor" opacity=".3"/>
  </g>
  <text x="360" y="136" text-anchor="middle" font-size="12.5" fill="#2db55d" font-weight="700">earliest-finish order lets B,C fit where A blocks two slots</text>
</svg>
</div>

## 2. Gas station circuit

If total gas ≥ total cost, exactly one start works. Sweep accumulating tank; whenever it dips below zero, the answer must start **after** position i — reset. One pass, no simulation of each start: [134. Gas Station](#/problems/gas-station).

## 3. Jump game reach

Track furthest reachable index; if \`i\` ever passes it, stuck:

\`\`\`python
reach = 0
for i, jump in enumerate(nums):
    if i > reach:
        return False
    reach = max(reach, i + jump)
\`\`\`
[55. Jump Game](#/problems/jump-game); the "minimum jumps" variant adds a second pointer for current window end ([45](#/problems/jump-game-ii)) — BFS-in-disguise.

## Spotting greedy in the wild

Signals: "maximum number of … you can pick", scheduling/loading/capacity flavor, and a sort that makes everything after it obvious. Then demand of yourself the exchange sentence before coding.
`,
  },
  '4530': {
    t: 'Greedy quiz',
    c: `
Five checks on greedy instincts.

**Q1.** Coin system {1,3,4}, target 6. Greedy by largest coin gives?

- A. 2 coins (correct) — B. 3 coins (suboptimal!) — C. fails entirely — D. infinite loop

<details><summary>Solution</summary><p><strong>B.</strong> 4+1+1 = three coins vs 3+3 = two. Canonical systems (US coins) are safe; arbitrary ones need DP.</p></details>

**Q2.** Interval scheduling sorts by…

- A. Start time — B. Length — C. End time — D. Any works

<details><summary>Solution</summary><p><strong>C.</strong> Earliest finish leaves maximum room; sorting by start or length admits counterexamples.</p></details>

**Q3.** Exchange argument establishes…

- A. Runtime bounds — B. That swapping any optimal solution toward greedy choices preserves optimality ⇒ greedy matches OPT — C. Memory usage — D. Termination

<details><summary>Solution</summary><p><strong>B.</strong> It's THE standard proof technique for greedy correctness.</p></details>

**Q4.** Gas station: after proving total gas ≥ total cost, the single-pass reset strategy is valid because…

- A. Tanks are small — B. Any failure at i means no start ≤ i can pass i — C. Stations are sorted — D. It just feels right

<details><summary>Solution</summary><p><strong>B.</strong> Each failed prefix eliminates all its candidate starts simultaneously.</p></details>

**Q5.** Which clue suggests DP instead of greedy?

- A. "Maximum meetings in one room" — B. "Minimum coins with arbitrary denominations" — C. "Merge intervals" — D. "Assign cookies"

<details><summary>Solution</summary><p><strong>B.</strong> Arbitrary denominations break the exchange argument — overlapping subproblems appear.</p></details>
`,
  },
  '4711': {
    t: 'Bonus problems, greedy',
    c: `
Extra reps — for each, state your exchange argument out loud before coding.

| Problem | Difficulty | trains |
|---|---|---|
| [455. Assign Cookies](#/problems/assign-cookies) | Easy | two-sorted-pointers matching |
| [860. Lemonade Change](#/problems/lemonade-change) | Easy | invariant maintenance |
| [121. Best Time to Buy and Sell Stock](#/problems/best-time-to-buy-and-sell-stock) | Easy | running best |
| [561. Array Partition](#/problems/array-partition) | Easy | pairing after sort |
| [1323. Maximum 69 Number](#/problems/maximum-69-number) | Easy | most significant first |
| [1710. Maximum Units on a Truck](#/problems/maximum-units-on-a-truck) | Easy | density sort |
| [435. Non-overlapping Intervals](#/problems/non-overlapping-intervals) | Medium | earliest-end removals |
| [452. Minimum Arrows to Burst Balloons](#/problems/minimum-number-of-arrows-to-burst-balloons) | Medium | overlap shrinking |
| [55. Jump Game](#/problems/jump-game) | Medium | reach tracking |
| [134. Gas Station](#/problems/gas-station) | Medium | prefix reset |
| [621. Task Scheduler](#/problems/task-scheduler) | Medium | frame counting |
| [881. Boats to Save People](#/problems/boats-to-save-people) | Medium | two-pointer pairing |
| [767. Reorganize String](#/problems/reorganize-string) | Medium | max-first placement |
| [45. Jump Game II](#/problems/jump-game-ii) | Medium | window BFS-greedy |

**Challenge goals:** for 435 and 452, write the one-sentence exchange proof; for 621, derive the formula \`max(tasks, frames)\` yourself.
`,
  },
};
