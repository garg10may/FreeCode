import fs from 'node:fs';

const secrets = JSON.parse(fs.readFileSync('.lc-secrets.json', 'utf8'));
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0',
  Referer: 'https://leetcode.com',
  Cookie: `LEETCODE_SESSION=${secrets.session}; csrftoken=${secrets.csrftoken}`,
  'x-csrftoken': secrets.csrftoken,
};

const gql = async (query, variables) => {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json().catch(() => null);
  return { status: r.status, j };
};

// 1) companyTag root node shape
{
  const { status, j } = await gql(`query { companyTag(slug: "google") { zzz } }`);
  console.log('companyTag fields:', status, j?.errors?.[0]?.message?.slice(0, 400) ?? JSON.stringify(j?.data).slice(0, 300));
}

// 2) question-side stats candidates
for (const f of ['companyStats', 'frequentlyAsked', 'companyFrequencies', 'askedBy']) {
  const { status, j } = await gql(`query { question(titleSlug: "two-sum") { ${f} { zzz } } }`);
  const msg = j?.errors?.[0]?.message || '';
  console.log(`${f}:`, status, msg.slice(0, 200) || JSON.stringify(j?.data).slice(0, 200));
}
