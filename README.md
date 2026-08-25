# FreeCode

A LeetCode-style DSA practice app — the complete numbered problem set, fully offline. No login, no contests, no subscriptions.

## Features

- **Full problem set** — all 4,033 problems with the same numbering as LeetCode
- **Offline statements** — every problem description, hints and metadata pre-fetched into `public/descriptions/` (works with zero network access)
- **Top Interview 150** — LeetCode's curated interview list as a first-class page with per-topic progress (`#/top-interview-150`)
- **Interview Crash Course** — the full 13-chapter / 149-item curriculum of *LeetCode's Interview Crash Course: Data Structures and Algorithms*, rebuilt offline (`#/course`); includes every freely readable lesson verbatim, links each exercise to its local problem, and tracks completion
- **Progress tracking** — solved / favorites / notes persisted in `localStorage`
- **Filters** — search by title or number, difficulty chips, status, 100+ topic tags, hide premium
- **Sortable table** — number, title, acceptance rate, difficulty
- **Code editor** — line numbers, tab support, per-problem + per-language persistence, auto-generated LeetCode-style stubs for C++, Java, Python3, JavaScript, TypeScript and Go (built from each problem's function signature)
- **Random unsolved problem**, prev/next navigation, dark/light theme

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

The dataset ships with the repo (`public/data/problems.json` + `public/descriptions/*.json`), so the app is immediately usable offline.

### Zero external dependencies (verified)

- **No runtime API calls** — every statement loads from `public/descriptions/<slug>.json`
- **All figures localized** — 1,417 CDN images (~74 MB) downloaded into `public/assets/img/`, statement HTML rewritten to local paths; includes one embedded `.mp4`
- No external fonts (system stack), no iframes, no remote CSS/JS; favicon is an inline data URI
- The only remaining external references are 91 plain `<a href>` links to leetcode.com (navigation, not resources)
- 3 images that are *broken on LeetCode's own CDN* were patched: real sibling assets found where possible, otherwise replaced with an honest inline placeholder

## Refreshing the dataset

```bash
npm run fetch:problems        # re-fetch ALL problems (+ tags) -> public/data/problems.json
npm run fetch:descriptions    # re-fetch all statements -> public/descriptions/<slug>.json (~6 min, resumable)
npm run fetch:top150          # re-fetch Top Interview 150 -> public/data/top-interview-150.json
npm run fetch:course          # re-fetch the Interview Crash Course -> public/data/crash-course.json + public/data/course/
```

Both scripts are idempotent/resumable; use `--force` on `fetch:descriptions` to re-download everything.

### Premium problem statements (781 locked problems)

LeetCode only serves premium statements to subscribers, so fetching them requires **your own LeetCode Premium session**:

1. Log in to [leetcode.com](https://leetcode.com) with a premium account
2. DevTools → **Application** → **Cookies** → `https://leetcode.com`
3. Copy the values of `LEETCODE_SESSION` and `csrftoken`
4. Create `.lc-secrets.json` in the project root (gitignored):

   ```json
   { "session": "<LEETCODE_SESSION value>", "csrftoken": "<csrftoken value>" }
   ```

5. Run:

   ```bash
   npm run fetch:premium
   ```

The script first verifies your session actually unlocks premium content, then downloads all missing statements (~2 min). Tip: one month of Premium is enough — fetch everything once and it stays local forever. The app picks the files up automatically; no rebuild needed.

#### What premium access covers — audit results

- **Statements**: 4,033/4,033 descriptions fetched, including all 781 premium problems ✅
- **Official editorials**: every editorial that exists on LeetCode is in `public/solutions/` (2,053 total). The rest genuinely have none server-side (`solution: null` even with a live premium session)
- **Company tags & frequency**: 985 companies + per-problem mapping, frequency scores in `problems.json` ✅
- **Interview Crash Course articles**: NOT part of Premium — it's a separate $44.99 add-on (`hasAccess: false`). Only the 4 public preview lessons are fetchable; everything else in `#/course` links to the local problem set instead

## Production build

```bash
npm run build
npm run preview   # serves dist/ at http://localhost:4173
```

Fully static output — host it anywhere.

## Project layout

```
scripts/fetch-problems.mjs      dataset generator (REST list + GraphQL v2 tag enrichment)
scripts/fetch-descriptions.mjs  bulk statement downloader (concurrent, resumable)
scripts/fetch-top-interview-150.mjs  Top Interview 150 study plan fetcher
scripts/fetch-crash-course.mjs  Interview Crash Course curriculum fetcher
public/data/problems.json       full numbered problem set (id, title, slug, difficulty, premium, tags, acceptance, freq)
public/data/top-interview-150.json  Top Interview 150 groups -> problem slugs
public/data/crash-course.json   course index: 13 chapters / 149 items with problem links
public/data/course/             downloadable lesson articles (markdown)
public/descriptions/            one JSON per problem: content HTML, hints, metaData, topic tags
src/pages/                      list page, detail page, Top Interview 150, course
src/components/                 table, filters, sidebar, editor, pagination
src/lib/                        store (localStorage), api loader, markdown, stubs, utils
```
