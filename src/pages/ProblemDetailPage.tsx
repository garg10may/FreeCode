import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import CodeEditor from '../components/CodeEditor';
import AiSolution from '../components/AiSolution';
import { fetchQuestion, fetchSolution, fetchAiSolution } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';
import { useProblems } from '../lib/problems';
import { useStore } from '../lib/store';
import { DIFF_CLASS, prettyTag } from '../lib/utils';
import type { CompanyStat, QuestionData, SolutionData, AiSolutionData } from '../types';

export default function ProblemDetailPage() {
  const { slug = '' } = useParams();
  const { problems } = useProblems();
  const store = useStore();

  const meta = useMemo(() => problems?.find((p) => p.slug === slug) ?? null, [problems, slug]);
  const idx = useMemo(
    () => (problems && meta ? problems.indexOf(meta) : -1),
    [problems, meta]
  );
  const prev = idx > 0 ? problems?.[idx - 1] : undefined;
  const next = problems && idx >= 0 && idx < problems.length - 1 ? problems[idx + 1] : undefined;

  const [data, setData] = useState<QuestionData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [solution, setSolution] = useState<SolutionData | null>(null);
  const [solLoading, setSolLoading] = useState(true);
  const [aiSolution, setAiSolution] = useState<AiSolutionData | null>(null);
  const [tab, setTab] = useState<'desc' | 'sol' | 'ai'>('desc');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setData(null);
    setSolution(null);
    setSolLoading(true);
    setAiSolution(null);
    setTab('desc');
    fetchQuestion(slug)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      });
    fetchSolution(slug)
      .then((s) => {
        if (!cancelled) setSolution(s);
      })
      .catch(() => {
        if (!cancelled) setSolution(null);
      })
      .finally(() => {
        if (!cancelled) setSolLoading(false);
      });
    fetchAiSolution(slug)
      .then((s) => {
        if (!cancelled) setAiSolution(s);
      })
      .catch(() => {
        if (!cancelled) setAiSolution(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const listSearch = useMemo(() => sessionStorage.getItem('fc:list-search') || '', []);

  const companyCount = useMemo(() => {
    const cs = data?.cs;
    if (!cs) return 0;
    return cs.a.length + cs.b.length + cs.m.length;
  }, [data]);

  if (problems && !meta) {
    return (
      <main className="container splash">
        <div className="card error-card">
          <h2>Problem not found</h2>
          <p className="muted">
            No problem with slug “{slug}”. <Link to="/">Back to the problem set.</Link>
          </p>
        </div>
      </main>
    );
  }

  if (!problems) {
    return (
      <main className="container splash">
        <div className="spinner" aria-label="Loading" />
      </main>
    );
  }

  const ac = store.isAC(slug);
  const fav = store.isFav(slug);

  return (
    <main className="container detail-layout">
      <section className="detail-left card">
        <div className="detail-head">
          <Link to={`/${listSearch}`} className="back-link" aria-label="Back to problem list">
            ←
          </Link>
          <h2 className="detail-title">
            {meta ? `${meta.id}. ` : ''}
            {(data?.title ?? meta?.title) || '…'}
          </h2>
          {meta && (
            <span className={`pill ${DIFF_CLASS[meta.difficulty]}`}>{meta.difficulty}</span>
          )}
          {meta?.paidOnly && <span className="badge-premium">Premium</span>}
          <button
            className={`btn ghost small${ac ? ' accent' : ''}`}
            onClick={() => store.toggleAC(slug)}
            title="Toggle solved"
          >
            {ac ? '✓ Solved' : 'Mark solved'}
          </button>
          <button
            className={`star-btn big${fav ? ' on' : ''}`}
            onClick={() => store.toggleFav(slug)}
            aria-pressed={fav}
            aria-label="Toggle favorite"
          >
            ★
          </button>
        </div>

        <div className="tag-row">
          {meta?.freq != null && (
            <span className="freq-badge" title="LeetCode premium frequency score">
              Freq {meta.freq}
            </span>
          )}
          {(data?.topicTags.length ? data.topicTags : meta?.tags.map((t) => ({ name: prettyTag(t), slug: t })) ?? []).map(
            (t) => (
              <Link key={t.slug} to={`/?tag=${t.slug}`} className="tag-chip">
                {t.name}
              </Link>
            )
          )}
          <a
            className="ext-link"
            href={`https://leetcode.com/problems/${slug}/description/`}
            target="_blank"
            rel="noreferrer"
          >
            View on LeetCode ↗
          </a>
        </div>

        <div className="tab-row">
          <button
            className={`tab-btn${tab === 'desc' ? ' on' : ''}`}
            onClick={() => setTab('desc')}
          >
            Description
          </button>
          <button
            className={`tab-btn${tab === 'sol' ? ' on' : ''}`}
            onClick={() => setTab('sol')}
            disabled={!solution && solLoading === false}
            title={solution ? 'Official editorial' : 'No official editorial available'}
          >
            Editorial
          </button>
          {!solution && aiSolution && (
            <button
              className={`tab-btn ai-tab${tab === 'ai' ? ' on' : ''}`}
              onClick={() => setTab('ai')}
              title="AI-generated editorial"
            >
              ✦ AI Explains
            </button>
          )}
        </div>

        <div
          className="desc-body"
          aria-busy={loading || (tab === 'sol' && solLoading)}
        >
          {tab === 'desc' ? (
            <>
              {loading && <div className="spinner small-spin" aria-label="Loading description" />}

              {!loading && loadError && (
                <div className="error-inline">
                  <p>Couldn’t load this problem: {loadError}</p>
                  <p className="muted">
                    The local dataset may be incomplete — run{' '}
                    <code>npm run fetch:descriptions</code> to (re)download statements.
                  </p>
                </div>
              )}

              {!loading && !loadError && !data?.content && (
                <div className="premium-note">
                  <h3>🔒 Premium problem</h3>
                  <p>This problem is part of LeetCode’s paid subscription and has no public statement.</p>
                  <p className="muted">
                    Everything else still works here: take notes, use the editor, and track it as
                    solved.
                  </p>
                </div>
              )}

              {!loading && !loadError && data?.content && (
                <>
                  <div dangerouslySetInnerHTML={{ __html: sanitize(data.content) }} />
                  {data.hints.length > 0 && (
                    <div className="hints">
                      {data.hints.map((h, i) => (
                        <details key={i} className="hint">
                          <summary>Hint {i + 1}</summary>
                          <div dangerouslySetInnerHTML={{ __html: sanitize(h) }} />
                        </details>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : tab === 'sol' ? (
            <>
              {solLoading && <div className="spinner small-spin" aria-label="Loading editorial" />}
              {!solLoading && !solution && (
                <p className="muted">No official editorial for this problem.</p>
              )}
              {!solLoading && solution && (
                <div dangerouslySetInnerHTML={{ __html: renderEditorial(solution.c ?? '') }} />
              )}
            </>
          ) : (
            aiSolution && <AiSolution data={aiSolution} />
          )}
        </div>

        <details className="notes similar-notes">
          <summary className="notes-label">
            Similar Problems
            {data?.similar && data.similar.length > 0 && (
              <span className="side-count">({data.similar.length})</span>
            )}
          </summary>
          {data?.similar && data.similar.length > 0 ? (
            <div className="similar-list">
              {data.similar.map((sp) => (
                <Link key={sp.s} to={`/problems/${sp.s}`} className="similar-item">
                  <span className="similar-title">
                    {sp.p && <LockGlyph />} {sp.t}
                  </span>
                  <span className={`pill ${DIFF_CLASS[sp.d]}`}>{sp.d}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">—</p>
          )}
        </details>

        <details className="notes company-notes">
          <summary className="notes-label">
            Companies
            {companyCount > 0 && <span className="side-count">({companyCount})</span>}
          </summary>
          {companyCount > 0 ? (
            <div className="company-buckets">
              {BUCKETS.map(({ key, label }) => {
                const list = data?.cs?.[key] ?? [];
                if (!list.length) return null;
                return (
                  <div key={key} className="company-bucket">
                    <div className="bucket-label">{label}</div>
                    <div className="similar-list company-list">
                      {list.map((c: CompanyStat) => (
                        <Link key={c.slug} to={`/?co=${c.slug}`} className="company-chip">
                          {c.name}
                          <span className="company-count">{c.n}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted">No company data</p>
          )}
        </details>

        <div className="notes">
          <label className="notes-label" htmlFor="notes-ta">
            Notes
          </label>
          <textarea
            id="notes-ta"
            value={store.getNote(slug)}
            onChange={(e) => store.setNote(slug, e.target.value)}
            placeholder="Approach, complexity, gotchas… (saved automatically)"
          />
        </div>

        <div className="detail-nav">
          {prev ? (
            <Link to={`/problems/${prev.slug}`} className="btn ghost">
              ← {prev.id}. {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/problems/${next.slug}`} className="btn ghost">
              {next.id}. {next.title} →
            </Link>
          )}
        </div>
      </section>

      <aside className="detail-right">
        <CodeEditor slug={slug} metaData={data?.metaData ?? null} />
      </aside>
    </main>
  );
}

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

const BUCKETS: { key: 'a' | 'b' | 'm'; label: string }[] = [
  { key: 'a', label: '0 - 3 months' },
  { key: 'b', label: '0 - 6 months' },
  { key: 'm', label: '6 months ago' },
];

/** Editorial content is Markdown with embedded HTML, Vimeo cards and $math$. */
function renderEditorial(markdown: string): string {
  return renderMarkdown(markdown);
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" className="lock" aria-label="Premium" role="img">
      <rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor" />
      <path d="M8 10V7a4 4 0 118 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
