import fs from 'node:fs';
import path from 'node:path';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Referer: 'https://leetcode.com/problemset/all/',
  'Content-Type': 'application/json',
};

const QUERY = `query q($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId title titleSlug difficulty isPaidOnly
    content hints metaData topicTags { name slug }
  }
}`;

const OUT_DIR = path.resolve('public/descriptions');
const CONCURRENCY = Number(process.env.CONC || 6);
const FORCE = process.argv.includes('--force');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOne(slug) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ query: QUERY, variables: { titleSlug: slug } }),
        signal: AbortSignal.timeout(20000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      if (j.errors?.length) throw new Error(j.errors[0]?.message || 'GraphQL error');
      const q = j.data?.question;
      if (!q) throw new Error('not found');
      const diff = String(q.difficulty || '').toLowerCase();
      const doc = {
        q: q.questionFrontendId ?? '',
        t: q.title ?? '',
        d: diff === 'easy' ? 'Easy' : diff === 'hard' ? 'Hard' : 'Medium',
        p: !!q.isPaidOnly,
        c: q.content ?? null,
        h: Array.isArray(q.hints) ? q.hints : [],
        m: q.metaData ?? null,
        g: Array.isArray(q.topicTags) ? q.topicTags : [],
      };
      fs.writeFileSync(path.join(OUT_DIR, `${slug}.json`), JSON.stringify(doc));
      return true;
    } catch (e) {
      if (attempt === 3) {
        console.error(`\n[fail] ${slug}: ${e.message}`);
        return false;
      }
      await sleep(700 * attempt);
    }
  }
  return false;
}

async function main() {
  const problems = JSON.parse(fs.readFileSync(path.resolve('public/data/problems.json'), 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let todo = problems.map((p) => p.slug);
  if (!FORCE) {
    todo = todo.filter((slug) => {
      const f = path.join(OUT_DIR, `${slug}.json`);
      return !(fs.existsSync(f) && fs.statSync(f).size > 2);
    });
  }
  console.log(`problems: ${problems.length}, already fetched: ${problems.length - todo.length}, todo: ${todo.length}`);
  if (!todo.length) {
    console.log('nothing to do');
    return;
  }

  let cursor = 0;
  let ok = 0;
  const failed = [];
  const started = Date.now();

  async function worker() {
    while (cursor < todo.length) {
      const idx = cursor++;
      const slug = todo[idx];
      const good = await fetchOne(slug);
      if (good) ok++;
      else failed.push(slug);
      if ((ok + failed.length) % 50 === 0) {
        const pct = (((ok + failed.length) / todo.length) * 100).toFixed(1);
        const rate = ((ok + failed.length) / ((Date.now() - started) / 1000)).toFixed(1);
        process.stdout.write(`\r${ok + failed.length}/${todo.length} (${pct}%) ${rate}/s   `);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log('');

  // one sequential retry pass for stragglers
  if (failed.length) {
    console.log(`retrying ${failed.length} failures sequentially...`);
    const stillFailed = [];
    for (const slug of failed) {
      const good = await fetchOne(slug);
      if (good) ok++;
      else stillFailed.push(slug);
      await sleep(400);
    }
    failed.length = 0;
    failed.push(...stillFailed);
  }

  const written = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.json')).length;
  console.log('----------------------------------------');
  console.log(`written files : ${written}`);
  console.log(`succeeded     : ${ok}`);
  console.log(`failed        : ${failed.length}${failed.length ? ' -> ' + failed.slice(0, 20).join(', ') : ''}`);
  if (failed.length) process.exitCode = 2;
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
