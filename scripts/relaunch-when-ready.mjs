/**
 * Waits for OpenRouter quota to become available, then launches all 6 generator shards.
 * Polls every 10 minutes with a tiny 5-token request. Runs detached; safe to leave overnight.
 * Guard file prevents accidental double-launch: ai-logs/relauncher.active
 *
 * Usage: node scripts/relaunch-when-ready.mjs
 */
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync, openSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GUARD = path.join(ROOT, 'ai-logs', 'relauncher.active');
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const POLL_MS = 10 * 60 * 1000;

const log = (...m) => console.log(new Date().toISOString(), ...m);

const secrets = JSON.parse(await readFile(path.join(ROOT, '.lc-secrets.json'), 'utf8'));
const KEY = secrets.openrouter_key;

if (existsSync(GUARD)) {
  log('another relauncher is already active (guard file exists) — exiting');
  process.exit(0);
}
await writeFile(GUARD, new Date().toISOString());
process.on('exit', () => {
  try {
    unlinkSync(GUARD);
  } catch {}
});
async function pingQuota() {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'stealth/ox-alpha',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      }),
    });
    if (res.ok) return { ok: true };
    const reset = res.headers.get('x-ratelimit-reset');
    const remaining = res.headers.get('x-ratelimit-remaining');
    return { ok: false, reset: reset ? new Date(Number(reset)).toISOString() : '?', remaining };
  } catch (e) {
    return { ok: false, reset: `network error: ${e.message}`, remaining: '?' };
  }
}

log('relauncher active — polling every 10 min for quota');
for (;;) {
  const r = await pingQuota();
  if (r.ok) {
    log('quota available — launching 6 shards');
    break;
  }
  log(`still limited (remaining=${r.remaining}, reset=${r.reset}) — sleeping 10 min`);
  await new Promise((s) => setTimeout(s, POLL_MS));
}

for (let i = 0; i < 6; i++) {
  const out = openSync(path.join(ROOT, 'ai-logs', `shard-${i}.out.log`), 'w');
  const err = openSync(path.join(ROOT, 'ai-logs', `shard-${i}.err.log`), 'w');
  const child = spawn(
    process.execPath,
    ['scripts/generate-ai-solutions.mjs', '--shard', `${i}/6`, '--conc', '2', '--batch', '16'],
    { detached: true, stdio: ['ignore', out, err], cwd: ROOT }
  );
  child.unref();
  log(`launched shard ${i}/6 (pid ${child.pid})`);
}
log('all shards launched — relauncher exiting');
