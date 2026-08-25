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
    solution { title content canSeeDetail hasVideoSolution }
  }
}`;

const OUT_DIR = path.resolve('public/solutions');
const CONCURRENCY = Number(process.env.CONC || 6);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchSolution(slug) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ query: QUERY, variables: { titleSlug: slug } }),
        signal: AbortSignal.timeout(25000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      if (j.errors?.length) throw new Error(j.errors[0]?.message);
      const sol = j.data?.question?.solution;
      if (!sol) return { t: null, c: null, s: false, v: false };
      return {
        t: sol.title ?? null,
        c: sol.content ?? null,
        s: !!sol.canSeeDetail,
        v: !!sol.hasVideoSolution,
      };
    } catch (e) {
      if (attempt === 3) throw e;
      await sleep(700 * attempt);
    }
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const slugs = JSON.parse(fs.readFileSync('public/data/problems.json', 'utf8')).map((p) => p.slug);

  const todo = slugs.filter((slug) => {
    const f = path.join(OUT_DIR, `${slug}.json`);
    return !(fs.existsSync(f) && fs.statSync(f).size > 2);
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
      try {
        const doc = await fetchSolution(slug);
        fs.writeFileSync(path.join(OUT_DIR, `${slug}.json`), JSON.stringify(doc));
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
  console.log(`fetched : ${ok}, failed: ${failed.length}`);
  if (failed.length) {
    console.log(failed.slice(0, 20).join(', '));
    process.exitCode = 2;
  }
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
