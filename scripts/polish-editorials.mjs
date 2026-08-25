import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/solutions');
const VID_DIR = path.resolve('public/assets/sol-vid');
const UA = { 'User-Agent': 'Mozilla/5.0' };

fs.mkdirSync(VID_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'));

// ---------- pass 1: dead relative figures -> note ----------
let deadFixed = 0;
const DEAD_RE = /!\[[^\]]*\]\((\.\.?\/[^)"'\s]+\.(?:png|jpe?g|svg|gif|webp))\)/gi;

// ---------- pass 2: vimeo iframes -> local-thumb cards ----------
async function thumb(id) {
  const dest = path.join(VID_DIR, `${id}.jpg`);
  if (fs.existsSync(dest)) return `/assets/sol-vid/${id}.jpg`;
  for (const url of [`https://i.vimeocdn.com/video/${id}.jpg`, `https://vumbnail.com/${id}.jpg`]) {
    try {
      const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) });
      if (r.ok) {
        const b = Buffer.from(await r.arrayBuffer());
        if (b.length > 500) {
          fs.writeFileSync(dest, b);
          return `/assets/sol-vid/${id}.jpg`;
        }
      }
    } catch {
      /* try next */
    }
    await sleep(80);
  }
  return null;
}

let cards = 0;
let vids = 0;

for (const f of files) {
  const p = path.join(DIR, f);
  const doc = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!doc.c) continue;
  const slug = f.replace(/\.json$/, '');
  let changed = false;

  // dead figures
  doc.c = doc.c.replace(DEAD_RE, (m, rel) => {
    if (/^\/assets\//.test(rel)) return m;
    deadFixed++;
    changed = true;
    return `*(figure no longer available on LeetCode’s CDN)*`;
  });

  // vimeo iframes -> cards
  const iframeRe = /<iframe[^>]*src="https:\/\/player\.vimeo\.com\/video\/(\d+)[^"]*"[^>]*><\/iframe>/gi;
  const ids = [...doc.c.matchAll(iframeRe)].map((m) => m[1]);
  for (const id of new Set(ids)) {
    const t = await thumb(id);
    vids++;
    const card = `<a class="video-card" href="https://leetcode.com/problems/${slug}/solution/" target="_blank" rel="noreferrer">${
      t ? `<img src="${t}" alt="Video solution thumbnail" />` : ''
    }<span class="video-card-label">▶ Watch the video solution on LeetCode</span></a>`;
    doc.c = doc.c.replace(new RegExp(`<iframe[^>]*player\\.vimeo\\.com\\/video\\/${id}[^>]*><\\/iframe>`, 'gi'), card);
    changed = true;
    cards++;
  }

  if (changed) fs.writeFileSync(p, JSON.stringify(doc));
}

console.log('dead figures replaced with notes:', deadFixed);
console.log('video cards created:', cards, '| vimeo ids handled:', vids);
const sizeMB = (fs.readdirSync(VID_DIR).reduce((a, f) => a + fs.statSync(path.join(VID_DIR, f)).size, 0) / 1048576).toFixed(1);
console.log('thumbnails on disk:', fs.readdirSync(VID_DIR).length, `(${sizeMB} MB)`);
