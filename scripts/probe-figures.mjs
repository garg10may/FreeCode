import fs from 'node:fs';

const UA = { 'User-Agent': 'Mozilla/5.0', Referer: 'https://leetcode.com/' };
const slug = 'search-in-rotated-sorted-array';

const candidates = [
  `https://leetcode.com/problems/${slug}/Figures/33/1.png`,
  `https://leetcode.com/problems/${slug}/solution/Figures/33/1.png`,
  `https://leetcode.com/Figures/33/1.png`,
  `https://assets.leetcode.com/uploads/Figures/33/1.png`,
];

for (const url of candidates) {
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) });
    const len = r.headers.get('content-length');
    console.log(r.status, len ?? '', url);
  } catch (e) {
    console.log('ERR', url, e.message);
  }
}
