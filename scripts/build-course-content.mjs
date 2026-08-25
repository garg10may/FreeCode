import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'course-content');
const root = path.resolve(dir, '..', '..');
const OUT_DIR = path.join(root, 'public', 'data', 'course');
const INDEX = path.join(root, 'public', 'data', 'crash-course.json');

const modules = [
  'ch715.mjs',
  'ch703.mjs',
  'ch705.mjs',
  'ch704.mjs',
  'ch706.mjs',
  'ch707a.mjs',
  'ch707b.mjs',
  'ch708.mjs',
  'ch709.mjs',
  'ch710.mjs',
  'ch711.mjs',
  'ch712.mjs',
  'ch713.mjs',
  'ch714.mjs',
];

// ---- sanity checks before writing --------------------------------------
const problems = JSON.parse(fs.readFileSync(path.join(root, 'public/data/problems.json'), 'utf8'));
const slugs = new Set(problems.map((p) => p.slug));
const linkRe = /\(#\/problems\/([a-z0-9-]+)\)/g;

let written = 0;
let brokenLinks = [];
let idCounts = {};

for (const mod of modules) {
  const lessons = (await import(pathToFileURL(path.join(dir, mod)).href)).default;
  for (const [id, lesson] of Object.entries(lessons)) {
    if (!lesson.t || !lesson.c) throw new Error(`${mod}: ${id} missing t or c`);
    // verify every internal problem link points at a real local problem
    for (const m of lesson.c.matchAll(linkRe)) {
      if (!slugs.has(m[1])) brokenLinks.push(`${id} -> ${m[1]}`);
    }
    fs.writeFileSync(
      path.join(OUT_DIR, `${id}.json`),
      JSON.stringify({ t: lesson.t, c: lesson.c.trim(), src: 'orig' })
    );
    written++;
    idCounts[id] = mod;
  }
}

if (brokenLinks.length) {
  console.error('BROKEN PROBLEM LINKS:');
  for (const b of brokenLinks) console.error(' ', b);
  process.exit(1);
}

// ---- patch index --------------------------------------------------------
const idx = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
let flagged = 0;
for (const ch of idx.chapters) {
  for (const it of ch.items) {
    const f = path.join(OUT_DIR, `${it.id}.json`);
    if (!fs.existsSync(f)) continue;
    const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
    it.a = true;
    it.src = doc.src || 'orig';
    flagged++;
  }
}
fs.writeFileSync(INDEX, JSON.stringify(idx));

console.log(`authored lessons written : ${written}`);
console.log(`index items with content : ${flagged}`);
const total = idx.chapters.reduce((a, ch) => a + ch.items.length, 0);
const withContent = idx.chapters.reduce((a, ch) => a + ch.items.filter((i) => i.a).length, 0);
console.log(`course coverage          : ${withContent}/${total} items have lesson content`);
