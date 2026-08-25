import { readFile, writeFile } from 'node:fs/promises';

const secrets = JSON.parse(await readFile('.lc-secrets.json', 'utf8'));
const desc = JSON.parse(await readFile('./public/descriptions/flip-game-ii.json', 'utf8'));

function htmlToText(html) {
  let s = html;
  s = s.replace(/<pre[^>]*>/gi, '\n```\n').replace(/<\/pre>/gi, '\n```\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<li[^>]*>/gi, '- ');
  s = s.replace(/<\/(p|div|ul|ol|li|h[1-6]|tr)>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim();
}

const user =
  `LeetCode problem: ${desc.t} (difficulty: ${desc.d})\n\n${htmlToText(desc.c).slice(0, 3000)}\n\n` +
  `Reply with STRICT JSON only: {"t":"title","o":"2-sentence overview","k":["one insight"],"a":[{"n":"Approach 1: X","i":"intuition","s":["step"],"c":{"python":"code"},"t":"O(n)","sp":"O(n)"}],"w":"wrapup"} — keep it SHORT, this is a format test.`;

const t0 = Date.now();
const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: { authorization: `Bearer ${secrets.openrouter_key}`, 'content-type': 'application/json' },
  body: JSON.stringify({
    model: 'stealth/ox-alpha',
    messages: [{ role: 'user', content: user }],
    max_tokens: 2000,
    temperature: 0.4,
  }),
});
const doc = await res.json();
console.log('status', res.status, 'elapsed_s', ((Date.now() - t0) / 1000).toFixed(1));
console.log('top-level keys:', Object.keys(doc));
const ch = doc.choices?.[0];
console.log('finish_reason:', ch?.finish_reason);
console.log('usage:', JSON.stringify(doc.usage));
console.log('message keys:', ch?.message ? Object.keys(ch.message) : null);
if (ch?.message?.reasoning) console.log('reasoning_len:', ch.message.reasoning.length);
const content = ch?.message?.content ?? '';
console.log('content_len:', content.length);
await writeFile(`${process.env.TEMP}/ox-probe-raw.json`, JSON.stringify(doc, null, 2));
await writeFile(`${process.env.TEMP}/ox-probe-content.txt`, content || '(empty)');
console.log('content head:', content.slice(0, 300).replace(/\n/g, '\\n'));
