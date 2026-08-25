import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { renderMarkdown, sanitizeHtml } from '../lib/markdown';
import { useProblems } from '../lib/problems';
import { DIFF_CLASS } from '../lib/utils';
import type { Problem } from '../types';

interface CourseItem {
  id: string;
  t: string;
  /** free article content exists locally */
  a?: boolean;
  /** mapped local problem slug (exercises) */
  q?: string;
}

interface CourseChapter {
  id: string;
  t: string;
  d: string | null;
  items: CourseItem[];
}

interface CourseIndex {
  title: string;
  slug: string;
  url: string;
  chapters: CourseChapter[];
}

interface ItemDoc {
  t: string;
  c: string;
}

function loadDone(): Record<string, true> {
  try {
    return JSON.parse(localStorage.getItem('fc:course:v1') || '{}') as Record<string, true>;
  } catch {
    return {};
  }
}

function ArticleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
      <path
        d="M7 3h8l4 4v14H7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M15 3v4h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 12h6M10 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 8.5l5.5 3.5-5.5 3.5z" fill="currentColor" />
    </svg>
  );
}

export default function CoursePage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { problems } = useProblems();

  const [index, setIndex] = useState<CourseIndex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, true>>(loadDone);
  const [doc, setDoc] = useState<ItemDoc | null>(null);
  const [docError, setDocError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}data/crash-course.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<CourseIndex>;
      })
      .then((d) => {
        if (!cancelled) setIndex(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // flattened item list for prev/next + lookup
  const flat = useMemo(() => {
    if (!index) return [];
    return index.chapters.flatMap((ch) => ch.items.map((it) => ({ ch, it })));
  }, [index]);

  const current = useMemo(() => {
    if (!itemId) return null;
    return flat.find((x) => x.it.id === itemId) ?? null;
  }, [flat, itemId]);

  const bySlug = useMemo(() => new Map((problems ?? []).map((p) => [p.slug, p])), [problems]);

  useEffect(() => {
    let cancelled = false;
    setDoc(null);
    setDocError(false);
    if (!itemId || !current?.it.a) return undefined;
    fetch(`${import.meta.env.BASE_URL}data/course/${encodeURIComponent(itemId)}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ItemDoc>;
      })
      .then((d) => {
        if (!cancelled) setDoc(d);
      })
      .catch(() => {
        if (!cancelled) setDocError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId, current?.it.a]);

  useEffect(() => {
    localStorage.setItem('fc:course:v1', JSON.stringify(done));
  }, [done]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [itemId]);

  if (error) {
    return (
      <main className="container splash">
        <div className="card error-card">
          <h2>Could not load the course</h2>
          <p>{error}</p>
          <p className="muted">
            Run <code>npm run fetch:course</code> to generate the course dataset.
          </p>
        </div>
      </main>
    );
  }

  if (!index) {
    return (
      <main className="container splash">
        <div className="spinner" aria-label="Loading course" />
      </main>
    );
  }

  const doneCount = flat.filter((x) => done[x.it.id]).length;
  const idx = current ? flat.findIndex((x) => x.it.id === current.it.id) : -1;
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
  const problem: Problem | null = current?.it.q ? bySlug.get(current.it.q) ?? null : null;

  const go = (id: string) => navigate(`/course/${id}`);

  return (
    <main className="container course-layout">
      <aside className="course-side card">
        <div className="course-side-head">
          <div>
            <div className="course-kicker">Course</div>
            <Link to="/course" className="course-title">
              LeetCode’s Interview Crash Course
            </Link>
          </div>
          <div className="side-count">
            {doneCount}/{flat.length}
          </div>
        </div>
        <nav className="course-toc">
          {index.chapters.map((ch) => (
            <details key={ch.id} open={current?.ch.id === ch.id || !itemId}>
              <summary className="course-chapter">
                {ch.t}
                <span className="side-count">{ch.items.filter((i) => done[i.id]).length}/{ch.items.length}</span>
              </summary>
              <ul className="course-items">
                {ch.items.map((it) => (
                  <li key={it.id}>
                    <button
                      className={`course-item${it.id === itemId ? ' on' : ''}${done[it.id] ? ' done' : ''}`}
                      onClick={() => go(it.id)}
                    >
                      <span className="course-item-icon">
                        {it.q ? <PlayIcon /> : it.a ? <ArticleIcon /> : <span className="lock">🔒</span>}
                      </span>
                      <span className="course-item-label">{it.t}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
      </aside>

      <section className="course-main card">
        {!current && (
          <div className="course-landing">
            <h1>LeetCode’s Interview Crash Course</h1>
            <p className="muted">
              Data Structures and Algorithms — the complete curriculum, rebuilt offline.
            </p>
            <div className="course-note">
              <p>
                <strong>About this rebuild.</strong> The full chapter/item structure below mirrors
                LeetCode’s course exactly ({flat.length} items across {index.chapters.length}{' '}
                chapters). The four publicly readable articles are included verbatim; every exercise
                is linked to the matching problem in this app, so you can work through the whole
                curriculum offline. The remaining lesson texts are part of LeetCode’s paid course
                add-on and are marked accordingly.
              </p>
            </div>
            <ol className="course-chapter-list">
              {index.chapters.map((ch) => (
                <li key={ch.id}>
                  <strong>{ch.t}</strong>
                  {ch.d && <div className="muted chapter-desc" dangerouslySetInnerHTML={{ __html: sanitizeHtml(ch.d) }} />}
                  <div className="chapter-jump">
                    {ch.items.slice(0, 3).map((it) => (
                      <button key={it.id} className="btn ghost small" onClick={() => go(it.id)}>
                        {it.t}
                      </button>
                    ))}
                    {ch.items.length > 3 && (
                      <span className="side-count">+{ch.items.length - 3} more</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            {flat[1] && (
              <button className="btn accent course-start" onClick={() => go(flat[1].it.id)}>
                Start the course →
              </button>
            )}
          </div>
        )}

        {current && (
          <>
            <div className="detail-head course-crumb">
              <Link to="/course" className="back-link" aria-label="Course home">
                ←
              </Link>
              <span className="crumb-path muted">
                {current.ch.t} / {current.it.t}
              </span>
              <button
                className={`btn ghost small${done[current.it.id] ? ' accent' : ''}`}
                onClick={() =>
                  setDone((d) => {
                    const n = { ...d };
                    if (n[current.it.id]) delete n[current.it.id];
                    else n[current.it.id] = true;
                    return n;
                  })
                }
              >
                {done[current.it.id] ? '✓ Completed' : 'Mark complete'}
              </button>
            </div>

            <h1 className="course-item-title">{current.it.t}</h1>

            {docError && (
              <div className="premium-note">
                <h3>🔒 Paid course article</h3>
                <p>
                  This lesson is part of LeetCode’s paid Interview Crash Course add-on (not
                  included with Premium), so its text isn’t available here.
                </p>
                {problem ? (
                  <p>
                    The exercise for this lesson is available though:{' '}
                    <Link to={`/problems/${problem.slug}`} className="title-link">
                      {problem.id}. {problem.title}
                    </Link>
                  </p>
                ) : (
                  <p className="muted">
                    Original: <a href={`${index.url}${current.ch.id}/`} target="_blank" rel="noreferrer">leetcode.com ↗</a>
                  </p>
                )}
              </div>
            )}

            {current.it.a && !doc && <div className="spinner small-spin" aria-label="Loading article" />}

            {doc && (
              <article className="desc-body course-article" dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.c) }} />
            )}

            {!docError && problem && (
              <div className="practice-card">
                <div className="practice-label">Exercise</div>
                <Link to={`/problems/${problem.slug}`} className="practice-row">
                  <span className="title-link">
                    {problem.paidOnly && <LockGlyph />} {problem.id}. {problem.title}
                  </span>
                  <span className={`pill ${DIFF_CLASS[problem.difficulty]}`}>{problem.difficulty}</span>
                </Link>
                <p className="muted">
                  Solve it in the built-in editor, then mark this item complete.
                </p>
              </div>
            )}

            <div className="detail-nav course-nav">
              {prev ? (
                <button className="btn ghost" onClick={() => go(prev.it.id)}>
                  ← {prev.it.t}
                </button>
              ) : (
                <span />
              )}
              {next ? (
                <button className="btn ghost" onClick={() => go(next.it.id)}>
                  {next.it.t} →
                </button>
              ) : (
                <span />
              )}
            </div>
          </>
        )}
      </section>
    </main>
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
