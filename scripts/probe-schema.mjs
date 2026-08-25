const gql = async (query) => {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0', Referer: 'https://leetcode.com' },
    body: JSON.stringify({ query }),
  });
  const j = await r.json();
  console.log('status', r.status);
  if (j.errors) console.log(j.errors.map((e) => e.message).join('\n'));
  else console.log(JSON.stringify(j.data).slice(0, 400));
};

await gql(`query { question(titleSlug: "two-sum") { similarQuestions { isPaidOnly } } }`);
await gql(`query { question(titleSlug: "two-sum") { similarQuestions { title titleSlug difficulty } } }`);
