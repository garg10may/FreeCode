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

// 1) companyTagStatsV2 shape
{
  const { status, j } = await gql(`query { question(titleSlug: "two-sum") { companyTagStatsV2 { zzz } } }`);
  console.log('statsV2 subfields:', status, (j?.errors?.[0]?.message || '').slice(0, 300));
  const { j: j2 } = await gql(`query { question(titleSlug: "two-sum") { companyTagStatsV2 } }`);
  console.log('statsV2 direct:', (j2?.errors?.[0]?.message || '').slice(0, 200));
  console.log('data:', JSON.stringify(j2?.data?.question?.companyTagStatsV2)?.slice(0, 600));
}

// 2) official solution node shape
{
  const { status, j } = await gql(`query { question(titleSlug: "two-sum") { solution { zzz } } }`);
  console.log('\nsolution subfields:', status, (j?.errors?.[0]?.message || '').slice(0, 400));
}
