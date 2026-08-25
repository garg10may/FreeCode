import fs from 'node:fs';

const dir = './public/descriptions';
let hrefExt = 0;
let cssUrl = 0;
let iframe = 0;
for (const f of fs.readdirSync(dir)) {
  const d = JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8'));
  if (!d.c) continue;
  for (const m of d.c.matchAll(/href\s*=\s*"(https?:\/\/[^"]+)"/g)) hrefExt++;
  if (/url\(\s*['"]?https?:\/\//i.test(d.c)) cssUrl++;
  if (/<iframe/i.test(d.c)) iframe++;
}
console.log('<a href> external links (nav only, harmless):', hrefExt);
console.log('CSS url() external:', cssUrl, '| iframes:', iframe);
