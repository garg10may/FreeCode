import fs from 'node:fs';
import path from 'node:path';

const UA = { 'User-Agent': 'Mozilla/5.0', Referer: 'https://leetcode.com/' };
const IMG = path.resolve('public/assets/img');
const DESC = path.resolve('public/descriptions');

async function alive(url) {
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) });
    if (!r.ok) return null;
    const b = Buffer.from(await r.arrayBuffer());
    return b.length > 100 ? b : null;
  } catch {
    return null;
  }
}

const EXTS = ['', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const BASES = ['https://assets.leetcode.com', 'https://assets.leetcode-cn.com'];

// [slug, badUrlInHtml, pathAfterUploads]
const JOBS = [
  ['flatten-a-multilevel-doubly-linked-list', 'https://assets.leetcode.com/uploads/2021/11/09/flatten2.1jpg', '/2021/11/09/flatten2.1'],
  ['most-frequent-prime', 'https://assets.leetcode.com/uploads/2024/02/15/south', '/2024/02/15/south'],
];

for (const [slug, bad, p] of JOBS) {
  let found = null;
  outer: for (const base of BASES) {
    for (const ext of EXTS) {
      if (!ext && !p.endsWith('jpg')) continue; // only test bare path for the typo case
      const url = base + '/uploads' + p + ext;
      process.stdout.write(`probe ${url} ... `);
      const buf = await alive(url);
      console.log(buf ? `OK ${buf.length}B` : 'x');
      if (buf) {
        found = { url, buf };
        break outer;
      }
    }
  }

  if (found) {
    const ext = (found.url.match(/\.(png|jpe?g|gif|webp|svg)$/i)?.[0] || '.png').toLowerCase();
    const name = crypto.createHash('sha1').update(bad).digest('hex').slice(0, 16) + ext;
    fs.writeFileSync(path.join(IMG, name), found.buf);
    const f = path.join(DESC, `${slug}.json`);
    const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
    doc.c = doc.c.split(bad).join(`/assets/img/${name}`);
    fs.writeFileSync(f, JSON.stringify(doc));
    console.log(`FIXED ${slug} -> /assets/img/${name}`);
  } else {
    console.log(`STILL MISSING ${slug}`);
  }
}
