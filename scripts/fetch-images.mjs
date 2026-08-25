import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DESC_DIR = path.resolve('public/descriptions');
const IMG_DIR = path.resolve('public/assets/img');
const CONCURRENCY = Number(process.env.CONC || 8);
const URL_RE = /https:\/\/[^"'\s\\]+?\.(?:png|jpe?g|svg|gif|webp)/gi;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function collect() {
  const files = fs.readdirSync(DESC_DIR).filter((f) => f.endsWith('.json'));
  const urls = new Map(); // url -> Set(slug)
  const docs = new Map();
  for (const f of files) {
    const p = path.join(DESC_DIR, f);
    const raw = fs.readFileSync(p, 'utf8');
    const doc = JSON.parse(raw);
    docs.set(f, { raw, doc });
    if (!doc.c) continue;
    for (const u of doc.c.match(URL_RE) || []) {
      if (!urls.has(u)) urls.set(u, new Set());
      urls.get(u).add(f);
    }
  }
  return { urls, docs };
}

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

async function main() {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const { urls, docs } = collect();
  console.log(`problems scanned : ${docs.size}`);
  console.log(`image refs       : ${[...urls.values()].reduce((a, s) => a + s.size, 0)}`);
  console.log(`unique urls      : ${urls.size}`);

  // skip already-downloaded
  const todo = [...urls.keys()].filter((u) => !fs.existsSync(path.join(IMG_DIR, localName(u))));
  console.log(`to download      : ${todo.length}`);

  let cursor = 0;
  let ok = 0;
  const failed = [];
  async function worker() {
    while (cursor < todo.length) {
      const url = todo[cursor++];
      const dest = path.join(IMG_DIR, localName(url));
      if (await download(url, dest)) ok++;
      else failed.push(url);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`downloaded       : ${ok}, failed: ${failed.length}`);

  // rewrite descriptions for successfully downloaded images only
  let rewritten = 0;
  for (const [f, { doc }] of docs) {
    if (!doc.c) continue;
    let changed = false;
    for (const [url] of urls) {
      if (!doc.c.includes(url)) continue;
      const name = localName(url);
      if (!fs.existsSync(path.join(IMG_DIR, name))) continue;
      doc.c = doc.c.split(url).join(`/assets/img/${name}`);
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(path.join(DESC_DIR, f), JSON.stringify(doc));
      rewritten++;
    }
  }
  console.log(`files rewritten  : ${rewritten}`);
  const sizeMB = (fs.readdirSync(IMG_DIR).reduce((a, f) => a + fs.statSync(path.join(IMG_DIR, f)).size, 0) / 1048576).toFixed(1);
  console.log(`images on disk   : ${fs.readdirSync(IMG_DIR).length} files, ${sizeMB} MB`);
  if (failed.length) process.exitCode = 2;
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
