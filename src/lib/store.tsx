import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface PState {
  ac?: boolean;
  fav?: boolean;
  note?: string;
}

interface StoreShape {
  states: Record<string, PState>;
  isAC: (slug: string) => boolean;
  toggleAC: (slug: string) => void;
  isFav: (slug: string) => boolean;
  toggleFav: (slug: string) => void;
  getNote: (slug: string) => string;
  setNote: (slug: string, note: string) => void;
  getCode: (key: string) => string | undefined;
  setCode: (key: string, code: string) => void;
}

const StoreCtx = createContext<StoreShape | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Record<string, PState>>(() => load('fc:progress:v1', {}));
  const [code, setCodeMap] = useState<Record<string, string>>(() => load('fc:code:v1', {}));

  useEffect(() => {
    localStorage.setItem('fc:progress:v1', JSON.stringify(states));
  }, [states]);

  useEffect(() => {
    localStorage.setItem('fc:code:v1', JSON.stringify(code));
  }, [code]);

  const patch = useCallback((slug: string, fn: (prev: PState) => PState) => {
    setStates((all) => ({ ...all, [slug]: fn(all[slug] || {}) }));
  }, []);

  const isAC = useCallback((slug: string) => !!states[slug]?.ac, [states]);

  const toggleAC = useCallback(
    (slug: string) => patch(slug, (p) => ({ ...p, ac: !p.ac || undefined })),
    [patch]
  );

  const isFav = useCallback((slug: string) => !!states[slug]?.fav, [states]);

  const toggleFav = useCallback(
    (slug: string) => patch(slug, (p) => ({ ...p, fav: !p.fav || undefined })),
    [patch]
  );

  const getNote = useCallback((slug: string) => states[slug]?.note || '', [states]);

  const setNote = useCallback(
    (slug: string, note: string) =>
      patch(slug, (p) => ({ ...p, note: note === '' ? undefined : note })),
    [patch]
  );

  const getCode = useCallback((key: string) => code[key], [code]);

  const setCode = useCallback(
    (key: string, value: string) => setCodeMap((all) => ({ ...all, [key]: value })),
    []
  );

  const value = useMemo<StoreShape>(
    () => ({
      states,
      isAC,
      toggleAC,
      isFav,
      toggleFav,
      getNote,
      setNote,
      getCode,
      setCode,
    }),
    [states, isAC, toggleAC, isFav, toggleFav, getNote, setNote, getCode, setCode]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreShape {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within ProgressProvider');
  return ctx;
}
