import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Problem } from '../types';

interface ProblemsCtxShape {
  problems: Problem[] | null;
  error: string | null;
  companies: [string, string, number][] | null; // [slug, name, questionCount]
  companyMap: Record<string, string[]>; // problem slug -> company slugs
}

const Ctx = createContext<ProblemsCtxShape>({ problems: null, error: null, companies: null, companyMap: {} });

let cache: Problem[] | null = null;

async function loadProblems(): Promise<Problem[]> {
  if (cache) return cache;
  const res = await fetch(`${import.meta.env.BASE_URL}data/problems.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as Problem[];
  if (!Array.isArray(data) || data.length === 0) throw new Error('dataset is empty');
  cache = data;
  return data;
}

async function loadJson<T>(path: string): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

export function ProblemsProvider({ children }: { children: ReactNode }) {
  const [problems, setProblems] = useState<Problem[] | null>(cache);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<[string, string, number][] | null>(null);
  const [companyMap, setCompanyMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (problems) return;
    loadProblems()
      .then(setProblems)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e))
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!problems || companies) return;
    Promise.all([
      loadJson<[{ slug: string; name: string; questionCount: number }]>('data/companies.json').catch(
        () => []
      ),
      loadJson<Record<string, string[]>>('data/company-map.json').catch(() => ({})),
    ])
      .then(([rawTags, map]) => {
        setCompanyMap(map);
        setCompanies(rawTags.map((c) => [c.slug, c.name, c.questionCount]));
      })
      .catch(() => {
        /* optional files */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problems]);

  const value = useMemo(
    () => ({ problems, error, companies, companyMap }),
    [problems, error, companies, companyMap]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProblems(): ProblemsCtxShape {
  return useContext(Ctx);
}
