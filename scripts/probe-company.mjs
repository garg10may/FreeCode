import fs from 'node:fs';

const secrets = JSON.parse(fs.readFileSync('.lc-secrets.json', 'utf8'));
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0',
  Referer: 'https://leetcode.com',
  Cookie: `LEETCODE_SESSION=${secrets.session}; csrftoken=${secrets.csrftoken}`,
  'x-csrftoken': secrets.csrftoken,
};

const candidates = ['name', 'slug', 'timesEncountered', 'frequency', 'questionCount', 'numQuestions', 'id'];
const sel = candidates.join(' ');
const r = await fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify({
    query: `query { question(titleSlug: "two-sum") { companyTags { ${sel} } } }`,
  }),
});
const j = await r.json();
if (j.errors) {
  console.log('INVALID:', j.errors.map((e) => e.message.match(/\"(\w+)\"/)?.[1]).join(', '));
} else {
  console.log('ALL VALID:', JSON.stringify(j.data.question.companyTags.slice(0, 3)));
}
