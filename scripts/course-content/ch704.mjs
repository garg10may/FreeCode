// Chapter 704 - Linked lists (locked articles)
export default {
  '4506': {
    t: 'Linked lists',
    c: `
A linked list stores elements in **nodes** connected by pointers. Unlike arrays, nodes are scattered in memory — the order lives entirely in the \`next\` references.

## Anatomy

<div class="svg-wrap">
<svg viewBox="0 0 720 150" role="img" aria-label="Linked list structure">
  <defs><marker id="la" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
  <g font-size="13">
    <g><rect x="60" y="40" width="110" height="52" rx="9" fill="rgba(255,161,22,.14)" stroke="#ffa116"/><line x1="128" y1="40" x2="128" y2="92" stroke="#ffa116"/><text x="94" y="71" text-anchor="middle">4</text><text x="149" y="71" text-anchor="middle" font-size="11" opacity=".7">next</text></g>
    <g><rect x="250" y="40" width="110" height="52" rx="9" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><line x1="318" y1="40" x2="318" y2="92" stroke="#4c9ffe"/><text x="284" y="71" text-anchor="middle">2</text><text x="339" y="71" text-anchor="middle" font-size="11" opacity=".7">next</text></g>
    <g><rect x="440" y="40" width="110" height="52" rx="9" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><line x1="508" y1="40" x2="508" y2="92" stroke="#8b5cf6"/><text x="474" y="71" text-anchor="middle">7</text><text x="529" y="71" text-anchor="middle" font-size="11" opacity=".7">next</text></g>
    <text x="600" y="71" font-size="15" opacity=".7">∅</text>
    <path d="M170 66 H246" stroke="currentColor" stroke-width="1.8" fill="none" marker-end="url(#la)"/>
    <path d="M360 66 H436" stroke="currentColor" stroke-width="1.8" fill="none" marker-end="url(#la)"/>
    <path d="M550 66 H585" stroke="currentColor" stroke-width="1.8" fill="none" marker-end="url(#la)"/>
    <text x="115" y="26" text-anchor="middle" font-size="12" fill="#ffa116" font-weight="700">head</text>
    <path d="M115 30 v8" stroke="#ffa116" stroke-width="1.6"/>
  </g>
  <text x="360" y="130" text-anchor="middle" font-size="12" fill="currentColor" opacity=".6">no index math possible — reaching node i costs i hops</text>
</svg>
</div>

| Operation | Linked list | Array |
|---|---|---|
| Access i-th | **O(n)** | O(1) |
| Insert/delete *given the node* | **O(1)** | O(n) shift |
| Insert at front | O(1) | O(n) |
| Memory locality | poor (cache misses) | excellent |

Interview consequence: list problems are about **rewiring pointers correctly**, not about indexing.

## The universal traversal

\`\`\`python
cur = head
while cur:
    cur = cur.next
\`\`\`

And the single most useful trick in this entire chapter — a dummy head:

\`\`\`python
dummy = ListNode(0, head)   # simplifies "delete/insert at front"
... work with dummy ...
return dummy.next
\`\`\`

The dummy removes every "is this the head?" special case. When your solution has an \`if cur == head\` branch, you probably want a dummy instead.

## Edge cases checklist (memorize)

- empty list (\`head is None\`)
- single node
- operation touches the head or tail
- cycles (if not promised absent, use fast/slow — next lesson)
`,
  },
  '4507': {
    t: 'Fast and slow pointers',
    c: `
Two pointers moving at different speeds turn hard list problems into easy ones — no extra memory, no counting passes.

## Cycle detection (Floyd's tortoise & hare)

Move \`slow\` by 1 and \`fast\` by 2 each step. If they ever meet, there is a cycle; if \`fast\` reaches the end, there isn't:

<div class="svg-wrap">
<svg viewBox="0 0 720 200" role="img" aria-label="Floyd cycle detection">
  <defs><marker id="fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
  <g font-size="13">
    <circle cx="80"  cy="100" r="22" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><text x="80" y="105" text-anchor="middle">1</text>
    <circle cx="190" cy="100" r="22" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><text x="190" y="105" text-anchor="middle">2</text>
    <circle cx="300" cy="100" r="22" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="300" y="105" text-anchor="middle">3</text>
    <circle cx="430" cy="55"  r="22" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="430" y="60" text-anchor="middle">4</text>
    <circle cx="560" cy="75"  r="22" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="560" y="80" text-anchor="middle">5</text>
    <circle cx="545" cy="160" r="22" fill="rgba(239,71,67,.13)" stroke="#ef4743"/><text x="545" y="165" text-anchor="middle">6</text>
    <circle cx="380" cy="165" r="22" fill="rgba(139,92,246,.16)" stroke="#8b5cf6"/><text x="380" y="170" text-anchor="middle">7</text>
    <path d="M102 96 H164" stroke="currentColor" stroke-width="1.7" marker-end="url(#fa)"/>
    <path d="M212 96 H274" stroke="currentColor" stroke-width="1.7" marker-end="url(#fa)"/>
    <path d="M315 84 C 350 62, 385 52, 404 54" stroke="currentColor" stroke-width="1.7" fill="none" marker-end="url(#fa)"/>
    <path d="M452 56 C 490 58, 520 64, 536 70" stroke="currentColor" stroke-width="1.7" fill="none" marker-end="url(#fa)"/>
    <path d="M552 97 C 550 120, 548 132, 546 138" stroke="currentColor" stroke-width="1.7" fill="none" marker-end="url(#fa)"/>
    <path d="M522 168 C 480 172, 430 171, 404 167" stroke="currentColor" stroke-width="1.7" fill="none" marker-end="url(#fa)"/>
    <path d="M368 152 C 330 135, 310 122, 303 108" stroke="currentColor" stroke-width="1.7" fill="none" marker-end="url(#fa)"/>
  </g>
  <text x="300" y="20" text-anchor="middle" font-size="12" fill="currentColor" opacity=".65">tail leads into the cycle at node 3</text>
  <text x="240" y="140" text-anchor="middle" font-size="12" fill="#ffa116" font-weight="700">inside the cycle the gap closes by 1 each step → guaranteed meet</text>
</svg>
</div>

Why must they meet? Inside a loop of length k, each step increases \`fast - slow\` by exactly 1 (mod k), so the gap hits 0 within k steps. No arithmetic tricks needed.

\`\`\`python
slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow is fast:
        return True          # cycle
return False
\`\`\`

## Finding the middle

Same speeds, but stop when \`fast\` falls off the end: \`slow\` has traveled n/2 links — that's the middle. One pass, no length pre-count:

\`\`\`python
slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
return slow      # for even lengths: the second middle
\`\`\`

This is the standard opener for [876. Middle of the Linked List](#/problems/middle-of-the-linked-list), palindrome checks ([234. Palindrome Linked List](#/problems/palindrome-linked-list): find middle → reverse half → compare), and list mergesort splitting.

## Finding where the cycle begins (bonus proof sketch)

After they meet, restart one pointer at \`head\`; move both by 1. They meet again exactly at the cycle entrance. Distance algebra: \`a + b = 2(a + b + kc)\` ⇒ \`a ≡ b (mod c)\`. Practice it: [142. Linked List Cycle II](#/problems/linked-list-cycle-ii).
`,
  },
  '4600': {
    t: 'Reversing a linked list',
    c: `
Reversal is *the* list manipulation to know cold — it appears as a full problem, as a subroutine (palindromes, reorderings), and as an interview warm-up.

## The three-pointer dance

Walk the list once, flipping each \`next\` backwards. You need: \`prev\` (already reversed part), \`cur\` (being rewired), and a temporary hold of \`cur.next\`.

<div class="svg-wrap">
<svg viewBox="0 0 720 220" role="img" aria-label="Reversing one step">
  <defs><marker id="ra" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
  <text x="360" y="22" text-anchor="middle" fill="currentColor" font-weight="700">before:</text>
  <g font-size="13">
    <rect x="80" y="35" width="90" height="34" rx="8" fill="none" stroke="#9d9d9d"/><text x="125" y="57" text-anchor="middle">prev ∅</text>
    <rect x="230" y="35" width="90" height="34" rx="8" fill="rgba(255,161,22,.18)" stroke="#ffa116"/><text x="275" y="57" text-anchor="middle">cur 1</text>
    <rect x="400" y="35" width="90" height="34" rx="8" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="445" y="57" text-anchor="middle">2</text>
    <rect x="560" y="35" width="90" height="34" rx="8" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="605" y="57" text-anchor="middle">3</text>
    <path d="M320 52 H396" stroke="currentColor" stroke-width="1.7" marker-end="url(#ra)"/>
    <path d="M490 52 H556" stroke="currentColor" stroke-width="1.7" marker-end="url(#ra)"/>
    <text x="275" y="88" text-anchor="middle" font-size="12" fill="#ffa116" font-weight="700">nxt = cur.next</text>
  </g>
  <text x="360" y="128" text-anchor="middle" fill="currentColor" font-weight="700">after one flip:</text>
  <g font-size="13">
    <rect x="80" y="145" width="90" height="34" rx="8" fill="rgba(45,181,93,.18)" stroke="#2db55d"/><text x="125" y="167" text-anchor="middle">1</text>
    <rect x="400" y="145" width="90" height="34" rx="8" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="445" y="167" text-anchor="middle">2</text>
    <rect x="560" y="145" width="90" height="34" rx="8" fill="rgba(76,159,254,.14)" stroke="#4c9ffe"/><text x="605" y="167" text-anchor="middle">3</text>
    <path d="M396 162 H176" stroke="#2db55d" stroke-width="1.9" marker-end="url(#ra)"/>
    <text x="290" y="196" text-anchor="middle" font-size="12" fill="#ef4743">cur.next = prev   ← the only real work</text>
    <path d="M230 162 H174" stroke="#9d9d9d" stroke-width="1.4" stroke-dasharray="4 3"/>
  </g>
</svg>
</div>

Then slide everything right: \`prev = cur\`, \`cur = nxt\`.

\`\`\`python
def reverse_list(head):
    prev = None
    cur = head
    while cur:
        nxt = cur.next     # 1. save
        cur.next = prev    # 2. flip
        prev = cur         # 3. advance
        cur = nxt
    return prev            # new head
\`\`\`

**O(n)** time, **O(1)** space. Write this from memory until the save→flip→advance rhythm is automatic.

## Recursive version (know it, prefer iterative)

\`\`\`python
def reverse_list(head, prev=None):
    if not head:
        return prev
    nxt = head.next
    head.next = prev
    return reverse_list(nxt, head)
\`\`\`
Same idea; costs O(n) stack space.

## Reversing a sublist

For [92. Reverse Linked List II](#/problems/reverse-linked-list-ii): walk a \`prev\` pointer to position left−1 (use a dummy!), reverse exactly \`right − left + 1\` nodes with the same dance, then reconnect \`prev.next\` to the new sublist head and the sublist tail to the continuation.

## Where reversal hides

- [234. Palindrome Linked List](#/problems/palindrome-linked-list) — reverse the back half
- [143. Reorder List](#/problems/reorder-list) — split, reverse rear, interleave
- [25. Reverse Nodes in k-Group](#/problems/reverse-nodes-in-k-group) — repeated bounded reversals (hard, great practice)
`,
  },
  '4509': {
    t: 'Linked list quiz',
    c: `
Check yourself before the stacks chapter.

**Q1.** Why does inserting at the front cost O(1) in a linked list but O(n) in an array?

- A. Lists are smaller — B. Only the head pointer and one node change vs shifting everything — C. Arrays are immutable — D. It doesn't; both are O(n)

<details><summary>Solution</summary><p><strong>B.</strong> A list insert rewires two references; an array must move all existing elements right.</p></details>

**Q2.** Fast/slow finds the middle of a list of even length n=2k. Which node does \`slow\` stop on?

- A. k-th (first middle) — B. (k+1)-th (second middle) — C. depends on parity of k — D. tail

<details><summary>Solution</summary><p><strong>B.</strong> With <code>while fast and fast.next</code>, slow ends on the second of the two middles. Adjust the loop condition if you need the first.</p></details>

**Q3.** In Floyd's algorithm, why do the pointers *always* meet inside a cycle?

- A. Random luck — B. The gap changes by exactly 1 each step, so it reaches 0 mod cycle-length — C. fast slows down near slow — D. They both stop at the tail

<details><summary>Solution</summary><p><strong>B.</strong> Relative speed 2−1=1 guarantees closure within one lap.</p></details>

**Q4.** The purpose of a dummy (sentinel) node is to:

- A. Speed up traversal — B. Remove head-deletion/insertion special cases — C. Detect cycles — D. Save memory

<details><summary>Solution</summary><p><strong>B.</strong> Every node then has a predecessor, so "remove first element" is the same code as any other removal.</p></details>

**Q5.** Reversing a list iteratively uses how much extra space?

- A. O(n) — B. O(log n) — C. O(1) — D. O(n²)

<details><summary>Solution</summary><p><strong>C.</strong> Three pointers regardless of length. The recursive version would use O(n) stack.</p></details>
`,
  },
  '4707': {
    t: 'Bonus problems, linked lists',
    c: `
Extra reps, ordered roughly by difficulty.

| Problem | Difficulty | trains |
|---|---|---|
| [203. Remove Linked List Elements](#/problems/remove-linked-list-elements) | Easy | dummy + unlink |
| [328. Odd Even Linked List](#/problems/odd-even-linked-list) | Medium | two interleaved chains |
| [876. Middle of the Linked List](#/problems/middle-of-the-linked-list) | Easy | fast/slow |
| [206. Reverse Linked List](#/problems/reverse-linked-list) | Easy | core maneuver |
| [21. Merge Two Sorted Lists](#/problems/merge-two-sorted-lists) | Easy | zipper with dummy |
| [141. Linked List Cycle](#/problems/linked-list-cycle) | Easy | Floyd detect |
| [234. Palindrome Linked List](#/problems/palindrome-linked-list) | Easy | middle + reverse + compare |
| [142. Linked List Cycle II](#/problems/linked-list-cycle-ii) | Medium | Floyd entry point |
| [19. Remove Nth Node From End](#/problems/remove-nth-node-from-end-of-list) | Medium | lead/lag gap of n |
| [92. Reverse Linked List II](#/problems/reverse-linked-list-ii) | Medium | bounded reversal |
| [143. Reorder List](#/problems/reorder-list) | Medium | split+reverse+merge |
| [61. Rotate List](#/problems/rotate-list) | Medium | make it circular, cut |
| [86. Partition List](#/problems/partition-list) | Medium | two dummies |
| [138. Copy List with Random Pointer](#/problems/copy-list-with-random-pointer) | Medium | interleave clones |
| [148. Sort List](#/problems/sort-list) | Medium | merge sort on lists |
| [25. Reverse Nodes in k-Group](#/problems/reverse-nodes-in-k-group) | Hard | group reversals |

**Challenge goals:** implement 19 without measuring the length first (two pointers, one pass); implement 148 end-to-end from memory — it combines everything in this chapter.
`,
  },
};
