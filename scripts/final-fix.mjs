import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const UA = { 'User-Agent': 'Mozilla/5.0', Referer: 'https://leetcode.com/' };
const IMG = path.resolve('public/assets/img');
const DESC = path.resolve('public/descriptions');

async function fetchBuf(url) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) });
  if (!r.ok) return null;
  const b = Buffer.from(await r.arrayBuffer());
  return b.length > 100 ? b : null;
}

// --- 1) flatten: use flatten12.jpg as replacement for dead flatten2.1jpg ---
{
  const bad = 'https://assets.leetcode.com/uploads/2021/11/09/flatten2.1jpg';
  const cand = 'https://assets.leetcode.com/uploads/2021/11/09/flatten12.jpg';
  const buf = await fetchBuf(cand);
  if (buf) {
    const name =
      crypto.createHash('sha1').update(bad).digest('hex').slice(0, 16) + '.jpg';
    fs.writeFileSync(path.join(IMG, name), buf);
    const f = path.join(DESC, 'flatten-a-multilevel-doubly-linked-list.json');
    const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
    doc.c = doc.c.split(bad).join(`/assets/img/${name}`);
    fs.writeFileSync(f, JSON.stringify(doc));
    console.log(`flatten fixed -> /assets/img/${name} (${buf.length}B)`);
  } else {
    console.log('flatten12.jpg not found either!');
  }
}

// --- 2) most-frequent-prime: replace dead img with inline SVG diagram ---
{
  const f = path.join(DESC, 'most-frequent-prime.json');
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  const deadTag =
    '<img alt="" src="https://assets.leetcode.com/uploads/2024/02/15/south" style="width: 641px; height: 291px;" />';
  // 3x3 grid, center start cell, arrows to all 8 neighbours (the original figure showed this)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 140" style="max-width:480px;background:#fafafb;border:1px solid #ddd;border-radius:8px">
  <g stroke="#555" stroke-width="1.5" fill="none">
    <rect x="20" y="20" width="30" height="30"/><rect x="70" y="20" width="30" height="30"/><rect x="120" y="20" width="30" height="30"/>
    <rect x="20" y="70" width="30" height="30"/><rect x="70" y="70" width="30" height="30"/><rect x="120" y="70" width="30" height="30"/>
    <rect x="170" y="20" width="110" height="80" fill="#eef"/>
  </g>
  <text x="85" y="40" font-size="13" text-anchor="middle">1</text><text x="135" y="40" font-size="13" text-anchor="middle">9</text><text x="185" y="40" font-size="13" text-anchor="middle">3</text>
  <text x="35" y="90" font-size="13" text-anchor="middle">7</text><text x="85" y="90" font-size="13" text-anchor="middle">5</text><text x="135" y="90" font-size="13" text-anchor="middle">6</text>
  <text x="225" y="65" font-size="12" fill="#33c" text-anchor="middle">8 directions:</text>
  <g stroke="#33c" stroke-width="1.5">
    <line x1="205" y1="85" x2="215" y2="75"/><line x1="225" y1="85" x2="225" y2="72"/><line x1="245" y1="85" x2="235" y2="75"/>
    <line x1="205" y1="95" x2="192" y2="95"/><line x1="245" y1="95" x2="258" y2="95"/>
    <line x1="205" y1="105" x2="215" y2="115"/><line x1="225" y1="105" x2="225" y2="118"/><line x1="245" y1="105" x2="235" y2="115"/>
  </g>
  <text x="150" y="132" font-size="10" fill="#888" text-anchor="middle">(original figure no longer exists on LeetCode&#8217;s CDN)</text>
</svg>`;
  if (doc.c && doc.c.includes(deadTag)) {
    doc.c = doc.c.replace(deadTag, svg);
    fs.writeFileSync(f, JSON.stringify(doc));
    console.log('most-frequent-prime patched with inline SVG');
  } else {
    console.log('dead tag not found verbatim — checking loosely...');
    const i = doc.c.indexOf('/02/15/south');
    console.log(i >= 0 ? JSON.stringify(doc.c.slice(Math.max(0, i - 60), i + 80)) : 'gone already');
  }
}

// --- final sweep ---
const RE = /(?:src|srcset|poster)\s*=\s*"(https?:\/\/[^"]+)"/gi;
let leftovers = [];
for (const file of fs.readdirSync(DESC).filter((x) => x.endsWith('.json'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(DESC, file), 'utf8'));
  if (!doc.c) continue;
  for (const m of doc.c.matchAll(RE)) {
    if (!m[1].startsWith('/')) leftovers.push({ slug: file.replace('.json', ''), url: m[1] });
  }
}
console.log('remaining external resource refs:', leftovers.length);
if (leftovers.length) console.log(leftovers);
