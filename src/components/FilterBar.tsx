import { useMemo } from 'react';
import type { RefObject } from 'react';
import { prettyTag } from '../lib/utils';
import type { Difficulty, StatusFilter } from '../types';

export const DIFFS: Difficulty[] = ['Easy', 'Medium', 'Hard'];

interface Props {
  q: string;
  onQ: (q: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  diffs: Difficulty[];
  onToggleDiff: (d: Difficulty) => void;
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
  tag: string;
  onTag: (t: string) => void;
  tags: [string, number][];
  co: string;
  onCo: (c: string) => void;
  companies: [string, string, number][] | null;
  freeOnly: boolean;
  onFreeOnly: (v: boolean) => void;
}

export default function FilterBar(props: Props) {
  const {
    q,
    onQ,
    searchRef,
    diffs,
    onToggleDiff,
    status,
    onStatus,
    tag,
    onTag,
    tags,
    co,
    onCo,
    companies,
    freeOnly,
    onFreeOnly,
  } = props;

  const tagOptions = useMemo(
    () =>
      tags
        .slice()
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([slug, count]) => (
          <option key={slug} value={slug}>
            {prettyTag(slug)} ({count})
          </option>
        )),
    [tags]
  );

  return (
    <div className="filter-bar card">
      <div className="search-wrap">
        <svg className="search-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden>
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
        </svg>
        <input
          ref={searchRef}
          className="search-input"
          type="text"
          placeholder="Search problems (press /)"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onQ('');
          }}
        />
      </div>

      <div className="diff-chips">
        {DIFFS.map((d) => (
          <button
            key={d}
            className={`chip ${d.toLowerCase()}${diffs.includes(d) ? ' on' : ''}`}
            onClick={() => onToggleDiff(d)}
            aria-pressed={diffs.includes(d)}
          >
            {d}
          </button>
        ))}
      </div>

      <select
        className="select"
        value={status}
        onChange={(e) => onStatus(e.target.value as StatusFilter)}
        aria-label="Filter by status"
      >
        <option value="">Status: All</option>
        <option value="ac">Solved</option>
        <option value="not">Unsolved</option>
        <option value="fav">Favorites</option>
      </select>

      <select
        className="select"
        value={tag}
        onChange={(e) => onTag(e.target.value)}
        aria-label="Filter by tag"
      >
        <option value="">All topics</option>
        {tagOptions}
      </select>

      <select
        className="select"
        value={co}
        onChange={(e) => onCo(e.target.value)}
        aria-label="Filter by company"
      >
        <option value="">All companies</option>
        {(companies ?? [])
          .slice()
          .sort((a, b) => b[2] - a[2] || a[1].localeCompare(b[1]))
          .map(([slug, name, count]) => (
            <option key={slug} value={slug}>
              {name} ({count})
            </option>
          ))}
      </select>

      <label className="check">
        <input
          type="checkbox"
          checked={freeOnly}
          onChange={(e) => onFreeOnly(e.target.checked)}
        />
        Hide premium
      </label>
    </div>
  );
}
