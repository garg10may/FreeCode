import fs from 'node:fs';
import path from 'node:path';

const secrets = JSON.parse(fs.readFileSync('.lc-secrets.json', 'utf8'));
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Referer: 'https://leetcode.com/problemset/all/',
  Cookie: `LEETCODE_SESSION=${secrets.session}; csrftoken=${secrets.csrftoken}`,
  'x-csrftoken': secrets.csrftoken,
};

const QUERY = `query q($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    titleSlug
    companyTags { name slug }
  }
}`;

const DESC_DIR = path.resolve('public/descriptions');
const CONCURRENCY = Number(process.env.CONC || 6);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchCompanies(slug) {
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
      const tags = j.data?.question?.companyTags;
      return Array.isArray(tags) ? tags.map((t) => [t.name, t.slug]) : [];
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

  const todo = slugs.filter((slug) => {
    const doc = JSON.parse(fs.readFileSync(path.join(DESC_DIR, `${slug}.json`), 'utf8'));
    return !Array.isArray(doc.co);
  });
  console.log(`total: ${slugs.length}, todo: ${todo.length}`);
  if (!todo.length) {
    await writeMap();
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
        const co = await fetchCompanies(slug);
        const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
        doc.co = co;
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
  if (failed.length) {
    console.log(`failed: ${failed.length} -> rerun to retry`);
    process.exitCode = 2;
  }
  await writeMap();
}

async function writeMap() {
  // derive slug -> company slugs index for fast offline filtering
  const map = {};
  let tagged = 0;
  for (const f of fs.readdirSync(DESC_DIR).filter((x) => x.endsWith('.json'))) {
    const doc = JSON.parse(fs.readFileSync(path.join(DESC_DIR, f), 'utf8'));
    if (Array.isArray(doc.co)) {
      map[f.replace(/\.json$/, '')] = doc.co.map(([, s]) => s);
      if (doc.co.length) tagged++;
    }
  }
  fs.writeFileSync('public/data/company-map.json', JSON.stringify(map));
  console.log('----------------------------------------');
  console.log(`problems with company data: ${Object.keys(map).length}, non-empty: ${tagged}`);
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
