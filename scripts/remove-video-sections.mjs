import fs from 'node:fs';
import path from 'node:path';

// Removes dead video sections:
// - public/solutions/*.json : "## Video Solution" heading + thumbnail card linking to LeetCode
// - public/data/course/4501|4502.json : embedded player.vimeo.com iframes

let filesChanged = 0;
let blocksRemoved = 0;

const rewrite = (file, transform) => {
  const raw = fs.readFileSync(file, 'utf8');
  const doc = JSON.parse(raw);
  const before = doc.c ?? '';
  const { out, hits } = transform(before);
  if (!hits) return;
  doc.c = out.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(file, JSON.stringify(doc));
  filesChanged++;
  blocksRemoved += hits;
};

// solutions: heading + blank line + optional --- rule + optional nbsp spacer + video-card block + optional trailing spacer
const solRe =
  /[ \t]*#{1,6}[ \t]*Video Solution[^\n]*\n(?:[ \t]*\n)?(?:[ \t]*-{2,}[^\n]*\n)?\s*(?:<div>&nbsp;\s*<\/div>\s*)?\s*[ \t]*<div>\s*<div class="video-container">\s*<a class="video-card"[\s\S]*?<\/a>\s*<\/div>\s*<\/div>(?:\s*<div>&nbsp;\s*<\/div>)?\s*/g;

for (const f of fs.readdirSync('public/solutions').filter((x) => x.endsWith('.json'))) {
  rewrite(path.join('public/solutions', f), (c) => {
    let hits = 0;
    let out = c.replace(solRe, () => ((hits += 1), ''));
    // inline cards mid-article, with or without outer <div> wrapper
    out = out.replace(
      /[ \t]*(?:<div>[ \t]*\n)?[ \t]*<div class="video-container">[ \t]*\n?[ \t]*<a class="video-card"[\s\S]*?<\/a>[ \t]*\n?[ \t]*<\/div>(?:[ \t]*\n?[ \t]*<\/div>)?(?:[ \t]*\n[ \t]*-{2,}[ \t]*\n)?/g,
      () => ((hits += 1), ''),
    );
    return { out, hits };
  });
}

// course chapters: vimeo iframe wrapped in video-container div (+ adjacent <br>)
const courseRe =
  /[ \t]*<div>\s*<div class="video-container"[^>]*>\s*<iframe[^>]*player\.vimeo\.com[^>]*>\s*<\/iframe>\s*<\/div>\s*<\/div>\s*(?:<br>\s*)?/g;

for (const f of ['4501.json', '4502.json']) {
  const p = path.join('public/data/course', f);
  if (!fs.existsSync(p)) continue;
  rewrite(p, (c) => {
    let hits = 0;
    const out = c.replace(courseRe, () => ((hits += 1), ''));
    return { out, hits };
  });
}

console.log(`files changed: ${filesChanged}, video blocks removed: ${blocksRemoved}`);
