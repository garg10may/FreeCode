import fs from 'node:fs';

const secrets = JSON.parse(fs.readFileSync('.lc-secrets.json', 'utf8'));
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0',
  Referer: 'https://leetcode.com/problemset/all/',
  Cookie: `LEETCODE_SESSION=${secrets.session}; csrftoken=${secrets.csrftoken}`,
  'x-csrftoken': secrets.csrftoken,
};

const gql = async (query, variables) => {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ query, variables }),
  });
  return { status: r.status, j: await r.json().catch(() => null) };
};

// A) v2 list with auth -> does frequency come back non-null?
{
  const { status, j } = await gql(
    `query($c:String!,$l:Int!,$s:Int!){ problemsetQuestionListV2(categorySlug:$c,limit:$l,skip:$s,filters:{filterCombineType:ALL}){ questions{ questionFrontendId titleSlug frequency } } }`,
    { c: '', l: 3, s: 0 }
  );
  console.log('v2 status:', status);
  console.log(JSON.stringify(j?.data?.problemsetQuestionListV2?.questions ?? j?.errors, null, 1));
}

// B) root-level company queries
for (const f of ['companyTags', 'companyTagList', 'companies']) {
  const { status, j } = await gql(`query { ${f}(limit: 1, skip: 0) { name slug } }`);
  const err = j.errors?.[0]?.message || '';
  console.log(`${f}: ${status} ${err ? err.slice(0, 120) : JSON.stringify(j.data).slice(0, 200)}`);
}
