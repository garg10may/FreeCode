import fs from 'node:fs';

const secrets = JSON.parse(fs.readFileSync('.lc-secrets.json', 'utf8'));
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0',
  Referer: 'https://leetcode.com/problemset/all/',
  Cookie: `LEETCODE_SESSION=${secrets.session}; csrftoken=${secrets.csrftoken}`,
  'x-csrftoken': secrets.csrftoken,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const gql = async (query, variables) => {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ query, variables }),
  });
  return { status: r.status, j: await r.json().catch(() => null) };
};

// B) all companies
{
  const { status, j } = await gql(`query { companyTags { id name slug questionCount } }`);
  if (j?.data?.companyTags) {
    const tags = j.data.companyTags;
    fs.writeFileSync('public/data/companies.json', JSON.stringify(tags));
    console.log(`companies saved: ${tags.length}`);
  } else {
    console.log('companyTags failed:', status, JSON.stringify(j?.errors?.[0]));
  }
}

// A) v2 pagination with auth -> merge frequency into problems.json
const LIST = `query($c:String!,$l:Int!,$s:Int!){
  problemsetQuestionListV2(categorySlug:$c,limit:$l,skip:$s,filters:{filterCombineType:ALL}){
    questions{ questionFrontendId titleSlug frequency }
  }
}`;

const freq = new Map();
for (let skip = 0; ; skip += 100) {
  const { status, j } = await gql(LIST, { c: '', l: 100, s: skip });
  const qs = j?.data?.problemsetQuestionListV2?.questions;
  if (!qs || !qs.length) {
    if (!skip) console.error('list failed:', status, JSON.stringify(j?.errors?.[0]));
    break;
  }
  for (const q of qs) {
    if (q.frequency != null) freq.set(q.titleSlug || q.questionFrontendId, q.frequency);
  }
  process.stdout.write(`\rfrequency sweep: ${skip + qs.length}`);
  await sleep(120);
}
console.log('');

const probs = JSON.parse(fs.readFileSync('public/data/problems.json', 'utf8'));
let updated = 0;
for (const p of probs) {
  const f = freq.get(p.slug);
  if (f != null) {
    p.freq = f;
    updated++;
  }
}
fs.writeFileSync('public/data/problems.json', JSON.stringify(probs));
console.log(`problems with frequency: ${updated}/${probs.length}`);
