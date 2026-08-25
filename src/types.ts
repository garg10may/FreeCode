export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  paidOnly: boolean;
  tags: string[];
  ac: number | null;
  freq?: number;
}

export interface TopicTag {
  name: string;
  slug: string;
}

export interface SimilarProblem {
  t: string;
  s: string;
  d: Difficulty;
  p: boolean;
}

export interface SolutionData {
  t: string | null;
  c: string | null;
  s: boolean;
  v: boolean;
}

export interface AiApproach {
  n: string;
  i: string;
  s: string[];
  c: Partial<Record<'cpp' | 'java' | 'python' | 'javascript' | 'typescript' | 'go', string>>;
  t?: string;
  sp?: string;
}

export interface AiSolutionData {
  v: number;
  m: string;
  t: string;
  o: string;
  k: string[];
  a: AiApproach[];
  w?: string;
  fig?: string;
}

export interface CompanyStat {
  name: string;
  slug: string;
  n: number;
}

export interface CompanyStats {
  a: CompanyStat[]; // 0-3 months
  b: CompanyStat[]; // 0-6 months
  m: CompanyStat[]; // 6+ months
}

export interface QuestionData {
  qid: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  paidOnly: boolean;
  content: string | null;
  hints: string[];
  metaData: string | null;
  topicTags: TopicTag[];
  similar?: SimilarProblem[];
  cs?: CompanyStats;
}

export type StatusFilter = '' | 'ac' | 'not' | 'fav';
export type SortKey = 'id' | 'title' | 'diff' | 'ac' | 'freq';
export type SortDir = 'asc' | 'desc';
