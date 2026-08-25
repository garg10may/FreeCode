import fs from 'node:fs';
import path from 'node:path';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Referer: 'https://leetcode.com/studyplan/top-interview-150/',
  'Content-Type': 'application/json',
};

const QUERY = `query($slug:String!){
  studyPlanV2Detail(planSlug:$slug){
    name
    slug
    planSubGroups{
      name
      questions{ id title titleSlug difficulty }
    }
  }
}`;

function readSecrets() {
  try {
    const f = path.resolve('.lc-secrets.json');
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    /* ignore */
  }
  return {};
}
const secrets = readSecrets();
const AUTH_HEADERS =
  secrets.session && secrets.csrftoken
    ? { Cookie: `LEETCODE_SESSION=${secrets.session}; csrftoken=${secrets.csrftoken}`, 'x-csrftoken': secrets.csrftoken }
    : {};

async function main() {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { ...HEADERS, ...AUTH_HEADERS },
    body: JSON.stringify({ query: QUERY, variables: { slug: 'top-interview-150' } }),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  if (j.errors?.length) throw new Error(j.errors[0]?.message);
  const plan = j.data?.studyPlanV2Detail;
  if (!plan) throw new Error('plan not found');

  const problems = JSON.parse(fs.readFileSync(path.resolve('public/data/problems.json'), 'utf8'));
  const byId = new Map(problems.map((p) => [p.id, p]));

  const groups = plan.planSubGroups.map((g) => ({
    name: g.name,
    qs: g.questions.map((q) => {
      const p = byId.get(q.id);
      return p ? p.slug : q.titleSlug;
    }),
  }));

  const total = groups.reduce((a, g) => a + g.qs.length, 0);
  const out = { title: plan.name || 'Top Interview 150', slug: 'top-interview-150', groups };
  fs.writeFileSync(
    path.resolve('public/data/top-interview-150.json'),
    JSON.stringify(out)
  );
  console.log(`saved ${groups.length} groups / ${total} questions -> public/data/top-interview-150.json`);
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
