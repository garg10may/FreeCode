import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import ProblemTable from '../components/ProblemTable';
import StatsSidebar from '../components/StatsSidebar';
import { useProblems } from '../lib/problems';
import { useStore } from '../lib/store';
import { DIFF_RANK, computeCounts } from '../lib/utils';
import type { Difficulty, SortDir, SortKey, StatusFilter } from '../types';

const PAGE_SIZE = 50;
const VALID_DIFFS: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export default function ProblemListPage() {
  const { problems, error, companies, companyMap } = useProblems();
  const { states, isAC, toggleAC, isFav, toggleFav } = useStore();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  const mutate = (fn: (p: URLSearchParams) => void) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        fn(p);
        return p;
      },
      { replace: true }
    );

  const get = (k: string) => params.get(k) ?? '';

  // persist current filters so the detail page can send us back here
  useEffect(() => {
    sessionStorage.setItem('fc:list-search', location.search);
  }, [location.search]);

  // "/" focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const q = get('q');
  const diffs = useMemo(
    () => get('diff').split(',').filter((d): d is Difficulty => VALID_DIFFS.includes(d as Difficulty)),
    [params] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const status = get('status') as StatusFilter;
  const tag = get('tag');
  const co = get('co');
  const sortKey = (get('sort') || 'id') as SortKey;
  const sortDir = (get('dir') || 'asc') as SortDir;
  const freeOnly = get('free') === '1';
  const pageNum = Math.max(1, parseInt(get('page'), 10) || 1);

  const setQ = (v: string) => mutate((p) => (v ? p.set('q', v) : p.delete('q')));
  const setStatus = (v: StatusFilter) => mutate((p) => (v ? p.set('status', v) : p.delete('status')));
  const setTag = (v: string) => mutate((p) => (v ? p.set('tag', v) : p.delete('tag')));
  const setCo = (v: string) => mutate((p) => (v ? p.set('co', v) : p.delete('co')));
  const setFreeOnly = (v: boolean) => mutate((p) => (v ? p.set('free', '1') : p.delete('free')));
  const setPage = (n: number) => mutate((p) => (n > 1 ? p.set('page', String(n)) : p.delete('page')));
  const clearPage = () => mutate((p) => p.delete('page'));

  const toggleDiff = (d: Difficulty) => {
    const next = diffs.includes(d) ? diffs.filter((x) => x !== d) : [...diffs, d];
    mutate((p) => (next.length === VALID_DIFFS.length || next.length === 0 ? p.delete('diff') : p.set('diff', next.join(','))));
    clearPage();
  };

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      mutate((p) => p.set('dir', sortDir === 'asc' ? 'desc' : 'asc'));
    } else {
      mutate((p) => {
        p.set('sort', key);
        p.set('dir', 'asc');
      });
    }
    clearPage();
  };

  const tags = useMemo<[string, number][]>(() => {
    const map = new Map<string, number>();
    for (const p of problems ?? []) for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1);
    return [...map.entries()];
  }, [problems]);

  const filtered = useMemo(() => {
    if (!problems) return [];
    let rows = problems;

    if (freeOnly) rows = rows.filter((p) => !p.paidOnly);
    if (diffs.length > 0 && diffs.length < VALID_DIFFS.length)
      rows = rows.filter((p) => diffs.includes(p.difficulty));

    if (status === 'ac') rows = rows.filter((p) => states[p.slug]?.ac);
    else if (status === 'not') rows = rows.filter((p) => !states[p.slug]?.ac);
    else if (status === 'fav') rows = rows.filter((p) => states[p.slug]?.fav);

    if (tag) rows = rows.filter((p) => p.tags.includes(tag));
    if (co) {
      const set = companyMap ? new Set(companyMap[co] || []) : null;
      rows = set ? rows.filter((p) => set.has(p.slug)) : [];
    }

    const s = q.trim().toLowerCase();
    if (s) rows = rows.filter((p) => p.id === s || p.title.toLowerCase().includes(s));

    const numeric = (id: string) => {
      const n = parseInt(id, 10);
      return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
    };
    const cmp = (a: (typeof rows)[0], b: (typeof rows)[0]): number => {
      let v = 0;
      switch (sortKey) {
        case 'title':
          v = a.title.localeCompare(b.title);
          break;
        case 'ac':
          v = (a.ac ?? -1) - (b.ac ?? -1);
          break;
        case 'freq':
          v = (a.freq ?? -1) - (b.freq ?? -1);
          break;
        case 'diff':
          v = DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty];
          break;
        default:
          v = numeric(a.id) - numeric(b.id);
      }
      if (v === 0) v = numeric(a.id) - numeric(b.id);
      return sortDir === 'desc' ? -v : v;
    };
    return [...rows].sort(cmp);
  }, [problems, freeOnly, diffs, status, tag, co, q, sortKey, sortDir, states, companyMap]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(pageNum, pages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const counts = useMemo(() => (problems ? computeCounts(problems, states) : null), [problems, states]);
  const favCount = useMemo(
    () => (problems ? problems.reduce((acc, p) => acc + (states[p.slug]?.fav ? 1 : 0), 0) : 0),
    [problems, states]
  );

  if (error) {
    return (
      <main className="container splash">
        <div className="card error-card">
          <h2>Could not load the problem set</h2>
          <p>{error}</p>
          <p className="muted">
            Run <code>npm run fetch:problems</code> to regenerate <code>public/data/problems.json</code>.
          </p>
        </div>
      </main>
    );
  }

  if (!problems) {
    return (
      <main className="container splash">
        <div className="spinner" aria-label="Loading problems" />
      </main>
    );
  }

  return (
    <main className="container list-layout">
      <StatsSidebar counts={counts} favCount={favCount} active={status} onPick={setStatus} />
      <section className="list-main">
        <div className="list-head">
          <h1>Study Plan? No — just solve.</h1>
        </div>
        <FilterBar
          q={q}
          onQ={(v) => {
            setQ(v);
            clearPage();
          }}
          searchRef={searchRef}
          diffs={diffs}
          onToggleDiff={toggleDiff}
          status={status}
          onStatus={(s) => {
            setStatus(s);
            clearPage();
          }}
          tag={tag}
          onTag={(t) => {
            setTag(t);
            clearPage();
          }}
          tags={tags}
          co={co}
          onCo={(c) => {
            setCo(c);
            clearPage();
          }}
          companies={companies}
          freeOnly={freeOnly}
          onFreeOnly={(v) => {
            setFreeOnly(v);
            clearPage();
          }}
        />
        <ProblemTable
          rows={rows}
          isAC={isAC}
          onToggleAC={toggleAC}
          isFav={isFav}
          onToggleFav={toggleFav}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={onSort}
        />
        <div className="list-foot">
          <span className="muted result-count">
            Showing {rows.length} of {filtered.length.toLocaleString()} problems
            {co && companies ? ` · ${companies.find((c) => c[0] === co)?.[1] ?? co}` : ''}
          </span>
          <Pagination page={safePage} pages={pages} onPage={setPage} />
        </div>
      </section>
    </main>
  );
}
