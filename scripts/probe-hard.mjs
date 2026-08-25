import { readFile } from 'node:fs/promises';

const secrets = JSON.parse(await readFile('.lc-secrets.json', 'utf8'));
const desc = JSON.parse(await readFile('./public/descriptions/strobogrammatic-number-iii.json', 'utf8'));

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

const user = `LeetCode problem: ${desc.t} (${desc.d})\n\n${htmlToText(desc.c).slice(0, 2500)}\n\nReply with STRICT JSON only, under 800 tokens: {"t":"title","o":"2-sentence overview","k":["one insight"],"a":[{"n":"Approach 1: X","i":"intuition","s":["step"],"c":{"python":"code"},"t":"O(n)","sp":"O(n)"}],"w":"wrapup"}`;

async function attempt(label, extra) {
  const t0 = Date.now();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${secrets.openrouter_key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'stealth/ox-alpha',
      messages: [{ role: 'user', content: user }],
      max_tokens: 2000,
      temperature: 0.4,
      ...extra,
    }),
  });
  const doc = await res.json();
  const ch = doc.choices?.[0];
  const msg = ch?.message ?? {};
  console.log(
    `[${label}] status=${res.status} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`,
    `finish=${ch?.finish_reason}`,
    `content_len=${(msg.content ?? '').length}`,
    `reasoning_len=${(msg.reasoning ?? '').length}`,
    `completion_tokens=${doc.usage?.completion_tokens}`,
    `reasoning_tokens=${doc.usage?.completion_tokens_details?.reasoning_tokens}`
  );
  if (!msg.content) console.log(`[${label}] refusal=${msg.refusal} error=${JSON.stringify(doc.error ?? null).slice(0, 200)}`);
}

await attempt('plain', {});
await attempt('reason-effort-low', { reasoning: { effort: 'low' } });
await attempt('reason-exclude', { reasoning: { effort: 'low', exclude: true } });
