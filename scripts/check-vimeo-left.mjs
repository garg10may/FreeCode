import fs from 'node:fs';
import path from 'node:path';

const DIR = 'public/solutions';
let n = 0;
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (!d.c || !d.c.includes('vimeo')) continue;
  const ctxs = [];
  let i = -1;
  while ((i = d.c.indexOf('vimeo', i + 1)) !== -1 && ctxs.length < 2) {
    ctxs.push(d.c.slice(Math.max(0, i - 120), i + 80));
  }
  console.log('---', f.replace('.json', ''));
  for (const c of ctxs) console.log(JSON.stringify(c));
  if (++n >= 6) break;
}
