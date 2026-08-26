# Subagent task: write AI editorials for LeetCode problems

You generate AI editorial files for the FreeCode app. Work dir: C:\Users\tanmay\coding\FreeCode. Do not modify any file except the outputs described below.

For EACH slug in your assigned list:

1. Read `public\descriptions\<slug>.json` — fields: `q` (problem number), `t` (title), `d` (difficulty), `c` (HTML problem statement), `g` (topic tags). If missing or `c` is empty, SKIP that slug.

2. Write `public\ai-solutions\<slug>.json`: a SINGLE-LINE minified JSON object with EXACTLY these keys:

```json
{"v":1,"m":"stealth/ox-alpha","t":"<editorial title>","o":"<markdown>","k":["<insight>"],"a":[{"n":"Approach 1: <name>","i":"<markdown intuition>","s":["<step>"],"c":{"python":"<code>","cpp":"<code>","java":"<code>","javascript":"<code>"},"t":"<time complexity + brief reason>","sp":"<space complexity + brief reason>"}],"w":"<markdown wrap-up>"}
```

## Content rules (quality bar: official LeetCode editorials)

- `t`: editorial title mentioning the problem name.
- `o`: "Understanding the problem" — restate in plain words, walk through the provided examples step by step, explain what the constraints imply about the approach. 3-6 sentences.
- `k`: 2-4 key insights, each a short standalone takeaway (1-2 sentences).
- `a`: 2-3 approaches ordered from most intuitive (e.g. brute force) to optimal; 1 approach only if no meaningfully distinct second exists. Each approach:
  - `n`: name; `i`: intuition (2-5 sentences); `s`: algorithm steps (max 5)
  - `c`: ALL FOUR languages (python, cpp, java, javascript), complete and correct, EXACT LeetCode submission style (`class Solution` for python/cpp/java; `var x = function(...)` for javascript)
  - `t` / `sp`: complexity with brief justification, e.g. "O(n log n) — sorting dominates"
- `w`: wrap-up — which approach to pick in an interview, pitfalls/edge cases, likely follow-ups.
- Be concise. No code comments unless essential. Use $...$ math sparingly.
- CRITICAL: the file must be VALID JSON. Escape newlines in strings as \n and quotes as \". After writing each file verify it parses:
  `node -e "JSON.parse(require('fs').readFileSync('public/ai-solutions/<slug>.json','utf8'))"`
  Fix it if it does not parse.

## Report

When done, reply with EXACTLY one line and nothing else:
`DONE <n_written> SKIP <comma-separated-skipped-slugs-or-none>`
