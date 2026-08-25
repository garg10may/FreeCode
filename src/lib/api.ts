import type { Difficulty, QuestionData } from '../types';

interface DescDoc {
  q: string;
  t: string;
  d: Difficulty;
  p: boolean;
  c: string | null;
  h: string[];
  m: string | null;
  g: { name: string; slug: string }[];
}

const memory = new Map<string, QuestionData>();

/** Loads the pre-fetched problem statement from public/descriptions/<slug>.json */
export async function fetchQuestion(slug: string): Promise<QuestionData> {
  const mem = memory.get(slug);
  if (mem) return mem;

  let res: Response;
  try {
    res = await fetch(`${import.meta.env.BASE_URL}descriptions/${encodeURIComponent(slug)}.json`);
  } catch (e) {
    throw e instanceof Error ? e : new Error('network error');
  }
  if (!res.ok) {
    throw new Error(res.status === 404 ? 'description not found in local dataset' : `HTTP ${res.status}`);
  }

  const doc = (await res.json()) as DescDoc;
  const data: QuestionData = {
    qid: doc.q,
    title: doc.t,
    slug,
    difficulty: doc.d,
    paidOnly: doc.p,
    content: doc.c,
    hints: doc.h ?? [],
    metaData: doc.m ?? null,
    topicTags: doc.g ?? [],
  };
  memory.set(slug, data);
  return data;
}
