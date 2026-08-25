import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import CodeEditor from '../components/CodeEditor';
import { fetchQuestion } from '../lib/api';
import { useProblems } from '../lib/problems';
import { useStore } from '../lib/store';
import { DIFF_CLASS, prettyTag } from '../lib/utils';
import type { QuestionData } from '../types';

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setData(null);
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
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const listSearch = useMemo(() => sessionStorage.getItem('fc:list-search') || '', []);

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

        <div className="desc-body" aria-busy={loading}>
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

          {!loading && !loadError && data && (data.paidOnly || !data.content) && (
            <div className="error-inline">
              <p>
                This is a premium-only problem, so its full statement isn’t publicly available.
              </p>
              <p className="muted">Open it on LeetCode with a subscription to view it.</p>
            </div>
          )}

          {!loading && !loadError && data && data.content && (
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
        </div>

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
