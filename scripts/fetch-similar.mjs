import fs from 'node:fs';
import path from 'node:path';

const DESC_DIR = path.resolve('public/descriptions');
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Referer: 'https://leetcode.com/problemset/all/',
  'Content-Type': 'application/json',
};

const QUERY = `query q($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    titleSlug
    similarQuestions
  }
}`;

const CONCURRENCY = Number(process.env.CONC || 6);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchSimilar(slug) {
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
      if (j.errors?.length) throw new Error(j.errors[0]?.message);
      const raw = j.data?.question?.similarQuestions;
      const sim = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(sim)
        ? sim.map((s) => ({ t: s.title, s: s.titleSlug, d: s.difficulty, p: !!s.isPaidOnly }))
        : [];
    } catch (e) {
      if (attempt === 3) throw e;
      await sleep(700 * attempt);
    }
  }
}

async function main() {
  const slugs = fs
    .readdirSync(DESC_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));

  // resume: skip docs already having an `s` key
  const todo = slugs.filter((slug) => {
    const doc = JSON.parse(fs.readFileSync(path.join(DESC_DIR, `${slug}.json`), 'utf8'));
    return !Array.isArray(doc.s);
  });
  console.log(`total: ${slugs.length}, todo: ${todo.length}`);
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
      const slug = todo[cursor++];
      const f = path.join(DESC_DIR, `${slug}.json`);
      try {
        const sim = await fetchSimilar(slug);
        const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
        doc.s = sim;
        fs.writeFileSync(f, JSON.stringify(doc));
        ok++;
      } catch (e) {
        console.error(`\n[fail] ${slug}: ${e.message}`);
        failed.push(slug);
      }
      if ((ok + failed.length) % 100 === 0) {
        const pct = (((ok + failed.length) / todo.length) * 100).toFixed(1);
        const rate = ((ok + failed.length) / ((Date.now() - started) / 1000)).toFixed(1);
        process.stdout.write(`\r${ok + failed.length}/${todo.length} (${pct}%) ${rate}/s   `);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log('');
  console.log('----------------------------------------');
  console.log(`enriched : ${ok}`);
  console.log(`failed   : ${failed.length}${failed.length ? ' -> ' + failed.slice(0, 15).join(', ') : ''}`);
  if (failed.length) process.exitCode = 2;
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
