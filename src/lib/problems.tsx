import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Problem } from '../types';

interface ProblemsCtxShape {
  problems: Problem[] | null;
  error: string | null;
}

const Ctx = createContext<ProblemsCtxShape>({ problems: null, error: null });

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

export function ProblemsProvider({ children }: { children: ReactNode }) {
  const [problems, setProblems] = useState<Problem[] | null>(cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (problems) return;
    loadProblems()
      .then(setProblems)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e))
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ problems, error }), [problems, error]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProblems(): ProblemsCtxShape {
  return useContext(Ctx);
}
