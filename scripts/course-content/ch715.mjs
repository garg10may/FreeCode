// Chapter 715 - Introduction (locked items)
export default {
  '4655': {
    t: 'Introduction to recursion',
    c: `
Recursion is a method of solving problems where a function calls itself on a **smaller version of the same problem** until it reaches a case simple enough to answer directly.

Every recursive function needs exactly two things:

1. **Base case** — the smallest input you can answer immediately (stops the recursion).
2. **Recursive case** — reduce the problem, call yourself, and combine the result.

## The mental model: a chain of promises

When you call \`f(n)\`, imagine \`f(n)\` saying: *"I'll wait for \`f(n-1)\` to give me an answer, then I finish my job."* Each waiting call is a frame on the **call stack**.

<div class="svg-wrap">
<svg viewBox="0 0 720 240" role="img" aria-label="Call stack growing and unwinding">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffa116"/></marker>
  </defs>
  <text x="360" y="18" text-anchor="middle" fill="currentColor" font-weight="700">factorial(4) — going down, coming back up</text>
  <g font-family="ui-monospace, Consolas, monospace" font-size="13">
    <rect x="40"  y="35" width="150" height="34" rx="8" fill="rgba(255,161,22,.14)" stroke="#ffa116"/><text x="115" y="57" text-anchor="middle">fact(4)</text>
    <rect x="220" y="80" width="150" height="34" rx="8" fill="rgba(76,159,254,.16)" stroke="#4c9ffe"/><text x="295" y="102" text-anchor="middle">fact(3)</text>
    <rect x="400" y="125" width="150" height="34" rx="8" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="475" y="147" text-anchor="middle">fact(2)</text>
    <rect x="560" y="170" width="120" height="34" rx="8" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="620" y="192" text-anchor="middle" font-weight="700">fact(1) = 1</text>
  </g>
  <g stroke="#9d9d9d" stroke-width="1.6">
    <line x1="180" y1="55" x2="222" y2="88" marker-end="url(#ar)"/>
    <line x1="360" y1="100" x2="402" y2="133" marker-end="url(#ar)"/>
    <line x1="540" y1="145" x2="562" y2="178" marker-end="url(#ar)"/>
  </g>
  <g stroke="#2db55d" stroke-width="1.8" fill="none">
    <path d="M600 205 C 480 235, 300 210, 250 118" stroke-dasharray="5 4" marker-end="url(#ar)"/>
    <path d="M290 112 C 380 60, 430 70, 480 128" stroke-dasharray="5 4" opacity=".001"/>
  </g>
  <g font-size="12" fill="currentColor">
    <text x="200" y="45" opacity=".65">calls ↓</text>
    <text x="330" y="228" fill="#2db55d" font-weight="700">returns ↑  1→2→6→24</text>
  </g>
</svg>
</div>

The *down* phase just pushes frames onto the stack. All real work often happens during the *unwind* (the green path).

## A template you can reuse

\`\`\`python
def solve(problem):
    if is_small_enough(problem):      # base case
        return answer_directly(problem)

    smaller = reduce(problem)         # make progress!
    sub = solve(smaller)              # trust the recursion
    return combine(problem, sub)
\`\`\`

> **Golden rule:** every recursive call must move strictly toward the base case. If the input does not shrink (or the search space does not shrink), the recursion never terminates.

## Recursion vs iteration

| | Recursion | Iteration |
|---|---|---|
| State kept in | Call stack (automatic) | Variables you manage |
| Best for | Trees, branching choices, "try all options" | Simple loops, counting |
| Risk | Stack overflow on deep recursion | Accidental infinite loop |

Any recursion can be converted to iteration (sometimes with an explicit stack), and vice versa. In interviews, use whichever expresses the idea more clearly — for trees and backtracking that is almost always recursion.

## Where you will see it constantly

- Tree traversals (every DFS in this course)
- Fast/slow list splitting, reversing sublists
- Backtracking (Chapter: Backtracking)
- Divide and conquer (merge sort, binary search)
- Dynamic programming starts as "recursion + cache"

### Practice
Start with these to build the muscle:

- [509. Fibonacci Number](#/problems/fibonacci-number)
- [206. Reverse Linked List](#/problems/reverse-linked-list)
- [104. Maximum Depth of Binary Tree](#/problems/maximum-depth-of-binary-tree)
`,
  },
  '4656': {
    t: 'Notes before starting',
    c: `
How you practice matters more than how many problems you solve. Read this before chapter one — it will save you dozens of hours.

## The 80/20 of interview prep

<div class="svg-wrap">
<svg viewBox="0 0 720 190" role="img" aria-label="Practice loop">
  <defs><marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffa116"/></marker></defs>
  <g font-size="13" fill="currentColor" font-weight="600">
    <rect x="20"  y="65" width="140" height="52" rx="10" fill="rgba(255,161,22,.13)" stroke="#ffa116"/><text x="90"  y="87" text-anchor="middle">Attempt 25 min</text><text x="90" y="105" text-anchor="middle" font-weight="400" font-size="11" opacity=".7">honestly, no hints</text>
    <rect x="215" y="65" width="140" height="52" rx="10" fill="rgba(239,71,67,.12)"  stroke="#ef4743"/><text x="285" y="87" text-anchor="middle">Stuck? Read</text><text x="285" y="105" text-anchor="middle" font-weight="400" font-size="11" opacity=".7">only the hint</text>
    <rect x="410" y="65" width="140" height="52" rx="10" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="480" y="87" text-anchor="middle">Understand solution</text><text x="480" y="105" text-anchor="middle" font-weight="400" font-size="11" opacity=".7">why, not what</text>
    <rect x="595" y="65" width="110" height="52" rx="10" fill="rgba(45,181,93,.14)"  stroke="#2db55d"/><text x="650" y="87" text-anchor="middle">Re-solve</text><text x="650" y="105" text-anchor="middle" font-weight="400" font-size="11" opacity=".7">from blank file</text>
  </g>
  <g stroke="#9d9d9d" stroke-width="1.8" fill="none">
    <line x1="160" y1="91" x2="211" y2="91" marker-end="url(#a2)"/>
    <line x1="355" y1="91" x2="406" y2="91" marker-end="url(#a2)"/>
    <line x1="550" y1="91" x2="591" y2="91" marker-end="url(#a2)"/>
    <path d="M650 121 C 640 165, 130 165, 85 121" stroke="#2db55d" stroke-dasharray="6 5" marker-end="url(#a2)"/>
  </g>
  <text x="360" y="182" text-anchor="middle" font-size="12" fill="currentColor" opacity=".6">revisit after 3 days — spaced repetition is the cheat code</text>
</svg>
</div>

## Rules that actually move the needle

1. **Struggle first, always.** 25 minutes of genuine effort before looking at anything. Your brain does the pattern-building during the struggle, not during the reading.
2. **One topic at a time.** This course is ordered deliberately — finish a chapter's exercises before moving on.
3. **Say the brute force out loud**, then improve it. Interviewers explicitly grade this communication.
4. **After reading any solution**, close it and implement from scratch. Reading ≠ ability.
5. **Track a mistake journal.** For every failed problem write one line: *the pattern or edge case I missed*. Review weekly.

## What "solved" means here

A problem counts as solved only when you can:

- restate it in your own words,
- state the brute force and its complexity,
- explain why your approach beats it,
- code it without reference,
- and name the pattern (sliding window? hashing? DP?) — because interviews are pattern-matching under pressure.

## Using this app

Mark items complete in the Course tab, tick problems solved in the lists, and keep notes on the problem page — everything is stored locally. Aim for **1–2 focused hours a day**: two new problems plus revisiting yesterday's misses beats five unfocused hours every weekend.

Ready? Start with [Introduction to big O](#/course/4654).
`,
  },
};
