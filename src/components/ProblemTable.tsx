import { Link } from 'react-router-dom';
import type { Difficulty, SortDir, SortKey } from '../types';
import type { Problem } from '../types';
import { DIFF_CLASS } from '../lib/utils';

interface Props {
  rows: Problem[];
  isAC: (slug: string) => boolean;
  onToggleAC: (slug: string) => void;
  isFav: (slug: string) => boolean;
  onToggleFav: (slug: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

function CheckIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity={on ? 1 : 0.45}
      />
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

function StarIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
      <path
        d="M12 3.5l2.6 5.4 5.9.7-4.35 4.05 1.13 5.85L12 16.75l-5.28 2.75 1.13-5.85L3.5 9.6l5.9-.7z"
        fill={on ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" className="lock" aria-label="Premium" role="img">
      <rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor" />
      <path d="M8 10V7a4 4 0 118 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function ProblemTable(props: Props) {
  const { rows, isAC, onToggleAC, isFav, onToggleFav, sortKey, sortDir, onSort } = props;

  const th = (key: SortKey, label: string, extra?: string) => (
    <th className={extra}>
      <button className={`th-sort${sortKey === key ? ' on' : ''}`} onClick={() => onSort(key)}>
        {label}
        <span className="arrow">{sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span>
      </button>
    </th>
  );

  return (
    <div className="table-wrap card">
      <table className="problem-table">
        <thead>
          <tr>
            <th className="col-status" aria-label="Status" />
            {th('id', '#', 'col-id')}
            {th('title', 'Title', 'col-title')}
            {th('ac', 'Acceptance', 'col-ac')}
            {th('diff', 'Difficulty', 'col-diff')}
            <th className="col-fav" aria-label="Favorite" />
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const ac = isAC(p.slug);
            const fav = isFav(p.slug);
            return (
              <tr key={p.slug}>
                <td className="col-status">
                  <button
                    className={`status-btn${ac ? ' on' : ''}`}
                    onClick={() => onToggleAC(p.slug)}
                    aria-label={ac ? 'Mark as unsolved' : 'Mark as solved'}
                    aria-pressed={ac}
                  >
                    <CheckIcon on={ac} />
                  </button>
                </td>
                <td className="col-id">{p.id}</td>
                <td className="col-title">
                  <Link to={`/problems/${p.slug}`} className="title-link">
                    {p.paidOnly && <LockIcon />}
                    <span>{p.title}</span>
                  </Link>
                </td>
                <td className="col-ac">{p.ac == null ? '—' : `${p.ac}%`}</td>
                <td className="col-diff">
                  <span className={`pill ${DIFF_CLASS[p.difficulty as Difficulty]}`}>
                    {p.difficulty}
                  </span>
                </td>
                <td className="col-fav">
                  <button
                    className={`star-btn${fav ? ' on' : ''}`}
                    onClick={() => onToggleFav(p.slug)}
                    aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={fav}
                  >
                    <StarIcon on={fav} />
                  </button>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="empty-state">
                No problems match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
