import fs from 'node:fs';

// 1) problem 33 editorial images
const d33 = JSON.parse(fs.readFileSync('public/solutions/search-in-rotated-sorted-array.json', 'utf8'));
const local = [...new Set(d33.c.match(/\/assets\/sol-img\/[a-f0-9]+\.\w+/g) || [])];
console.log('#33 local image refs:', local.length);
for (const ref of local) {
  const p = 'public' + ref;
  console.log(' ', ref, fs.existsSync(p) ? `OK ${fs.statSync(p).size}B` : 'MISSING');
}
console.log('#33 external urls left:', (d33.c.match(/https?:\/\/[^"'\s\\)]+/g) || []).length);

// 2) 3493 Properties Graph
const probs = JSON.parse(fs.readFileSync('public/data/problems.json', 'utf8'));
const p3493 = probs.find((x) => x.id === '3493');
console.log('\n#3493 slug:', p3493?.slug);
if (p3493) {
  const sol = JSON.parse(fs.readFileSync(`public/solutions/${p3493.slug}.json`, 'utf8'));
  console.log('#3493 editorial content:', sol.c ? `${sol.c.length} chars (EXISTS)` : 'null — LeetCode has no official editorial for it');
}
