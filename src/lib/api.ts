import type { AiSolutionData, CompanyStats, Difficulty, QuestionData, SolutionData } from '../types';

interface DescDoc {
  q: string;
  t: string;
  d: Difficulty;
  p: boolean;
  c: string | null;
  h: string[];
  m: string | null;
  g: { name: string; slug: string }[];
  s?: { t: string; s: string; d: Difficulty; p: boolean }[];
  cs?: CompanyStats;
}

interface SolDoc {
  t: string | null;
  c: string | null;
  s: boolean;
  v: boolean;
}

const memory = new Map<string, QuestionData>();
const solMemory = new Map<string, SolutionData | null>();
const aiMemory = new Map<string, AiSolutionData | null>();

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
    similar: doc.s as QuestionData['similar'],
  };
  memory.set(slug, data);
  return data;
}

/** Loads the official editorial (public/solutions/<slug>.json); null when none exists. */
export async function fetchSolution(slug: string): Promise<SolutionData | null> {
  const mem = solMemory.get(slug);
  if (mem) return mem;

  const res = await fetch(`${import.meta.env.BASE_URL}solutions/${encodeURIComponent(slug)}.json`);
  if (!res.ok) return null;
  const doc = (await res.json()) as SolDoc;
  if (!doc.c) return null;
  const data: SolutionData = doc;
  solMemory.set(slug, data);
  return data;
}

/** Loads the AI-generated editorial (public/ai-solutions/<slug>.json); null when none exists. */
export async function fetchAiSolution(slug: string): Promise<AiSolutionData | null> {
  const mem = aiMemory.get(slug);
  if (mem !== undefined) return mem;

  const res = await fetch(`${import.meta.env.BASE_URL}ai-solutions/${encodeURIComponent(slug)}.json`);
  if (!res.ok) {
    aiMemory.set(slug, null);
    return null;
  }
  const doc = (await res.json()) as AiSolutionData;
  if (!doc || !doc.o || !Array.isArray(doc.a) || doc.a.length === 0) {
    aiMemory.set(slug, null);
    return null;
  }
  aiMemory.set(slug, doc);
  return doc;
}
