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
  return { status: r.status, j: await r.json().catch(() => null) };
};

// more video-ish candidates on ArticleNode
const cands = ['videoSolution', 'videoUrl', 'media', 'attachments', 'coverImage', 'heroImage', 'topicTags', 'parent', 'question'];
const sel = cands.join(' ');
{
  const { j } = await gql(`query { question(titleSlug: "two-sum") { solution { ${sel} } } }`);
  console.log('INVALID:', j.errors ? j.errors.map((e) => e.message.match(/"(\w+)"/)?.[1]).join(', ') : 'none');
}

// fetch valid content and inspect for video markers
{
  const { j } = await gql(`query { question(titleSlug: "two-sum") { solution { id title slug content canSeeDetail hasVideoSolution } } }`);
  const sol = j?.data?.question?.solution;
  if (sol) {
    console.log('title:', sol.title, '| canSeeDetail:', sol.canSeeDetail, '| hasVideo:', sol.hasVideoSolution);
    console.log('content len:', sol.content?.length);
    const vid = sol.content?.match(/<video[^>]*>|\.mp4|youtube|vimeo|player\.[^"']+/gi);
    console.log('video markers in content:', vid?.slice(0, 5) ?? 'none');
    console.log('content head:', sol.content?.slice(0, 400));
  } else {
    console.log('solution:', JSON.stringify(j?.errors));
  }
}
