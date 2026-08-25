import { useEffect, useMemo, useRef, useState } from 'react';
import { LANGUAGES, makeStub } from '../lib/stubs';
import type { LangId } from '../lib/stubs';
import { useStore } from '../lib/store';

interface Props {
  slug: string;
  metaData: string | null;
}

export default function CodeEditor({ slug, metaData }: Props) {
  const store = useStore();
  const [lang, setLang] = useState<LangId>(() => {
    const saved = localStorage.getItem('fc:lang') as LangId | null;
    return saved && LANGUAGES.some((l) => l.id === saved) ? saved : 'cpp';
  });
  const [copied, setCopied] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef<string>('');

  const key = `${slug}:${lang}`;
  const value = store.getCode(key) ?? '';

  // Seed a fresh editor with a LeetCode-style stub once metadata is available.
  useEffect(() => {
    if (seededRef.current === key + '|' + String(metaData)) return;
    if (!metaData) return;
    if (store.getCode(key) !== undefined) {
      seededRef.current = key + '|' + String(metaData);
      return;
    }
    store.setCode(key, makeStub(lang, metaData));
    seededRef.current = key + '|' + String(metaData);
  }, [key, metaData, lang, store]);

  const changeLang = (next: LangId) => {
    setLang(next);
    localStorage.setItem('fc:lang', next);
  };

  const onChange = (v: string) => store.setCode(key, v);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart, selectionEnd } = ta;
      const next = value.slice(0, selectionStart) + '    ' + value.slice(selectionEnd);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 4;
      });
    }
  };

  const onScroll = () => {
    if (taRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  const reset = () => {
    store.setCode(key, makeStub(lang, metaData));
  };

  const lineCount = useMemo(() => Math.max(value.split('\n').length, 12), [value]);

  return (
    <div className="editor card">
      <div className="editor-toolbar">
        <select
          className="select lang-select"
          value={lang}
          onChange={(e) => changeLang(e.target.value as LangId)}
          aria-label="Language"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
        <div className="editor-actions">
          <span className={`copy-toast${copied ? ' show' : ''}`}>Copied</span>
          <button className="btn ghost small" onClick={reset}>
            Reset
          </button>
          <button className="btn ghost small" onClick={copy}>
            Copy
          </button>
        </div>
      </div>
      <div className="editor-body">
        <div className="gutter" ref={gutterRef} aria-hidden>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={taRef}
          className="code-area"
          value={value}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
          placeholder="Write your solution here…"
        />
      </div>
    </div>
  );
}
