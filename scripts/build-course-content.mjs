// Compiles scripts/course-content/<itemId>.md -> public/data/course/<itemId>.json
// File format: first line "# Title", rest is the lesson markdown.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const SRC = path.join(dir, 'course-content');
const OUT_DIR = path.join(root, 'public', 'data', 'course');
const INDEX = path.join(root, 'public', 'data', 'crash-course.json');

const problems = JSON.parse(fs.readFileSync(path.join(root, 'public/data/problems.json'), 'utf8'));
const slugs = new Set(problems.map((p) => p.slug));
const linkRe = /\(#\/problems\/([a-z0-9-]+)\)/g;

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.md'));
let written = 0;
const broken = [];

for (const f of files) {
  const id = path.basename(f, '.md');
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
  const nl = raw.indexOf('\n');
  const head = raw.slice(0, nl).trim();
  if (!head.startsWith('# ')) throw new Error(`${f}: first line must be "# Title"`);
  const title = head.slice(2).trim();
  const body = raw.slice(nl + 1).trim();

  for (const m of body.matchAll(linkRe)) {
    if (!slugs.has(m[1])) broken.push(`${id} -> ${m[1]}`);
  }
  if (body.length < 4000) console.warn(`  note: ${id} is short (${body.length} chars)`);

  fs.writeFileSync(path.join(OUT_DIR, `${id}.json`), JSON.stringify({ t: title, c: body, src: 'orig' }));
  written++;
}

if (broken.length) {
  console.error('BROKEN PROBLEM LINKS:');
  for (const b of broken) console.error(' ', b);
  process.exit(1);
}

// patch index: flag every item that has a local lesson file
const idx = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
let flagged = 0;
for (const ch of idx.chapters) {
  for (const it of ch.items) {
    const fp = path.join(OUT_DIR, `${it.id}.json`);
    if (!fs.existsSync(fp)) continue;
    const doc = JSON.parse(fs.readFileSync(fp, 'utf8'));
    it.a = true;
    it.src = doc.src || 'orig';
    flagged++;
  }
}
fs.writeFileSync(INDEX, JSON.stringify(idx));

const sizes = files
  .map((f) => {
    const id = path.basename(f, '.md');
    const d = JSON.parse(fs.readFileSync(path.join(OUT_DIR, `${id}.json`), 'utf8'));
    return [id, d.c.length];
  })
  .sort((a, b) => a[1] - b[1]);

console.log(`lessons written: ${written}, index items with content: ${flagged}`);
console.log(`smallest: ${sizes.slice(0, 5).map(([i, l]) => `${i}=${l}`).join('  ')}`);
console.log(`largest:  ${sizes.slice(-3).map(([i, l]) => `${i}=${l}`).join('  ')}`);
