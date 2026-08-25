import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProblems } from '../lib/problems';
import { useStore } from '../lib/store';
import { pickRandom } from '../lib/utils';

function currentTheme(): 'dark' | 'light' {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export default function Header() {
  const navigate = useNavigate();
  const { problems } = useProblems();
  const { states } = useStore();
  const [theme, setTheme] = useState<'dark' | 'light'>(currentTheme);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('fc:theme', next);
    setTheme(next);
  }, [theme]);

  const onRandom = useCallback(() => {
    if (!problems) return;
    const p = pickRandom(problems, states);
    if (p) navigate(`/problems/${p.slug}`);
  }, [problems, states, navigate]);

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">‹/›</span>
          <span className="brand-name">FreeCode</span>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link active">
            Problems
          </Link>
        </nav>
        <div className="header-actions">
          <button
            className="btn ghost"
            onClick={onRandom}
            disabled={!problems}
            title="Pick a random unsolved free problem"
          >
            Random
          </button>
          <button
            className="btn ghost"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </header>
  );
}
