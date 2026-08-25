import fs from 'node:fs';
import path from 'node:path';

const DIR = 'public/solutions';
const bad = [];
const vimeoIds = new Map(); // id -> slug (first occurrence)
let withVideo = 0;

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
  const slug = f.replace('.json', '');
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (!d.c) continue;

  // true unresolved relative refs
  const rel = d.c.match(/\]\((\.\.?\/[^)"'\s]+)\.(png|jpe?g|svg|gif|webp)/gi);
  if (rel) bad.push({ slug, refs: rel.slice(0, 3) });

  // collect vimeo ids
  const ids = [...d.c.matchAll(/player\.vimeo\.com\/(?:video\/)?(\d+)/g)].map((m) => m[1]);
  if (ids.length) {
    withVideo++;
    for (const id of ids) if (!vimeoIds.has(id)) vimeoIds.set(id, slug);
  }
}
console.log('files with true unresolved refs:', bad.length);
console.log(bad.slice(0, 10));
console.log('editorials with vimeo:', withVideo, '| unique vimeo ids:', vimeoIds.size);
fs.writeFileSync('scripts/vimeo-map.json', JSON.stringify([...vimeoIds.entries()], null, 1));
