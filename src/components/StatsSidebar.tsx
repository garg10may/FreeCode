import type { CountsMap, DiffCount } from '../lib/utils';
import { DIFF_CLASS } from '../lib/utils';
import type { Difficulty, StatusFilter } from '../types';

const DIFFS: Difficulty[] = ['Easy', 'Medium', 'Hard'];

interface Props {
  counts: CountsMap | null;
  favCount: number;
  active: StatusFilter;
  onPick: (status: StatusFilter) => void;
}

function Bar({ label, data }: { label: Difficulty; data: DiffCount }) {
  const pct = data.total ? Math.round((data.done / data.total) * 100) : 0;
  return (
    <div className="prog-row">
      <span className={`pill ${DIFF_CLASS[label]}`}>{label}</span>
      <div className="bar-track">
        <div className={`bar-fill ${DIFF_CLASS[label]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="prog-num">
        {data.done}/{data.total}
      </span>
    </div>
  );
}

export default function StatsSidebar({ counts, favCount, active, onPick }: Props) {
  const all = counts?.all ?? { done: 0, total: 0 };
  const pct = all.total ? Math.round((all.done / all.total) * 100) : 0;

  const items: { key: StatusFilter; label: string; count: number }[] = [
    { key: '', label: 'All Problems', count: all.total },
    { key: 'fav', label: 'Favorites', count: favCount },
    { key: 'ac', label: 'Solved', count: all.done },
    { key: 'not', label: 'Unsolved', count: Math.max(0, all.total - all.done) },
  ];

  return (
    <aside className="sidebar">
      <section className="card">
        <h3 className="side-title">Progress</h3>
        <div className="prog-headline">
          <span className="prog-big">
            {all.done}/{all.total}
          </span>
          <span className="prog-pct">solved</span>
        </div>
        <div className="bar-track main">
          <div className="bar-fill accent" style={{ width: `${pct}%` }} />
        </div>
        <div className="prog-rows">
          {counts && DIFFS.map((d) => <Bar key={d} label={d} data={counts[d]} />)}
        </div>
      </section>

      <section className="card">
        <h3 className="side-title">Lists</h3>
        <ul className="side-list">
          {items.map((it) => (
            <li key={it.key}>
              <button
                className={`side-item${active === it.key ? ' on' : ''}`}
                onClick={() => onPick(it.key)}
              >
                <span>{it.label}</span>
                <span className="side-count">{it.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
