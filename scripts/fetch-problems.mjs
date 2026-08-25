import fs from 'node:fs';
import path from 'node:path';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Referer: 'https://leetcode.com/problemset/all/',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRest() {
  const r = await fetch('https://leetcode.com/api/problems/all/', { headers: HEADERS });
  if (!r.ok) throw new Error(`REST /api/problems/all/ -> HTTP ${r.status}`);
  return r.json();
}

const LIST_QUERY = `query problemsetQuestionList($categorySlug: String!, $limit: Int!, $skip: Int!) {
  problemsetQuestionListV2(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: { filterCombineType: ALL }) {
    questions { questionFrontendId title titleSlug difficulty paidOnly topicTags { slug } }
  }
}`;

async function gqlPage(skip) {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: LIST_QUERY,
      variables: { categorySlug: '', limit: 100, skip },
    }),
  });
  const j = await r.json().catch(() => null);
  const list = j?.data?.problemsetQuestionListV2;
  if (!list || j.errors) throw new Error(j?.errors?.[0]?.message || `GraphQL -> HTTP ${r.status}`);
  return list.questions || [];
}

const LEVELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const ENUMS = { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' };

async function fetchAllTags() {
  const bySlug = new Map();
  for (let skip = 0; ; skip += 100) {
    const page = await gqlPage(skip);
    if (!page.length) break;
    for (const q of page) {
      if (!q.titleSlug) continue;
      bySlug.set(q.titleSlug, {
        difficulty: ENUMS[q.difficulty] || q.difficulty,
        paidOnly: !!q.paidOnly,
        tags: (q.topicTags || []).map((t) => t.slug),
        acRate: q.acRate ?? null,
      });
    }
    process.stdout.write(`\r[tags] ${skip + page.length}`);
    await sleep(120);
  }
  console.log('');
  return bySlug;
}

async function main() {
  console.log('[rest] fetching full problem list...');
  const raw = await fetchRest();
  const enrich = await fetchAllTags();
  console.log(`[tags] enriched ${enrich.size} problems`);

  const seen = new Set();
  const problems = [];
  for (const item of raw.stat_status_pairs || []) {
    const stat = item.stat || {};
    const slug = stat.question__title_slug;
    const idRaw = stat.frontend_question_id ?? stat.question_id;
    const title = stat.question__title;
    if (!slug || !title || !idRaw) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);

    const extra = enrich.get(slug) || {};
    const level = item.difficulty?.level;
    const totalAcs = stat.total_acs || 0;
    const totalSubmitted = stat.total_submitted || 0;

    problems.push({
      id: String(idRaw),
      title,
      slug,
      difficulty: extra.difficulty || LEVELS[level] || 'Medium',
      paidOnly: !!item.paid_only || !!extra.paidOnly,
      tags: extra.tags || [],
      ac: totalSubmitted ? Math.round((totalAcs / totalSubmitted) * 1000) / 10 : null,
    });
  }

  problems.sort((a, b) => {
    const na = parseInt(a.id, 10);
    const nb = parseInt(b.id, 10);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    if (!Number.isNaN(na)) return -1;
    if (!Number.isNaN(nb)) return 1;
    return a.id.localeCompare(b.id);
  });

  // sanity: ids should be contiguous-ish starting at 1
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  let tagged = 0;
  let paid = 0;
  let withAc = 0;
  for (const p of problems) {
    counts[p.difficulty] = (counts[p.difficulty] || 0) + 1;
    if (p.tags.length) tagged++;
    if (p.paidOnly) paid++;
    if (p.ac != null) withAc++;
  }

  const outDir = path.resolve('public/data');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'problems.json');
  fs.writeFileSync(outFile, JSON.stringify(problems));

  console.log('----------------------------------------');
  console.log(`total      : ${problems.length}`);
  console.log(`easy       : ${counts.Easy}`);
  console.log(`medium     : ${counts.Medium}`);
  console.log(`hard       : ${counts.Hard}`);
  console.log(`premium    : ${paid}`);
  console.log(`with tags  : ${tagged}`);
  console.log(`with ac%   : ${withAc}`);
  console.log(`first id   : ${problems[0]?.id} (${problems[0]?.slug})`);
  console.log(`last id    : ${problems.at(-1)?.id} (${problems.at(-1)?.slug})`);
  console.log(`written to : ${outFile}`);

  if (problems.length < 3000 && !process.env.ALLOW_SMALL) {
    throw new Error(`expected >=3000 problems, got ${problems.length} — refusing to write incomplete dataset`);
  }
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
