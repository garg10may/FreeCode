import fs from 'node:fs';

const probs = JSON.parse(fs.readFileSync('./public/data/problems.json', 'utf8'));
let withMeta = 0;
const noMeta = [];
let imgCount = 0;
const imgProblems = new Set();
const urlRe = /https:\/\/[^"'\s\\]+?\.(?:png|jpg|jpeg|svg|gif)/g;

for (const p of probs) {
  const d = JSON.parse(fs.readFileSync(`./public/descriptions/${p.slug}.json`, 'utf8'));
  if (p.paidOnly) {
    if (d.m) withMeta++;
    else noMeta.push(p.slug);
  }
  if (d.c) {
    const m = d.c.match(urlRe) || [];
    if (m.length) {
      imgCount += m.length;
      imgProblems.add(p.slug);
    }
  }
}

console.log('premium with metaData:', withMeta, '| without:', noMeta.length, noMeta.slice(0, 10));
console.log('problems containing images:', imgProblems.size, '| total image refs:', imgCount);

// unique urls
const urls = new Set();
for (const p of probs) {
  const d = JSON.parse(fs.readFileSync(`./public/descriptions/${p.slug}.json`, 'utf8'));
  if (!d.c) continue;
  for (const u of d.c.match(urlRe) || []) urls.add(u);
}
console.log('unique image urls:', urls.size);
fs.writeFileSync('./scripts/img-urls.json', JSON.stringify([...urls], null, 1));
