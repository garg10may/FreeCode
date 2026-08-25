import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const JOBS = [
  { dir: path.resolve('public/descriptions'), out: path.resolve('public/assets/img'), prefix: '/assets/img' },
  { dir: path.resolve('public/solutions'), out: path.resolve('public/assets/sol-img'), prefix: '/assets/sol-img' },
];
const CONCURRENCY = Number(process.env.CONC || 8);
const URL_RE = /https:\/\/[^"'\s\\)]+?\.(?:png|jpe?g|svg|gif|webp)/gi;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function localName(url) {
  const ext = (url.match(/\.(png|jpe?g|svg|gif|webp)$/i)?.[0] || '.bin').toLowerCase();
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 16);
  return `${hash}${ext}`;
}

async function download(url, dest) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://leetcode.com/' },
        signal: AbortSignal.timeout(20000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length === 0) throw new Error('empty body');
      fs.writeFileSync(dest, buf);
      return true;
    } catch (e) {
      if (attempt === 3) {
        console.error(`\n[fail] ${url}: ${e.message}`);
        return false;
      }
      await sleep(600 * attempt);
    }
  }
  return false;
}

async function processJob(job) {
  fs.mkdirSync(job.out, { recursive: true });
  const files = fs.readdirSync(job.dir).filter((f) => f.endsWith('.json'));
  const urls = new Set();
  const docs = [];
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(job.dir, f), 'utf8'));
    if (!doc.c) continue;
    docs.push({ f, doc });
    for (const u of doc.c.match(URL_RE) || []) urls.add(u);
  }

  const todo = [...urls].filter((u) => !fs.existsSync(path.join(job.out, localName(u))));
  console.log(`\n[${path.basename(job.dir)}] files: ${files.length}, unique urls: ${urls.size}, to download: ${todo.length}`);

  let cursor = 0;
  let ok = 0;
  const failed = [];
  async function worker() {
    while (cursor < todo.length) {
      const url = todo[cursor++];
      if (await download(url, path.join(job.out, localName(url)))) ok++;
      else failed.push(url);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`downloaded: ${ok}, failed: ${failed.length}`);

  let rewritten = 0;
  for (const { f, doc } of docs) {
    let changed = false;
    for (const url of urls) {
      if (!doc.c.includes(url)) continue;
      const name = localName(url);
      if (!fs.existsSync(path.join(job.out, name))) continue;
      doc.c = doc.c.split(url).join(`${job.prefix}/${name}`);
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(path.join(job.dir, f), JSON.stringify(doc));
      rewritten++;
    }
  }
  console.log(`files rewritten: ${rewritten}`);
  const sizeMB = (fs.readdirSync(job.out).reduce((a, f) => a + fs.statSync(path.join(job.out, f)).size, 0) / 1048576).toFixed(1);
  console.log(`on disk: ${fs.readdirSync(job.out).length} files, ${sizeMB} MB`);
}

async function main() {
  for (const job of JOBS) await processJob(job);
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
