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
}

export type StatusFilter = '' | 'ac' | 'not' | 'fav';
export type SortKey = 'id' | 'title' | 'diff' | 'ac' | 'freq';
export type SortDir = 'asc' | 'desc';
