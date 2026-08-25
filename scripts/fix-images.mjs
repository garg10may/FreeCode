import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DESC = path.resolve('public/descriptions');
const IMG = path.resolve('public/assets/img');
const UA = { 'User-Agent': 'Mozilla/5.0', Referer: 'https://leetcode.com/' };

const localName = (url, ext) =>
  crypto.createHash('sha1').update(url).digest('hex').slice(0, 16) + ext;

async function tryFetch(url) {
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(25000) });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length === 0) return null;
    return buf;
  } catch {
    return null;
  }
}

// slug -> { bad, candidates: [urls], fallbackExt? , fallbackLocal? }
const JOBS = [
  {
    slug: 'flatten-a-multilevel-doubly-linked-list',
    bad: 'https://assets.leetcode.com/uploads/2021/11/09/flatten2.1jpg',
    candidates: [
      'https://assets.leetcode.com/uploads/2021/11/09/flatten2.1.jpg',
      'https://assets.leetcode.com/uploads/2021/11/09/flatten2.jpg',
      'https://assets.leetcode.com/uploads/2021/11/09/flatten2.png',
    ],
  },
  {
    slug: 'manhattan-distances-of-all-arrangements-of-pieces',
    bad: 'https://assets.leetcode.com/uploads/2024/12/25/4040example1.drawio',
    candidates: [
      'https://assets.leetcode.com/uploads/2024/12/25/4040example1.drawio.png',
      'https://assets.leetcode.com/uploads/2024/12/25/4040example1.png',
    ],
    fallbackLocal: '/assets/img/eac375b0cf8eb3c6.png',
  },
  {
    slug: 'maximum-number-of-visible-points',
    bad: 'https://assets.leetcode.com/uploads/2020/09/30/angle.mp4',
    candidates: ['https://assets.leetcode.com/uploads/2020/09/30/angle.mp4'],
  },
  {
    slug: 'most-frequent-prime',
    bad: 'https://assets.leetcode.com/uploads/2024/02/15/south',
    candidates: [
      'https://assets.leetcode.com/uploads/2024/02/15/south.png',
      'https://assets.leetcode.com/uploads/2024/02/15/south.jpg',
      'https://assets.leetcode.com/uploads/2024/02/15/south.webp',
      'https://assets.leetcode.com/uploads/2024/02/15/south.jpeg',
    ],
  },
];

const WIKI = [
  {
    badFull: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Sudoku-by-L2G-20050714.svg/250px-Sudoku-by-L2G-20050714.svg.png',
    local: '/assets/img/d2d4b4848f624cde.png',
  },
  {
    badFull: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Sudoku-by-L2G-20050714_solution.svg/250px-Sudoku-by-L2G-20050714_solution.svg.png',
    local: '/assets/img/32276e56eec381c4.png',
  },
];

function patch(slug, replacements) {
  const f = path.join(DESC, `${slug}.json`);
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  let changed = false;
  for (const [from, to] of replacements) {
    if (doc.c && doc.c.includes(from)) {
      doc.c = doc.c.split(from).join(to);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(f, JSON.stringify(doc));
  return changed;
}

let unresolved = [];

for (const job of JOBS) {
  let done = false;
  const extOf = (u) => (u.match(/\.(png|jpe?g|svg|gif|webp|mp4)$/i)?.[0] || '.png').toLowerCase();
  for (const cand of job.candidates) {
    const buf = await tryFetch(cand);
    if (!buf) continue;
    const name = localName(job.bad, extOf(cand));
    fs.writeFileSync(path.join(IMG, name), buf);
    patch(job.slug, [[job.bad, `/assets/img/${name}`]]);
    console.log(`OK   ${job.slug} <- ${cand} (${buf.length} bytes)`);
    done = true;
    break;
  }
  if (!done && job.fallbackLocal) {
    patch(job.slug, [[job.bad, job.fallbackLocal]]);
    console.log(`FALLBACK ${job.slug} -> ${job.fallbackLocal}`);
    done = true;
  }
  if (!done) {
    unresolved.push(job.slug);
    console.log(`MISS ${job.slug}`);
  }
}

for (const w of WIKI) {
  for (const slug of ['sudoku-solver', 'valid-sudoku']) {
    patch(slug, [[w.badFull, w.local]]);
  }
}
console.log('wikimedia urls rewritten in sudoku files');

// final external-resource sweep
const RE = /(?:src|srcset|poster)\s*=\s*"(https?:\/\/[^"]+)"/gi;
const leftovers = [];
for (const f of fs.readdirSync(DESC).filter((x) => x.endsWith('.json'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(DESC, f), 'utf8'));
  if (!doc.c) continue;
  for (const m of doc.c.matchAll(RE)) {
    if (!m[1].startsWith('/')) leftovers.push({ slug: f.replace('.json', ''), url: m[1] });
  }
}
console.log('remaining external resource refs:', leftovers.length);
if (leftovers.length) console.log(leftovers);
if (unresolved.length) process.exitCode = 2;
