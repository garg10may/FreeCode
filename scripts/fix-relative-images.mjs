import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/solutions');
const OUT = path.resolve('public/assets/sol-img');
const UA = { 'User-Agent': 'Mozilla/5.0', Referer: 'https://leetcode.com/' };

fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function alive(url) {
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) });
    if (!r.ok) return null;
    const b = Buffer.from(await r.arrayBuffer());
    return b.length > 50 ? b : null;
  } catch {
    return null;
  }
}

function localName(url) {
  const ext = (url.match(/\.(png|jpe?g|svg|gif|webp)$/i)?.[0] || '.png').toLowerCase();
  return crypto.createHash('sha1').update(url).digest('hex').slice(0, 16) + ext;
}

const MD_RE = /(\]\(|src=")(\.\.?\/[^)"'\s]+\.(?:png|jpe?g|svg|gif|webp))/gi;

const resolvedCache = new Map(); // abs url -> localPath | null
let totalNew = 0;
let filesChanged = 0;

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'));

for (let i = 0; i < files.length; i++) {
  const f = files[i];
  const p = path.join(DIR, f);
  const doc = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!doc.c) continue;

  MD_RE.lastIndex = 0;
  const rels = [...new Set([...doc.c.matchAll(MD_RE)].map((m) => m[2]))];
  if (!rels.length) continue;

  const slug = f.replace(/\.json$/, '');
  const base = `https://leetcode.com/problems/${slug}/`;
  let changed = false;

  for (const rel of rels) {
    const abs = new URL(rel, base).href;
    if (!resolvedCache.has(abs)) {
      const buf = await alive(abs);
      if (buf) {
        const name = localName(abs);
        const dest = path.join(OUT, name);
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
        resolvedCache.set(abs, `/assets/sol-img/${name}`);
      } else {
        resolvedCache.set(abs, null);
      }
      await sleep(80);
    }
    const localPath = resolvedCache.get(abs);
    if (localPath && doc.c.includes(rel)) {
      doc.c = doc.c.split(rel).join(localPath);
      changed = true;
      totalNew++;
    }
  }

  if (changed) {
    fs.writeFileSync(p, JSON.stringify(doc));
    filesChanged++;
  }
  if ((i + 1) % 250 === 0) process.stdout.write(`\rscanned ${i + 1}/${files.length}, resolved ${totalNew}   `);
}

console.log('');
console.log('relative images resolved & rewritten:', totalNew, '| files changed:', filesChanged);

let left = 0;
for (const f of files) {
  const doc = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (doc.c && /\]\(\.\.?\/[^)]*\.(png|jpe?g|svg|gif|webp)/i.test(doc.c)) left++;
}
console.log('files still containing relative image refs:', left);
