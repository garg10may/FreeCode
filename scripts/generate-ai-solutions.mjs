#!/usr/bin/env node
/**
 * Generates "AI Explains" editorials for problems that have no official editorial.
 *
 * Usage:
 *   node scripts/generate-ai-solutions.mjs --slug two-sum
 *   node scripts/generate-ai-solutions.mjs --limit 5 --conc 2
 *   node scripts/generate-ai-solutions.mjs --shard 0/6 --conc 4
 *   node scripts/generate-ai-solutions.mjs --force --slug two-sum
 *   node scripts/generate-ai-solutions.mjs --audit
 *
 * Output: public/ai-solutions/<slug>.json  (schema v1, consumed by src/components/AiSolution.tsx)
 * Resume-safe: existing valid outputs are skipped unless --force.
 * Model: stealth/ox-alpha (OpenRouter) — the only model this script may call.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROBLEMS_FILE = path.join(ROOT, 'public', 'data', 'problems.json');
const SOLUTIONS_DIR = path.join(ROOT, 'public', 'solutions');
const DESCRIPTIONS_DIR = path.join(ROOT, 'public', 'descriptions');
const OUT_DIR = path.join(ROOT, 'public', 'ai-solutions');

const MODEL = 'stealth/ox-alpha';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_TOKENS = 12000;
const MAX_TOKENS_RETRY = 20000;
const MAX_API_RETRIES = 5;
const MAX_JSON_RETRIES = 3;
const REQ_TIMEOUT_MS = 300000;

const args = process.argv.slice(2);
function arg(name, def = null) {
  const i = args.indexOf(name);
  if (i === -1) return def;
  const v = args[i + 1];
  return v && !v.startsWith('--') ? v : true;
}

const ONLY_SLUG = arg('--slug');
const LIMIT = Number(arg('--limit', 0)) || 0;
const CONC = Math.max(1, Number(arg('--conc', 4)));
const FORCE = args.includes('--force');
const DRY = args.includes('--dry');
const AUDIT = args.includes('--audit');
const SHARD = arg('--shard');
let shardIdx = -1;
let shardTotal = 1;
if (typeof SHARD === 'string' && SHARD.includes('/')) {
  const [a, b] = SHARD.split('/').map(Number);
  if (Number.isFinite(a) && Number.isFinite(b) && b > 0 && a >= 0 && a < b) {
    shardIdx = a;
    shardTotal = b;
  }
}

const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);

function loadKey() {
  if (!existsSync(path.join(ROOT, '.lc-secrets.json'))) {
    throw new Error('.lc-secrets.json not found — add {"openrouter_key": "..."} to it');
  }
}

async function main() {
  if (AUDIT) return audit();
  loadKey();
  const secrets = JSON.parse(await readFile(path.join(ROOT, '.lc-secrets.json'), 'utf8'));
  const KEY = secrets.openrouter_key;
  if (!KEY) throw new Error('openrouter_key missing from .lc-secrets.json');

  await mkdir(OUT_DIR, { recursive: true });

  const problems = JSON.parse(await readFile(PROBLEMS_FILE, 'utf8'));
  log(`index: ${problems.length} problems`);

  const targets = [];
  let haveOfficial = 0;
  let noStatement = 0;
  for (const p of problems) {
    if (ONLY_SLUG && p.slug !== ONLY_SLUG) continue;
    const solPath = path.join(SOLUTIONS_DIR, `${p.slug}.json`);
    if (existsSync(solPath)) {
      try {
        const doc = JSON.parse(await readFile(solPath, 'utf8'));
        if (doc.c) {
          haveOfficial++;
          continue;
        }
      } catch {
        /* treat as missing */
      }
    }
    const descPath = path.join(DESCRIPTIONS_DIR, `${p.slug}.json`);
    if (!existsSync(descPath)) {
      noStatement++;
      continue;
    }
    let desc;
    try {
      desc = JSON.parse(await readFile(descPath, 'utf8'));
    } catch {
      noStatement++;
      continue;
    }
    if (!desc.c || !desc.c.trim()) {
      noStatement++;
      continue;
    }
    const outPath = path.join(OUT_DIR, `${p.slug}.json`);
    if (!FORCE && existsSync(outPath)) {
      try {
        const existing = JSON.parse(await readFile(outPath, 'utf8'));
        if (validate(existing).length === 0) continue;
      } catch {
        /* regenerate invalid file */
      }
    }
    targets.push({ meta: p, desc });
  }

  let work = targets;
  if (shardIdx >= 0) {
    work = work.filter((_, i) => i % shardTotal === shardIdx);
  }
  if (LIMIT > 0) work = work.slice(0, LIMIT);

  log(
    `targets: ${targets.length} without official editorial` +
      (shardIdx >= 0 ? ` | shard ${shardIdx}/${shardTotal} -> ${work.length} items` : '') +
      (LIMIT ? ` | limited to ${work.length}` : '')
  );
  log(`skipped: ${haveOfficial} with official editorial, ${noStatement} without a readable statement`);
  if (work.length === 0) {
    log('nothing to do');
    return;
  }

  let done = 0;
  let ok = 0;
  let warn = 0;
  let fail = 0;
  const failures = [];
  const t0 = Date.now();

  async function lane() {
    while (done < work.length) {
      const item = work[done++];
      const label = `${done}/${work.length}`;
      try {
        const res = await generateOne(KEY, item);
        if (res === 'ok') ok++;
        else warn++;
        log(`[${label}] ${item.meta.slug} ${res}`);
      } catch (e) {
        fail++;
        failures.push(`${item.meta.slug}: ${e.message}`);
        log(`[${label}] ${item.meta.slug} FAIL ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONC, work.length) }, lane));

  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  log(`done in ${mins}m — ok:${ok} warn:${warn} fail:${fail}`);
  if (failures.length) {
    log('failures:');
    for (const f of failures) log('  -', f);
    process.exitCode = 1;
  }
}

function buildMessages(item, feedback) {
  const { meta, desc } = item;
  const statement = htmlToText(desc.c);
  const tags = (desc.g ?? []).map((t) => t.name).join(', ');
  const user = [
    `LeetCode problem #${desc.q || meta.id}: ${desc.t || meta.title} (difficulty: ${desc.d || meta.difficulty})`,
    tags ? `Topic tags: ${tags}` : '',
    '',
    'Problem statement:',
    '',
    statement,
    '',
    `Write a complete editorial for this problem. Respond with STRICT JSON only — no markdown fences, no text before or after the JSON object. The JSON must match this schema exactly:`,
    '',
    `{
  "t": "editorial title (string)",
  "o": "markdown: 'Understanding the problem' section — restate the problem in plain words, walk through the provided examples step by step, and explain what the constraints imply about the needed approach",
  "k": ["2-4 key insights, each a short standalone takeaway (1-2 sentences)"],
  "a": [
    {
      "n": "Approach 1: <name>",
      "i": "markdown: the intuition — the core idea and why it works for this problem",
      "s": ["algorithm step 1", "step 2"],
      "c": {
        "python": "complete Python 3 solution in LeetCode 'class Solution' style",
        "cpp": "complete C++ solution in LeetCode 'class Solution' style",
        "java": "complete Java solution in LeetCode 'class Solution' style",
        "javascript": "complete JavaScript solution in LeetCode 'var x = function(...)' style"
      },
      "t": "time complexity with brief justification, e.g. 'O(n log n) — sorting dominates'",
      "sp": "space complexity with brief justification"
    }
  ],
  "w": "markdown: wrap-up — which approach to pick in an interview and when, common pitfalls and edge cases, likely follow-up questions"
}`,
    '',
    'Requirements:',
    '- Provide 2-3 approaches ordered from the most intuitive (e.g. brute force) to the optimal one. If no meaningfully distinct second approach exists, 1 approach is acceptable.',
    '- EVERY approach must include all four languages: python, cpp, java, javascript.',
    '- Code must be complete, correct and use the exact LeetCode submission format for each language.',
    '- Be CONCISE: intuition and overview sections 3-6 sentences each, at most 5 algorithm steps, no comments in code unless truly necessary. Total output should stay under 6000 tokens.',
    '- Inside JSON strings escape newlines as \\n and double quotes as \\\" — all code lives in single JSON strings. Never emit raw newlines inside a JSON string.',
    '- Use inline math like $O(n)$ only where it genuinely helps; otherwise write plain text.',
    '- Do not repeat the full problem statement in the output.',
    feedback ? `\nIMPORTANT: Your previous response could not be used (${feedback}). Return the corrected, complete JSON object now.` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return [
    {
      role: 'system',
      content:
        'You are an expert competitive-programming tutor and editorial writer. You always respond with a single valid JSON object and nothing else.',
    },
    { role: 'user', content: user },
  ];
}

async function generateOne(KEY, item) {
  let feedback = null;
  let effort = 'medium';
  let messages = buildMessages(item, null);
  let maxTokens = MAX_TOKENS;

  for (let attempt = 1; attempt <= MAX_JSON_RETRIES + 2; attempt++) {
    let text;
    try {
      text = await callWithRetries(KEY, messages, maxTokens, effort);
    } catch (e) {
      if (e.code === 'empty_or_truncated' && effort !== 'low') {
        effort = 'low';
        log(`  ${item.meta.slug}: falling back to reasoning effort=low`);
        continue;
      }
      if (attempt >= MAX_JSON_RETRIES + 2) throw e;
      log(`  retry (attempt ${attempt}): ${e.message}`);
      continue;
    }

    let doc;
    try {
      doc = extractJson(text);
    } catch (e) {
      if (attempt >= MAX_JSON_RETRIES + 2) throw new Error(`unparseable JSON: ${e.message}`);
      feedback = `invalid JSON (${e.message})`;
      messages = buildMessages(item, feedback);
      continue;
    }

    const errs = validate(doc);
    if (errs.length) {
      if (attempt >= MAX_JSON_RETRIES + 2) {
        log(`  ${item.meta.slug}: accepting with warnings: ${errs.join('; ')}`);
        await save(item.meta.slug, doc);
        return `warn (${errs.length} issues)`;
      }
      feedback = errs.join('; ');
      messages = buildMessages(item, feedback);
      continue;
    }

    await save(item.meta.slug, doc);
    return 'ok';
  }
  throw new Error('unreachable');
}

async function callWithRetries(KEY, messages, maxTokens, effort) {
  let delayMs = 3000;
  for (let i = 0; i <= MAX_API_RETRIES; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${KEY}`,
          'content-type': 'application/json',
          'HTTP-Referer': 'https://localhost.freecode',
          'X-Title': 'FreeCode AI Explains',
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          max_tokens: maxTokens,
          temperature: 0.4,
          reasoning: { effort },
        }),
        signal: controller.signal,
      });

      if (res.status === 429) {
        const ra = Number(res.headers.get('retry-after')) || 15;
        if (i === MAX_API_RETRIES) throw new Error('rate-limited, giving up');
        log(`  429 rate-limited, waiting ${ra}s`);
        await sleep(ra * 1000);
        continue;
      }
      if (res.status >= 500 || res.status === 408) {
        if (i === MAX_API_RETRIES) throw new Error(`HTTP ${res.status} after retries`);
        await sleep(delayMs);
        delayMs *= 2;
        continue;
      }
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      }

      const doc = await res.json();
      const choice = doc.choices?.[0];
      const content = choice?.message?.content;
      if (typeof content !== 'string' || !content.trim() || choice.finish_reason === 'length') {
        throw Object.assign(
          new Error(
            `no usable output (content=${content ? content.length : 0} chars, finish=${choice?.finish_reason})`
          ),
          { code: 'empty_or_truncated' }
        );
      }
      return content;
    } catch (e) {
      if (e.name === 'AbortError') {
        if (i === MAX_API_RETRIES) throw new Error('request timeout');
        await sleep(delayMs);
        delayMs *= 2;
        continue;
      }
      if (e.code) throw e;
      if (i === MAX_API_RETRIES) throw e;
      await sleep(delayMs);
      delayMs *= 2;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error('exhausted retries');
}

function extractJson(text) {
  let s = text.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('no JSON object found');
  s = s.slice(start, end + 1);
  try {
    return JSON.parse(s);
  } catch {
    return JSON.parse(repairControlChars(s));
  }
}

/** Escapes raw newline/tab characters that models sometimes emit inside JSON strings. */
function repairControlChars(s) {
  let out = '';
  let inStr = false;
  let esc = false;
  for (const ch of s) {
    if (inStr) {
      if (esc) {
        esc = false;
        out += ch;
        continue;
      }
      if (ch === '\\') {
        esc = true;
        out += ch;
        continue;
      }
      if (ch === '"') {
        inStr = false;
        out += ch;
        continue;
      }
      if (ch === '\n') out += '\\n';
      else if (ch === '\r') out += '\\r';
      else if (ch === '\t') out += '\\t';
      else out += ch;
      continue;
    }
    if (ch === '"') inStr = true;
    out += ch;
  }
  return out;
}

const REQUIRED_LANGS = ['python', 'cpp', 'java', 'javascript'];

function validate(doc) {
  const errs = [];
  if (!doc || typeof doc !== 'object') return ['not an object'];
  if (typeof doc.t !== 'string' || !doc.t.trim()) errs.push('missing t');
  if (typeof doc.o !== 'string' || doc.o.trim().length < 80) errs.push('missing/thin o');
  if (!Array.isArray(doc.k)) errs.push('k not array');
  if (!Array.isArray(doc.a) || doc.a.length === 0) {
    errs.push('a missing/empty');
  } else {
    doc.a.forEach((ap, i) => {
      if (typeof ap.n !== 'string' || !ap.n.trim()) errs.push(`a[${i}].n missing`);
      if (typeof ap.i !== 'string' || ap.i.trim().length < 20) errs.push(`a[${i}].i missing/thin`);
      if (!Array.isArray(ap.s) || ap.s.length === 0) errs.push(`a[${i}].s missing`);
      if (!ap.c || typeof ap.c !== 'object') errs.push(`a[${i}].c missing`);
      else {
        const missing = REQUIRED_LANGS.filter((l) => typeof ap.c[l] !== 'string' || ap.c[l].trim().length < 30);
        if (missing.length) errs.push(`a[${i}].c missing langs: ${missing.join(',')}`);
      }
      if (typeof ap.t !== 'string' || !ap.t.trim()) errs.push(`a[${i}].t missing`);
    });
  }
  return errs;
}

async function save(slug, doc) {
  const clean = {
    v: 1,
    m: MODEL,
    t: String(doc.t),
    o: String(doc.o),
    k: Array.isArray(doc.k) ? doc.k.map(String) : [],
    a: doc.a.map((ap) => ({
      n: String(ap.n),
      i: String(ap.i ?? ''),
      s: Array.isArray(ap.s) ? ap.s.map(String) : [],
      c: Object.fromEntries(
        REQUIRED_LANGS.filter((l) => typeof ap.c?.[l] === 'string' && ap.c[l].trim()).map((l) => [l, ap.c[l]])
      ),
      t: String(ap.t ?? ''),
      sp: typeof ap.sp === 'string' ? ap.sp : '',
    })),
    w: typeof doc.w === 'string' ? doc.w : '',
  };
  await writeFile(path.join(OUT_DIR, `${slug}.json`), JSON.stringify(clean));
}

async function audit() {
  const problems = JSON.parse(await readFile(PROBLEMS_FILE, 'utf8'));
  const bySlug = new Map(problems.map((p) => [p.slug, p]));
  let official = 0;
  const missingOfficial = [];
  for (const p of problems) {
    const solPath = path.join(SOLUTIONS_DIR, `${p.slug}.json`);
    let has = false;
    if (existsSync(solPath)) {
      try {
        has = Boolean(JSON.parse(await readFile(solPath, 'utf8')).c);
      } catch {}
    }
    if (has) official++;
    else missingOfficial.push(p.slug);
  }

  let generated = 0;
  let valid = 0;
  const invalid = [];
  const incompleteLangs = [];
  let singleApproach = 0;
  for (const slug of missingOfficial) {
    const p = path.join(OUT_DIR, `${slug}.json`);
    if (!existsSync(p)) continue;
    generated++;
    try {
      const doc = JSON.parse(await readFile(p, 'utf8'));
      const errs = validate(doc);
      if (errs.length) invalid.push(`${slug}: ${errs.join('; ')}`);
      else valid++;
      if (Array.isArray(doc.a) && doc.a.length === 1) singleApproach++;
      for (const ap of doc.a ?? []) {
        const miss = REQUIRED_LANGS.filter((l) => typeof ap.c?.[l] !== 'string' || !ap.c[l].trim());
        if (miss.length) {
          incompleteLangs.push(`${slug}/${ap.n}: ${miss.join(',')}`);
          break;
        }
      }
    } catch (e) {
      invalid.push(`${slug}: unparseable (${e.message})`);
    }
  }

  const inCatalogButUnknown = [];
  const files = await readdir(OUT_DIR).catch(() => []);
  for (const f of files) {
    const slug = f.replace(/\.json$/, '');
    if (!bySlug.has(slug)) inCatalogButUnknown.push(slug);
  }

  console.log(`problems in catalog:      ${problems.length}`);
  console.log(`with official editorial:  ${official}`);
  console.log(`without official:         ${missingOfficial.length}`);
  console.log(`AI editorials generated:  ${generated} (${valid} valid, ${invalid.length} invalid)`);
  console.log(`still missing:            ${missingOfficial.length - generated}`);
  console.log(`single-approach:          ${singleApproach}`);
  console.log(`missing languages:        ${incompleteLangs.length}`);
  console.log(`files not in catalog:     ${inCatalogButUnknown.length}`);
  if (invalid.length) {
    console.log('\ninvalid files:');
    for (const s of invalid.slice(0, 20)) console.log('  -', s);
  }
  if (incompleteLangs.length) {
    console.log('\nmissing-language samples:');
    for (const s of incompleteLangs.slice(0, 20)) console.log('  -', s);
  }
}

function htmlToText(html) {
  let s = html;
  s = s.replace(/<pre[^>]*>/gi, '\n```\n').replace(/<\/pre>/gi, '\n```\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<li[^>]*>/gi, '- ');
  s = s.replace(/<\/(p|div|ul|ol|li|h[1-6]|tr)>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  s = s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

main().catch((e) => {
  console.error('fatal:', e.message);
  process.exit(1);
});
