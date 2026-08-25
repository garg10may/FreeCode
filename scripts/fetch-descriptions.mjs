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
const PREMIUM = process.argv.includes('--premium');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Optional premium credentials: env vars LC_SESSION + LC_CSRFTOKEN, or .lc-secrets.json */
function readSecrets() {
  try {
    const f = path.resolve('.lc-secrets.json');
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    /* ignore */
  }
  return {};
}
const secrets = readSecrets();
const SESSION = process.env.LC_SESSION || secrets.session || '';
const CSRF = process.env.LC_CSRFTOKEN || secrets.csrftoken || '';
const AUTH_HEADERS =
  SESSION && CSRF
    ? { Cookie: `LEETCODE_SESSION=${SESSION}; csrftoken=${CSRF}`, 'x-csrftoken': CSRF }
    : {};

async function fetchDoc(slug) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { ...HEADERS, ...AUTH_HEADERS },
        body: JSON.stringify({ query: QUERY, variables: { titleSlug: slug } }),
        signal: AbortSignal.timeout(20000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      if (j.errors?.length) throw new Error(j.errors[0]?.message || 'GraphQL error');
      const q = j.data?.question;
      if (!q) throw new Error('not found');
      const diff = String(q.difficulty || '').toLowerCase();
      return {
        q: q.questionFrontendId ?? '',
        t: q.title ?? '',
        d: diff === 'easy' ? 'Easy' : diff === 'hard' ? 'Hard' : 'Medium',
        p: !!q.isPaidOnly,
        c: q.content ?? null,
        h: Array.isArray(q.hints) ? q.hints : [],
        m: q.metaData ?? null,
        g: Array.isArray(q.topicTags) ? q.topicTags : [],
      };
    } catch (e) {
      if (attempt === 3) throw e;
      await sleep(700 * attempt);
    }
  }
  throw new Error('unreachable');
}

async function saveDoc(slug) {
  const doc = await fetchDoc(slug);
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.json`), JSON.stringify(doc));
  return doc;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let todo = [];

  if (PREMIUM) {
    // Re-fetch only problems whose statement is missing (the premium set).
    if (!SESSION || !CSRF) {
      console.error(
        [
          'Premium fetch requires a LeetCode PREMIUM account session.',
          '',
          'How to provide it:',
          '  1. Log in to leetcode.com with a premium account.',
          '  2. DevTools -> Application -> Cookies -> https://leetcode.com',
          '     copy the values of "LEETCODE_SESSION" and "csrftoken".',
          '  3a. Set env vars and run:',
          '       set LC_SESSION=<value> && set LC_CSRFTOKEN=<value>',
          '       npm run fetch:premium',
          '  3b. ...or put both into a ".lc-secrets.json" file in the project root:',
          '       { "session": "<LEETCODE_SESSION>", "csrftoken": "<csrftoken>" }',
          '',
          'Do NOT commit that file — it is gitignored.',
        ].join('\n')
      );
      process.exit(1);
    }

    // probe: credentials must actually unlock premium content
    console.log('[auth] verifying premium session...');
    const probeSlug = 'reverse-words-in-a-string-ii';
    try {
      const probe = await fetchDoc(probeSlug);
      if (!probe.c) {
        console.error(
          '[auth] FAILED: session did not unlock premium content. Is the account premium? Did LEETCODE_SESSION expire? Re-copy the cookies.'
        );
        process.exit(1);
      }
      fs.writeFileSync(path.join(OUT_DIR, `${probeSlug}.json`), JSON.stringify(probe));
      console.log('[auth] OK - premium content unlocked.');
    } catch (e) {
      console.error(`[auth] FAILED: ${e.message}`);
      process.exit(1);
    }

    const problems = JSON.parse(fs.readFileSync(path.resolve('public/data/problems.json'), 'utf8'));
    for (const p of problems) {
      const f = path.join(OUT_DIR, `${p.slug}.json`);
      if (!fs.existsSync(f)) continue;
      try {
        const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
        if (!doc.c) todo.push(p.slug);
      } catch {
        todo.push(p.slug);
      }
    }
    console.log(`premium statements to fetch: ${todo.length}`);
  } else {
    const problems = JSON.parse(fs.readFileSync(path.resolve('public/data/problems.json'), 'utf8'));
    todo = problems.map((p) => p.slug);
    if (!FORCE) {
      todo = todo.filter((slug) => {
        const f = path.join(OUT_DIR, `${slug}.json`);
        return !(fs.existsSync(f) && fs.statSync(f).size > 2);
      });
    }
    console.log(
      `problems: ${problems.length}, already fetched: ${problems.length - todo.length}, todo: ${todo.length}`
    );
  }

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
      try {
        await saveDoc(slug);
        ok++;
      } catch (e) {
        console.error(`\n[fail] ${slug}: ${e.message}`);
        failed.push(slug);
      }
      if ((ok + failed.length) % 50 === 0) {
        const pct = (((ok + failed.length) / todo.length) * 100).toFixed(1);
        const rate = ((ok + failed.length) / ((Date.now() - started) / 1000)).toFixed(1);
        process.stdout.write(`\r${ok + failed.length}/${todo.length} (${pct}%) ${rate}/s   `);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log('');

  if (failed.length) {
    console.log(`retrying ${failed.length} failures sequentially...`);
    const stillFailed = [];
    for (const slug of failed) {
      try {
        await saveDoc(slug);
        ok++;
      } catch {
        stillFailed.push(slug);
      }
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
