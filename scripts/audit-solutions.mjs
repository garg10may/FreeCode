import fs from 'node:fs';

const dir = 'public/solutions';
let withSol = 0;
let vimeo = 0;
let mp4 = 0;
const mp4List = [];
for (const f of fs.readdirSync(dir)) {
  const d = JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8'));
  if (d.c) {
    withSol++;
    if (d.c.includes('player.vimeo.com')) vimeo++;
    const m = d.c.match(/https:\/\/[^"'\s\\)]+\.mp4/g);
    if (m) {
      mp4++;
      if (mp4List.length < 5) mp4List.push(f);
    }
  }
}
console.log('editorials with content:', withSol, '/ 4033');
console.log('vimeo-embedded:', vimeo, '| mp4-hosted:', mp4, mp4List.slice(0, 5));
