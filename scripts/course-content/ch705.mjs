// Chapter 705 - Hashing (locked articles)
export default {
  '4510': {
    t: 'Hashing',
    c: `
**Hashing** trades memory for speed: a hash map/set gives you average **O(1)** insert, delete and lookup. Whenever your instinct says "search for X in this array", hashing usually replaces that O(n) scan.

## What actually happens

A **hash function** converts any key into an integer; modding by the table size picks a **bucket**:

<div class="svg-wrap">
<svg viewBox="0 0 720 230" role="img" aria-label="Hash map buckets">
  <defs><marker id="ha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffa116"/></marker></defs>
  <text x="360" y="20" text-anchor="middle" fill="currentColor" font-weight="700">map.put("cat", 3)   →   hash("cat") = 41   →   41 % 5 = 1</text>
  <rect x="60" y="55" width="150" height="40" rx="8" fill="rgba(255,161,22,.13)" stroke="#ffa116"/><text x="135" y="80" text-anchor="middle">"cat" → 3</text>
  <path d="M210 75 H300" stroke="#ffa116" stroke-width="2" marker-end="url(#ha)"/>
  <text x="255" y="62" text-anchor="middle" font-size="11.5" fill="#ffa116">hash</text>
  <path d="M420 75 C 480 75, 500 95, 520 108" stroke="#ffa116" stroke-width="2" fill="none" marker-end="url(#ha)"/>
  <text x="470" y="66" font-size="11.5" fill="#ffa116">% 5</text>
  <g font-family="ui-monospace, monospace" font-size="12.5">
    <rect x="530" y="40" width="130" height="30" rx="7" fill="rgba(76,159,254,.10)" stroke="#3a3a3a"/><text x="542" y="60" fill="currentColor">0</text><text x="600" y="60" text-anchor="middle" opacity=".45">("dog",5)</text>
    <rect x="530" y="74" width="130" height="30" rx="7" fill="rgba(45,181,93,.18)" stroke="#2db55d" stroke-width="2"/><text x="542" y="94" fill="currentColor">1</text><text x="608" y="94" text-anchor="middle" font-weight="700">("cat",3)</text>
    <rect x="530" y="108" width="130" height="30" rx="7" fill="rgba(76,159,254,.10)" stroke="#3a3a3a"/><text x="542" y="128" fill="currentColor">2</text>
    <rect x="530" y="142" width="130" height="30" rx="7" fill="rgba(76,159,254,.10)" stroke="#3a3a3a"/><text x="542" y="162" fill="currentColor">3</text><text x="600" y="162" text-anchor="middle" opacity=".45">("owl",9)</text>
    <rect x="530" y="176" width="130" height="30" rx="7" fill="rgba(239,71,67,.12)" stroke="#ef4743" stroke-dasharray="4 3"/><text x="542" y="196" fill="currentColor">4</text><text x="608" y="196" text-anchor="middle" opacity=".7">collision!</text>
  </g>
</svg>
</div>

Two keys landing in one bucket is a **collision** — implementations handle it with chaining or probing, which is why lookup is *average* O(1) but **O(n) worst case** (rare in practice, but worth saying in interviews).

## The three tools

| Tool | Answers | Python | Java |
|---|---|---|---|
| Hash set | "have I seen X?" | \`set()\` | \`HashSet\` |
| Hash map | "how many / where / what is associated with X?" | \`dict\` | \`HashMap\` |
| Counting map | "frequency of X?" | \`Counter\` / dict | \`HashMap<K,Integer>\` |

## Cost model

| Operation | Average | Worst |
|---|---|---|
| insert / lookup / delete | O(1) | O(n) |
| Space | O(k) keys stored | |

Compare: "does this array contain duplicates?" is O(n²) nested loops, O(n log n) after sorting — or **O(n)** with a set.

## Choosing the key (the real skill)

The hard part of hash problems is deciding *what to store*:

- seen values? → set
- value → index (last seen)? → map
- value → count? → counting map
- a *derived signature* (sorted word, bitmask, prefix sum)? → map from signature to list/count

That last row powers the hardest problems in this chapter — e.g. grouping anagrams by their sorted-letter signature: [49. Group Anagrams](#/problems/group-anagrams).
`,
  },
  '4511': {
    t: 'Checking for existence',
    c: `
The simplest and most valuable hashing pattern: replace search-with-a-loop with membership-in-a-set.

## Before / after

\`\`\`python
# O(n²): for each number, scan the rest
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] == nums[j]:
            return True
return False
\`\`\`

\`\`\`python
# O(n): remember what we've seen
seen = set()
for x in nums:
    if x in seen:
        return True
    seen.add(x)
return False
\`\`\`

<div class="svg-wrap">
<svg viewBox="0 0 720 150" role="img" aria-label="Set membership flow">
  <defs><marker id="sa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2db55d"/></marker></defs>
  <g font-size="13">
    <rect x="50" y="50" width="120" height="44" rx="9" fill="rgba(76,159,254,.13)" stroke="#4c9ffe"/><text x="110" y="77" text-anchor="middle">next element</text>
    <rect x="240" y="50" width="170" height="44" rx="9" fill="rgba(255,161,22,.15)" stroke="#ffa116"/><text x="325" y="71" text-anchor="middle" font-weight="700">x ∈ seen ?</text><text x="325" y="87" text-anchor="middle" font-size="11" opacity=".7">O(1) hash lookup</text>
    <rect x="500" y="18" width="160" height="40" rx="9" fill="rgba(239,71,67,.14)" stroke="#ef4743"/><text x="580" y="43" text-anchor="middle">yes → duplicate found</text>
    <rect x="500" y="88" width="160" height="40" rx="9" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="580" y="113" text-anchor="middle">no → add x to seen</text>
  </g>
  <g stroke="#9d9d9d" stroke-width="1.7" fill="none">
    <line x1="170" y1="72" x2="236" y2="72" marker-end="url(#sa)"/>
    <line x1="410" y1="64" x2="496" y2="40" marker-end="url(#sa)"/>
    <line x1="410" y1="82" x2="496" y2="106" marker-end="url(#sa)"/>
    <path d="M580 132 C 400 165, 180 140, 112 98" stroke="#2db55d" stroke-dasharray="5 4" marker-end="url(#sa)"/>
  </g>
</svg>
</div>

## Variants of the same move

- **Seen before?** → [217. Contains Duplicate](#/problems/contains-duplicate), [141. Linked List Cycle](#/problems/linked-list-cycle)
- **Have we seen the complement?** Two Sum stores \`target - x\`: for each \`x\`, check whether its partner was already seen — one pass, no nested loop.
  \`\`\`python
  prev = {}                       # value -> index
  for i, x in enumerate(nums):
      if target - x in prev:
          return [prev[target - x], i]
      prev[x] = i
  \`\`\`
- **Visited marking on graphs/grids** — DFS/BFS use exactly this pattern (coming up in Trees and Graphs).

## Interview tip

When you reach for a set, say the trade-off out loud: *"I'll use O(n) extra space to buy down the time from O(n²) to O(n)."* Naming the exchange explicitly is graded communication.
`,
  },
  '4512': {
    t: 'Counting',
    c: `
Counting maps answer "**how many** of each?" — the workhorse behind frequency comparisons, anagram checks, and top-k problems.

## The core loop

\`\`\`python
from collections import defaultdict
count = defaultdict(int)
for x in items:
    count[x] += 1
\`\`\`

<div class="svg-wrap">
<svg viewBox="0 0 720 190" role="img" aria-label="Frequency counting histogram">
  <text x="360" y="20" text-anchor="middle" fill="currentColor" font-weight="700">"aabbca" → count = {a:3, b:2, c:1}</text>
  <g font-size="13">
    <line x1="120" y1="150" x2="600" y2="150" stroke="currentColor" opacity=".35"/>
    <rect x="180" y="70" width="70" height="80" rx="6" fill="rgba(255,161,22,.25)" stroke="#ffa116"/><text x="215" y="62" text-anchor="middle" font-weight="700">3</text><text x="215" y="172" text-anchor="middle">a</text>
    <rect x="330" y="100" width="70" height="50" rx="6" fill="rgba(76,159,254,.22)" stroke="#4c9ffe"/><text x="365" y="92" text-anchor="middle" font-weight="700">2</text><text x="365" y="172" text-anchor="middle">b</text>
    <rect x="480" y="120" width="70" height="30" rx="6" fill="rgba(139,92,246,.22)" stroke="#8b5cf6"/><text x="515" y="112" text-anchor="middle" font-weight="700">1</text><text x="515" y="172" text-anchor="middle">c</text>
  </g>
</svg>
</div>

## Signature applications

**Anagrams** — same letters, same counts. Compare the two count maps (or one map incremented for string 1 and decremented for string 2, then all zeros):
[242. Valid Anagram](#/problems/valid-anagram)

**Top-K frequent** — count, then find the k largest values (with a heap in the Heaps chapter):
[347. Top K Frequent Elements](#/problems/top-k-frequent-elements)

**First unique character** — count once, scan again for the first entry with count 1:
[387. First Unique Character in a String](#/problems/first-unique-character-in-a-string)

**Subarray counting** — combine counts with prefix sums:
\`\`\`python
# number of subarrays summing to k
prefix_count = {0: 1}
total = ans = 0
for x in nums:
    total += x
    ans += prefix_count.get(total - k, 0)   # earlier prefixes completing a window
    prefix_count[total] = prefix_count.get(total, 0) + 1
\`\`\`
This is the crown jewel of the pattern: [560. Subarray Sum Equals K](#/problems/subarray-sum-equals-k)

## Bounded alphabets: arrays beat maps

When keys are only lowercase letters (or ASCII), a fixed array is faster and allocation-free:

\`\`\`java
int[] cnt = new int[26];
for (char ch : s.toCharArray()) cnt[ch - 'a']++;
\`\`\`

Interviewers like hearing both options: *"map for generality, array when the alphabet is bounded."*
`,
  },
  '4645': {
    t: 'More hashing examples',
    c: `
Three slightly deeper hashing idioms that appear constantly in mediums.

## 1. Value → index (last occurrence)

Keep the *most recent position* of each element while scanning — enables "distance since last seen" checks in O(1):

\`\`\`python
last = {}
best = left = 0
for right, ch in enumerate(s):
    if ch in last and last[ch] >= left:
        left = last[ch] + 1        # jump past previous occurrence
    last[ch] = right
    best = max(best, right - left + 1)
\`\`\`
This is the classic longest-substring-without-repeating-characters solution — [3. Longest Substring Without Repeating Characters](#/problems/longest-substring-without-repeating-characters). Note how the map lets \`left\` **jump** instead of inching.

## 2. Signature → group

Transform each item into a canonical key, then bucket:

<div class="svg-wrap">
<svg viewBox="0 0 720 170" role="img" aria-label="Signature bucketing">
  <text x="360" y="20" text-anchor="middle" fill="currentColor" font-weight="700">group anagrams: signature = letters sorted</text>
  <g font-size="12.5" font-family="ui-monospace, monospace">
    <rect x="40"  y="45" width="86" height="30" rx="7" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/><text x="83"  y="65" text-anchor="middle">"eat"</text>
    <rect x="40"  y="90" width="86" height="30" rx="7" fill="rgba(76,159,254,.12)" stroke="#4c9ffe"/><text x="83"  y="110" text-anchor="middle">"tea"</text>
    <rect x="200" y="45" width="86" height="30" rx="7" fill="rgba(139,92,246,.14)" stroke="#8b5cf6"/><text x="243" y="65" text-anchor="middle">"tan"</text>
    <rect x="360" y="67" width="120" height="30" rx="7" fill="rgba(255,161,22,.15)" stroke="#ffa116"/><text x="420" y="87" text-anchor="middle">→ "aet" / "ant"</text>
    <rect x="540" y="38" width="150" height="32" rx="8" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="615" y="59" text-anchor="middle">["eat","tea"]</text>
    <rect x="540" y="96" width="150" height="32" rx="8" fill="rgba(45,181,93,.16)" stroke="#2db55d"/><text x="615" y="117" text-anchor="middle">["tan"]</text>
  </g>
  <g stroke="#9d9d9d" stroke-width="1.5"><line x1="126" y1="60" x2="356" y2="78"/><line x1="126" y1="105" x2="356" y2="90"/><line x1="286" y1="60" x2="356" y2="84"/><line x1="480" y1="82" x2="536" y2="56"/><line x1="480" y1="82" x2="536" y2="108"/></g>
</svg>
</div>

Other signatures worth knowing: sorted digits ([49. Group Anagrams](#/problems/group-anagrams)), letter-count tuples, row/column index for grid grouping, remainder classes for [974. Subarray Sums Divisible by K](#/problems/subarray-sums-divisible-by-k).

## 3. Set of visited states (flood-fill / cycles)

Any algorithm that would revisit states uses a set to guarantee progress: grid flood fills, cycle detection, [202. Happy Number](#/problems/happy-number) (set of seen sums), and every graph traversal you will write in the trees/graphs chapter.

> **Rule of thumb:** whenever complexity analysis shows repeated scanning ("look back", "check rest of array"), name the thing you keep looking for and put it in a map.
`,
  },
  '4513': {
    t: 'Hashing quiz',
    c: `
Five questions. Answers hide until you need them.

**Q1.** Average vs worst-case lookup in a hash map?

- A. O(1) / O(1) — B. O(1) / O(log n) — C. O(1) / O(n) — D. O(log n) / O(n)

<details><summary>Solution</summary><p><strong>C.</strong> Collisions can force linear scans within a bucket in pathological cases.</p></details>

**Q2.** Two Sum in one pass with a hash map uses:

- A. O(n) time, O(1) space — B. O(n log n) time, O(1) space — C. O(n) time, O(n) space — D. O(n²), O(1)

<details><summary>Solution</summary><p><strong>C.</strong> Store each visited value's index; check the complement before inserting. One pass, linear space.</p></details>

**Q3.** Checking two strings are anagrams via count-maps costs (n = length, alphabet Σ):

- A. O(n·log n) — B. O(n + Σ) — C. O(Σ) — D. O(n²)

<details><summary>Solution</summary><p><strong>B.</strong> One pass to count each string plus comparing a constant-bounded alphabet.</p></details>

**Q4.** You need the number of subarrays summing to K with negative numbers allowed. Best tool?

- A. Sliding window — B. Sort + two pointers — C. Prefix sums + hash map of counts — D. Nested loops only

<details><summary>Solution</summary><p><strong>C.</strong> Windows break with negatives; prefix-sum + count-map keeps it O(n).</p></details>

**Q5.** Keys are lowercase words; you must group words that are rotations-free anagrams of each other. Best key design?

- A. The word itself — B. Word length — C. Sorted letters as a tuple/string — D. First letter

<details><summary>Solution</summary><p><strong>C.</strong> Canonical form: all anagrams share exactly one sorted-letter signature.</p></details>
`,
  },
  '4706': {
    t: 'Bonus problems, hashing',
    c: `
Level-up reps for hashing. Pattern tags are spoilers — earn them first.

| Problem | Difficulty | trains |
|---|---|---|
| [1. Two Sum](#/problems/two-sum) | Easy | complement lookup |
| [217. Contains Duplicate](#/problems/contains-duplicate) | Easy | set membership |
| [383. Ransom Note](#/problems/ransom-note) | Easy | counting compare |
| [448. Find All Numbers Disappeared](#/problems/find-all-numbers-disappeared-in-an-array) | Easy | index-as-hash |
| [349. Intersection of Two Arrays](#/problems/intersection-of-two-arrays) | Easy | set ops |
| [128. Longest Consecutive Sequence](#/problems/longest-consecutive-sequence) | Medium | set + sequence starts |
| [49. Group Anagrams](#/problems/group-anagrams) | Medium | signature bucketing |
| [347. Top K Frequent Elements](#/problems/top-k-frequent-elements) | Medium | counting + heap |
| [560. Subarray Sum Equals K](#/problems/subarray-sum-equals-k) | Medium | prefix + count map |
| [3. Longest Substring Without Repeating Characters](#/problems/longest-substring-without-repeating-characters) | Medium | last-index map |
| [238. Product of Array Except Self](#/problems/product-of-array-except-self) | Medium | prefix/suffix |
| [41. First Missing Positive](#/problems/first-missing-positive) | Hard | index-as-hash, O(1) space |

**Challenge goals:** solve 128 in O(n) *without sorting* (hint: a number starts a run only if \`num-1 ∉ set\`); then re-solve 41 with all values positive and no extra array.
`,
  },
};
