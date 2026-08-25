import fs from 'node:fs';

const slug = 'search-in-rotated-sorted-array';
const d = JSON.parse(fs.readFileSync(`public/solutions/${slug}.json`, 'utf8'));
const c = d.c || '';

console.log('content length:', c.length);
const ext = c.match(/https:\/\/[^"'\s\\)]+/g) || [];
console.log('external urls remaining:', ext.length, [...new Set(ext)].slice(0, 10));
const local = c.match(/\/assets\/sol-img\/[a-f0-9]+\.\w+/g) || [];
console.log('local image refs:', local.length, [...new Set(local)]);
const mdImg = c.match(/!\[[^\]]*\]\([^)]*\)/g) || [];
console.log('markdown images:', mdImg.length, mdImg.slice(0, 6));

// check local files exist
for (const ref of [...new Set(local)]) {
  const p = 'public' + ref;
  console.log(ref, fs.existsSync(p) ? 'EXISTS ' + fs.statSync(p).size + 'B' : 'MISSING');
}
