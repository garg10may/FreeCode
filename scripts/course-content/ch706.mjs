// Chapter 706 - Stacks and queues (locked articles)
export default {
  '4514': {
    t: 'Stacks',
    c: `
A stack is **Last-In-First-Out (LIFO)** — like a pile of plates: push on top, pop from top, peek at top.

<div class="svg-wrap">
<svg viewBox="0 0 720 190" role="img" aria-label="Stack push and pop">
  <defs><marker id="ka" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2db55d"/></marker><marker id="kr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ef4743"/></marker></defs>
  <g font-size="13">
    <rect x="300" y="130" width="120" height="34" rx="7" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><text x="360" y="152" text-anchor="middle">A</text>
    <rect x="300" y="94"  width="120" height="34" rx="7" fill="rgba(139,92,246,.15)" stroke="#8b5cf6"/><text x="360" y="116" text-anchor="middle">B</text>
    <rect x="300" y="58"  width="120" height="34" rx="7" fill="rgba(255,161,22,.22)" stroke="#ffa116" stroke-width="2"/><text x="360" y="80" text-anchor="middle" font-weight="700">C ← top</text>
  </g>
  <path d="M560 40 C 520 55, 470 70, 428 74" stroke="#2db55d" stroke-width="1.9" fill="none" marker-end="url(#ka)"/>
  <text x="580" y="36" font-size="12.5" fill="#2db55d" font-weight="700">push(x)</text>
  <path d="M296 66 C 250 62, 210 58, 180 52" stroke="#ef4743" stroke-width="1.9" fill="none" marker-end="url(#kr)"/>
  <text x="150" y="46" text-anchor="end" font-size="12.5" fill="#ef4743" font-weight="700">pop() / peek()</text>
  <text x="360" y="182" text-anchor="middle" font-size="12" fill="currentColor" opacity=".6">all three operations touch only the top → O(1)</text>
</svg>
</div>

Every language ships one (Python list, Java \`Deque\`, C++ \`stack\`); in interviews you can also use an array and pretend.

| Operation | Cost |
|---|---|
| push / pop / peek | O(1) |
| search | O(n) |

## When a stack is the right answer

The signal to watch for: **most recent unmatched thing must be resolved first**.

- Matching brackets \`([{}])\` — [20. Valid Parentheses](#/problems/valid-parentheses)
- Undo operations, backtracking paths
- Function calls (the call stack *is* one)
- Flattening nested structures (iterative tree DFS — coming soon)
- "Next greater element to the right" → monotonic stacks (later this chapter)

## Bracket matching — the canonical example

\`\`\`python
pairs = {')': '(', ']': '[', '}': '{'}
st = []
for ch in s:
    if ch in '([{':
        st.append(ch)
    elif not st or st.pop() != pairs[ch]:
        return False
return not st        # every opener matched?
\`\`\`

Trace \`"([)]"\`: push \`(\`, push \`[\`, see \`)\` — top of stack is \`[\` ≠ \`(\` → invalid immediately. The stack catches the crossing that counting opens/closes would miss.
`,
  },
  '4646': {
    t: 'String problems',
    c: `
Strings + stacks solve an entire family of problems where symbols interact with their most recent partner.

## Pattern 1 — matching pairs

Brackets, HTML tags, parentheses validation… all reduce to push-on-open / match-on-close. See [20. Valid Parentheses](#/problems/valid-parentheses), [1249. Minimum Remove to Make Valid Parentheses](#/problems/minimum-remove-to-make-valid-parentheses).

## Pattern 2 — canceling adjacent duplicates

\`"abbaca"\` → push a,b; see b → cancel; see a → cancel; continue → \`"ca"\`:

\`\`\`python
st = []
for ch in s:
    if st and st[-1] == ch:
        st.pop()          # the pair annihilates
    else:
        st.append(ch)
return ''.join(st)
\`\`\`
[1047. Remove All Adjacent Duplicates In String](#/problems/remove-all-adjacent-duplicates-in-string). The k-duplicates variant stores *(char, count)* pairs instead: [1209. Remove All Adjacent Duplicates in String II](#/problems/remove-all-adjacent-duplicates-in-string-ii).

## Pattern 3 — evaluating/rewriting with delayed operators

Reverse Polish notation is pure stack: numbers push, operators pop two and apply ([150. Evaluate Reverse Polish Notation](#/problems/evaluate-reverse-polish-notation)). Path simplification pushes components and pops on \`..\` ([71. Simplify Path](#/problems/simplify-path)).

## Pattern 4 — decoding nested structures

\`3[a2[c]]\` → when you hit \`]\`, pop until \`[\`, then pop the repeat count:

<div class="svg-wrap">
<svg viewBox="0 0 720 170" role="img" aria-label="Nested decoding stack trace">
  <text x="360" y="18" text-anchor="middle" fill="currentColor" font-weight="700">decoding "3[a2[c]]"</text>
  <g font-family="ui-monospace, monospace" font-size="12.5">
    <g opacity=".85"><text x="60" y="55">see 3</text><rect x="140" y="38" width="90" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="185" y="56" text-anchor="middle">(3,"")</text></g>
    <g opacity=".85"><text x="60" y="85">see a</text><rect x="140" y="68" width="90" height="26" rx="6" fill="rgba(45,181,93,.15)" stroke="#2db55d"/><text x="185" y="86" text-anchor="middle">(∞,"a")</text></g>
    <g><text x="60" y="115">see 2</text><rect x="140" y="98" width="90" height="26" rx="6" fill="rgba(255,161,22,.16)" stroke="#ffa116"/><text x="185" y="116" text-anchor="middle">(3,"a")</text><rect x="240" y="98" width="90" height="26" rx="6" fill="rgba(239,71,67,.12)" stroke="#ef4743"/><text x="285" y="116" text-anchor="middle">(2,"")</text></g>
    <g><text x="60" y="145">see c</text><rect x="240" y="128" width="90" height="26" rx="6" fill="rgba(239,71,67,.12)" stroke="#ef4743"/><text x="285" y="146" text-anchor="middle">(2,"c")</text></g>
  </g>
  <text x="420" y="112" font-size="12.5" fill="currentColor" opacity=".75">on ']': pop (2,"c") → cur = "a"+"cc"</text>
  <text x="420" y="132" font-size="12.5" fill="currentColor" opacity=".75">then pop (3,"a") → cur = "acc"+... ×3</text>
  <text x="420" y="152" font-size="13" fill="#2db55d" font-weight="700">result: "accaccacc"</text>
</svg>
</div>

[394. Decode String](#/problems/decode-string) — do it with the picture above beside you.

> Whenever nesting appears in a string — brackets, repeats, tags — a stack maps the nesting depth to memory.
`,
  },
  '4516': {
    t: 'Queues',
    c: `
A queue is **First-In-First-Out (FIFO)** — the line at a store: enqueue at the back, dequeue from the front.

<div class="svg-wrap">
<svg viewBox="0 0 720 130" role="img" aria-label="Queue FIFO">
  <defs><marker id="qa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2db55d"/></marker><marker id="qr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ef4743"/></marker></defs>
  <g font-size="13">
    <rect x="220" y="45" width="70" height="42" rx="8" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="255" y="71" text-anchor="middle">front</text>
    <rect x="290" y="45" width="60" height="42" rx="8" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/>
    <rect x="350" y="45" width="60" height="42" rx="8" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/>
    <rect x="410" y="45" width="80" height="42" rx="8" fill="rgba(255,161,22,.18)" stroke="#ffa116"/><text x="450" y="71" text-anchor="middle">back</text>
    <text x="255" y="106" text-anchor="middle" font-size="11.5" fill="#ef4743" font-weight="700">dequeue ←</text>
    <text x="450" y="106" text-anchor="middle" font-size="11.5" fill="#2db55d" font-weight="700">→ enqueue</text>
  </g>
  <text x="360" y="24" text-anchor="middle" font-size="12" fill="currentColor" opacity=".6">fairness by arrival order — O(1) both ends (use deque, not list.shift())</text>
</svg>
</div>

Use a real double-ended queue implementation (\`collections.deque\` in Python, \`ArrayDeque\` in Java). Array \`shift()\` is O(n) and will silently wreck your BFS complexity analysis.

## Where queues are non-negotiable

- **BFS** — level-order traversal of trees, shortest path in unweighted graphs (next chapters). The queue *is* BFS.
- Producer/consumer scheduling — [622. Design Circular Queue](#/problems/design-circular_queue), [225. Implement Stack using Queues](#/problems/implement-stack-using-queues)
- Sliding-window maxima via monotonic **deque** — [239. Sliding Window Maximum](#/problems/sliding-window-maximum)
- Simulation problems where order of processing matters — [1700. Number of Students Unable to Eat Lunch](#/problems/number-of-students-unable-to-eat-lunch), [933. Number of Recent Calls](#/problems/number-of-recent-calls)

## Stack vs queue — same ops, opposite end

| Structure | In | Out | Superpower |
|---|---|---|---|
| Stack | top | top | most-recent-first (nesting) |
| Queue | back | front | arrival order (levels) |

Choosing between them is usually choosing between *depth* (DFS-ish) and *breadth* (BFS-ish) exploration.
`,
  },
  '4517': {
    t: 'Monotonic',
    c: `
A **monotonic stack** keeps its elements sorted (increasing or decreasing) from bottom to top. It answers, for every element: *"where is the next greater/smaller element?"* in overall **O(n)**.

## The move

Process left to right. Before pushing \`x\`, pop everything smaller than \`x\` — each popped element just found its next-greater:

\`\`\`python
st = []                       # indices, values decreasing
for i, x in arr enumerate(arr):
    while st and arr[st[-1]] < x:
        j = st.pop()
        answer[j] = i          # next greater than arr[j] is at i
    st.append(i)
# leftovers have no next-greater
\`\`\`

## Why it's O(n)

Each index is pushed once and popped once ⇒ ≤ 2n operations total. The inner \`while\` amortizes away.

## Watch it run

Input \`[2, 1, 5, 6, 2, 3]\` (the histogram of "Largest Rectangle"):

<div class="svg-wrap">
<svg viewBox="0 0 720 235" role="img" aria-label="Monotonic stack trace">
  <g font-size="12.5" font-family="ui-monospace, monospace">
    <text x="30" y="30">push 2</text><rect x="330" y="14" width="52" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="356" y="32" text-anchor="middle">2</text>
    <text x="30" y="64">push 1</text><rect x="330" y="48" width="52" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="356" y="66" text-anchor="middle">2</text><rect x="386" y="48" width="52" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="412" y="66" text-anchor="middle">1</text>
    <text x="30" y="104" fill="#ffa116">x=5 pops 1,2</text><rect x="330" y="88" width="52" height="26" rx="6" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="356" y="106" text-anchor="middle">5</text><text x="470" y="106" fill="#ef4743">→ ans[2]=?, ans[1]=?</text>
    <text x="30" y="138">push 6</text><rect x="330" y="122" width="52" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="356" y="140" text-anchor="middle">5</text><rect x="386" y="122" width="52" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="412" y="140" text-anchor="middle">6</text>
    <text x="30" y="172" fill="#ffa116">x=2 pops 6,5</text><rect x="330" y="156" width="52" height="26" rx="6" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="356" y="174" text-anchor="middle">2</text>
    <text x="30" y="206">push 3</text><rect x="330" y="190" width="52" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="356" y="208" text-anchor="middle">2</text><rect x="386" y="190" width="52" height="26" rx="6" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="412" y="208" text-anchor="middle">3</text>
  </g>
  <text x="560" y="115" text-anchor="middle" font-size="12" fill="currentColor" opacity=".65">bottom → top stays decreasing</text>
</svg>
</div>

## Recognizing it

Phrases like *"next greater/smaller"*, *"how many days until a warmer temperature"* ([739. Daily Temperatures](#/problems/daily-temperatures)), *"largest rectangle under a histogram"* ([84. Largest Rectangle in Histogram](#/problems/largest-rectangle-in-histogram)), removing digits to minimize value ([402. Remove K Digits](#/problems/remove-k-digits)).

Monotonic **deques** extend this to sliding-window extremes: keep candidates sorted; the front is always the window's max — [239. Sliding Window Maximum](#/problems/sliding-window-maximum).

> If a brute force looks backwards for every element ("scan left until you find something bigger"), flip your viewpoint: let the incoming element resolve everyone it dominates.
`,
  },
  '4518': {
    t: 'Stacks and queues quiz',
    c: `
Five quick checks.

**Q1.** Validating nested brackets requires a stack because:

- A. Strings are immutable — B. The most recent unclosed bracket must close first — C. Sorting is needed — D. Counting suffices for all cases

<details><summary>Solution</summary><p><strong>B.</strong> LIFO mirrors nesting; counting fails on crossings like <code>([)]</code>.</p></details>

**Q2.** Next-greater-element via monotonic stack costs O(n) because:

- A. The stack is tiny — B. Each index is pushed and popped at most once — C. Sorting first — D. Only one pass without pops

<details><summary>Solution</summary><p><strong>B.</strong> Amortized argument: total pushes = n bounds total pops.</p></details>

**Q3.** BFS uses a queue because:

- A. It saves memory — B. Nodes discovered earlier must be expanded earlier (level order) — C. Recursion needs it — D. Graphs are sorted

<details><summary>Solution</summary><p><strong>B.</strong> FIFO produces layer-by-layer expansion — exactly what unweighted shortest paths need.</p></details>

**Q4.** Python: why prefer <code>collections.deque</code> over <code>list.pop(0)</code> for queues?

- A. Nicer name — B. deque popleft is O(1); list.pop(0) shifts everything, O(n) — C. Lists can't store objects — D. No reason

<details><summary>Solution</summary><p><strong>B.</strong> The hidden linear shift turns your "O(n) BFS" into O(n²).</p></details>

**Q5.** Decoding <code>2[ab]c</code>, how many items are popped when the first <code>]</code> arrives?

- A. 0 — B. 1 (the "ab") — C. 2 (repeat count + current string) — D. all contents

<details><summary>Solution</summary><p><strong>C.</strong> Pop the accumulated segment and the multiplier, concatenate onto what remains.</p></details>
`,
  },
  '4708': {
    t: 'Bonus problems, stacks and queues',
    c: `
Extra reps for this chapter.

| Problem | Difficulty | trains |
|---|---|---|
| [20. Valid Parentheses](#/problems/valid-parentheses) | Easy | matching |
| [155. Min Stack](#/problems/min-stack) | Medium | auxiliary stack |
| [232. Implement Queue using Stacks](#/problems/implement-queue-using-stacks) | Easy | amortized transfer |
| [225. Implement Stack using Queues](#/problems/implement-stack-using-queues) | Easy | rotation trick |
| [496. Next Greater Element I](#/problems/next-greater-element-i) | Easy | intro monotonic |
| [682. Baseball Game](#/problems/baseball-game) | Easy | simulation stack |
| [1047. Remove All Adjacent Duplicates In String](#/problems/remove-all-adjacent-duplicates-in-string) | Easy | canceling |
| [394. Decode String](#/problems/decode-string) | Medium | nested decoding |
| [739. Daily Temperatures](#/problems/daily-temperatures) | Medium | next greater |
| [1249. Minimum Remove to Make Valid Parentheses](#/problems/minimum-remove-to-make-valid-parentheses) | Medium | mark & remove |
| [71. Simplify Path](#/problems/simplify-path) | Medium | tokenized simulation |
| [503. Next Greater Element II](#/problems/next-greater-element-ii) | Medium | circular array |
| [239. Sliding Window Maximum](#/problems/sliding-window-maximum) | Hard | monotonic deque |
| [84. Largest Rectangle in Histogram](#/problems/largest-rectangle-in-histogram) | Hard | monotonic + widths |
| [42. Trapping Rain Water](#/problems/trapping-rain-water) | Hard | stack vs two pointers |

**Challenge goals:** explain out loud why monotonic stack is O(n) despite the nested while-loop; implement Min Stack with all four operations O(1).
`,
  },
};
