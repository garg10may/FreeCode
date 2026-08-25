import fs from 'node:fs';
import path from 'node:path';

const CARD_SLUG = 'leetcodes-interview-crash-course-data-structures-and-algorithms';
const OUT_INDEX = path.resolve('public/data/crash-course.json');
const OUT_DIR = path.resolve('public/data/course');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Referer: `https://leetcode.com/explore/featured/card/${CARD_SLUG}/`,
  'Content-Type': 'application/json',
};

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

async function gql(query, variables, attempt = 1) {
  try {
    const r = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { ...HEADERS, ...AUTH_HEADERS },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    if (j.errors?.length) throw new Error(j.errors[0]?.message);
    return j.data;
  } catch (e) {
    if (attempt >= 4) throw e;
    await new Promise((r) => setTimeout(r, 800 * attempt));
    return gql(query, variables, attempt + 1);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** "Reverse String" / "K Radius Subarray Averages" -> problem slug, validated against the local set */
function titleToSlug(title, validSlugs) {
  const slug = title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return validSlugs.has(slug) ? slug : null;
}

async function main() {
  const problems = JSON.parse(fs.readFileSync(path.resolve('public/data/problems.json'), 'utf8'));
  const byId = new Map(problems.map((p) => [p.id, p]));
  const validSlugs = new Set(problems.map((p) => p.slug));

  console.log('fetching card chapters...');
  const cardData = await gql(
    `query($slug:String!){card(cardSlug:$slug){id title description chapters{id title}}}`,
    { slug: CARD_SLUG }
  );
  const card = cardData.card;

  const chapters = [];
  let totalItems = 0;
  let accessibleItems = 0;
  let linkedProblems = 0;

  for (const ch of card.chapters) {
    process.stdout.write(`chapter ${ch.id} "${ch.title}"...`);
    const chData = await gql(
      `query($slug:String!,$cid:String!){chapter(cardSlug:$slug,chapterId:$cid){id title description items{id title}}}`,
      { slug: CARD_SLUG, cid: ch.id }
    );
    const full = chData.chapter;
    if (!full) {
      console.log(' inaccessible');
      chapters.push({ id: ch.id, t: ch.title, d: null, items: [] });
      continue;
    }

    const items = [];
    for (const it of full.items) {
      totalItems++;
      const entry = { id: it.id, t: it.title };

      await sleep(220);
      // keep locally-authored lessons unless LeetCode actually serves the article
      const localFile = path.join(OUT_DIR, `${it.id}.json`);
      let authored = false;
      if (fs.existsSync(localFile)) {
        try {
          if (JSON.parse(fs.readFileSync(localFile, 'utf8')).src === 'orig') authored = true;
        } catch {
          /* ignore */
        }
      }
      try {
        const iData = await gql(
          `query($id:String!,$slug:String!){item(id:$id){type article{title content} question{title titleSlug}}card(cardSlug:$slug){id}}`,
          { id: it.id, slug: CARD_SLUG }
        );
        const item = iData.item;
        if (item?.article?.content) {
          accessibleItems++;
          entry.a = true;
          delete entry.src;
          fs.writeFileSync(
            localFile,
            JSON.stringify({ t: item.article.title || it.title, c: item.article.content, src: 'lc' })
          );
        } else {
          entry.a = authored || undefined;
          if (authored) entry.src = 'orig';
          else delete entry.a;
        }
      } catch {
        entry.a = authored || undefined;
        if (authored) entry.src = 'orig';
        else delete entry.a;
      }

      const mapped = titleToSlug(it.title, validSlugs);
      if (mapped) {
        entry.q = mapped;
        linkedProblems++;
      }
      items.push(entry);
    }

    chapters.push({
      id: full.id,
      t: full.title,
      d: full.description ?? null,
      items,
    });
    console.log(` ${items.length} items`);
  }

  const out = {
    title: card.title,
    slug: CARD_SLUG,
    url: `https://leetcode.com/explore/featured/card/${CARD_SLUG}/`,
    chapters,
  };
  fs.writeFileSync(OUT_INDEX, JSON.stringify(out));
  console.log('----------------------------------------');
  console.log(`chapters: ${chapters.length}, items: ${totalItems}`);
  console.log(`articles saved: ${accessibleItems} -> public/data/course/`);
  console.log(`items linked to local problems: ${linkedProblems}`);
  console.log(`index written -> public/data/crash-course.json`);
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
