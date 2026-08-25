const targets = [
  ['flatten-a-multilevel-doubly-linked-list', /flatten[^"'\s)]*/g],
  ['most-frequent-prime', /(south|2024\/02\/15)[^"'\s)]*/g],
];

for (const [slug, re] of targets) {
  console.log(`--- ${slug} ---`);
  try {
    const r = await fetch(`https://r.jina.ai/https://leetcode.com/problems/${slug}/description/`, {
      signal: AbortSignal.timeout(60000),
    });
    if (!r.ok) {
      console.log('jina HTTP', r.status);
      continue;
    }
    const text = await r.text();
    const hits = [...new Set(text.match(re) || [])];
    console.log(hits.length ? hits.slice(0, 15).join('\n') : 'no matches in page text');
  } catch (e) {
    console.log('jina error:', e.message);
  }
}
