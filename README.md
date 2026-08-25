# FreeCode

A LeetCode-style DSA practice app — the complete numbered problem set, fully offline. No login, no contests, no subscriptions.

## Features

- **Full problem set** — all 4,033 problems with the same numbering as LeetCode
- **Offline statements** — every problem description, hints and metadata pre-fetched into `public/descriptions/` (works with zero network access)
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

## Refreshing the dataset

```bash
npm run fetch:problems        # re-fetch ALL problems (+ tags) -> public/data/problems.json
npm run fetch:descriptions    # re-fetch all statements -> public/descriptions/<slug>.json (~6 min, resumable)
```

Both scripts are idempotent/resumable; use `--force` on `fetch:descriptions` to re-download everything.

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
public/data/problems.json       full numbered problem set (id, title, slug, difficulty, premium, tags, acceptance)
public/descriptions/            one JSON per problem: content HTML, hints, metaData, topic tags
src/pages/                      list page, detail page
src/components/                 table, filters, sidebar, editor, pagination
src/lib/                        store (localStorage), api loader, stubs, utils
```
