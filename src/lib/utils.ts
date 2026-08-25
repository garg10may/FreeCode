import { useEffect, useState } from 'react';
import type { Difficulty, Problem } from '../types';

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export const DIFF_CLASS: Record<Difficulty, string> = {
  Easy: 'easy',
  Medium: 'medium',
  Hard: 'hard',
};

export const DIFF_RANK: Record<Difficulty, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

export interface DiffCount {
  done: number;
  total: number;
}

export type CountsMap = Record<'all' | Difficulty, DiffCount>;

/** Solved counts; premium-only problems excluded from totals like on LeetCode. */
export function computeCounts(
  problems: Problem[],
  states: Record<string, { ac?: boolean }>
): CountsMap {
  const counts: CountsMap = {
    all: { done: 0, total: 0 },
    Easy: { done: 0, total: 0 },
    Medium: { done: 0, total: 0 },
    Hard: { done: 0, total: 0 },
  };
  for (const p of problems) {
    if (p.paidOnly) continue;
    counts.all.total++;
    counts[p.difficulty].total++;
    if (states[p.slug]?.ac) {
      counts.all.done++;
      counts[p.difficulty].done++;
    }
  }
  return counts;
}

export function pickRandom(problems: Problem[], states: Record<string, { ac?: boolean }>): Problem | null {
  const pool = problems.filter((p) => !p.paidOnly && !states[p.slug]?.ac);
  const source = pool.length ? pool : problems.filter((p) => !p.paidOnly);
  if (!source.length) return null;
  return source[Math.floor(Math.random() * source.length)];
}

export function prettyTag(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
