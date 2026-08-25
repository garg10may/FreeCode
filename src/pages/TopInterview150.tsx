import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProblems } from '../lib/problems';
import { useStore } from '../lib/store';
import { DIFF_CLASS } from '../lib/utils';
import type { Problem } from '../types';

interface StudyPlan {
  title: string;
  slug: string;
  groups: { name: string; qs: string[] }[];
}

function CheckIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" opacity={on ? 1 : 0.45} />
      {on && (
        <path
          d="M8 12.5l2.6 2.6L16 9.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" className="lock" aria-label="Premium" role="img">
      <rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor" />
      <path d="M8 10V7a4 4 0 118 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function TopInterview150() {
  const { problems } = useProblems();
  const store = useStore();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}data/top-interview-150.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<StudyPlan>;
      })
      .then((d) => {
        if (!cancelled) setPlan(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const bySlug = useMemo(() => new Map((problems ?? []).map((p) => [p.slug, p])), [problems]);

  const groups = useMemo(() => {
    if (!plan || !problems) return [];
    return plan.groups.map((g) => {
      const rows = g.qs.map((s) => bySlug.get(s)).filter((p): p is Problem => !!p);
      const done = rows.filter((p) => store.states[p.slug]?.ac).length;
      return { name: g.name, rows, done };
    });
  }, [plan, problems, bySlug, store.states]);

  const totalDone = groups.reduce((a, g) => a + g.done, 0);
  const totalAll = groups.reduce((a, g) => a + g.rows.length, 0);

  if (error) {
    return (
      <main className="container splash">
        <div className="card error-card">
          <h2>Could not load the study plan</h2>
          <p>{error}</p>
          <p className="muted">
            Run <code>npm run fetch:top150</code> to generate <code>public/data/top-interview-150.json</code>.
          </p>
        </div>
      </main>
    );
  }

  if (!plan || !problems) {
    return (
      <main className="container splash">
        <div className="spinner" aria-label="Loading study plan" />
      </main>
    );
  }

  return (
    <main className="container plan-page">
      <section className="list-main">
        <div className="plan-head card">
          <div>
            <h1>{plan.title}</h1>
            <p className="muted">
              LeetCode’s curated list of the most essential interview questions — now fully offline.
            </p>
          </div>
          <div className="plan-progress">
            <div className="plan-progress-nums">
              <strong>{totalDone}</strong> / {totalAll} solved
            </div>
            <div
              className="bar-track"
              role="progressbar"
              aria-valuenow={totalDone}
              aria-valuemin={0}
              aria-valuemax={totalAll}
            >
              <span
                className="bar-fill plan-fill"
                style={{ width: `${totalAll ? Math.round((totalDone / totalAll) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {groups.map((g, gi) => (
          <section key={g.name} className="plan-group">
            <details open={gi === 0 || g.done < g.rows.length} className="card plan-group-card">
              <summary className="plan-group-head">
                <span className="plan-group-name">{g.name}</span>
                <span className="side-count">
                  {g.done}/{g.rows.length}
                </span>
                <span className="bar-track mini group-bar">
                  <span
                    className={`bar-fill ${g.done === g.rows.length && g.rows.length > 0 ? 'hi' : 'mid'}`}
                    style={{ width: `${g.rows.length ? Math.round((g.done / g.rows.length) * 100) : 0}%` }}
                  />
                </span>
              </summary>
              <table className="problem-table plan-table">
                <tbody>
                  {g.rows.map((p) => {
                    const ac = store.isAC(p.slug);
                    return (
                      <tr key={p.slug}>
                        <td className="col-status">
                          <button
                            className={`status-btn${ac ? ' on' : ''}`}
                            onClick={() => store.toggleAC(p.slug)}
                            aria-label={ac ? 'Mark as unsolved' : 'Mark as solved'}
                            aria-pressed={ac}
                          >
                            <CheckIcon on={ac} />
                          </button>
                        </td>
                        <td className="col-id">{p.id}</td>
                        <td className="col-title">
                          <Link to={`/problems/${p.slug}`} className="title-link">
                            {p.paidOnly && <LockGlyph />}
                            <span>{p.title}</span>
                          </Link>
                        </td>
                        <td className="col-diff">
                          <span className={`pill ${DIFF_CLASS[p.difficulty]}`}>{p.difficulty}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </details>
          </section>
        ))}
      </section>
    </main>
  );
}
