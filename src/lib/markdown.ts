import { marked } from 'marked';
import katex from 'katex';
import DOMPurify from 'dompurify';

/** Sanitize a trusted-ish HTML fragment (problem statements, chapter blurbs, inline SVG). */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'viewBox', 'preserveAspectRatio', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'font-family', 'dominant-baseline', 'text-anchor', 'marker-end', 'markerWidth', 'markerHeight', 'refX', 'refY', 'orient'],
  });
}

/* ---------------- syntax highlighting (dependency-free) ---------------- */

const KEYWORDS = new Set(
  (
    // JS / TS
    'abstract arguments async await break case catch class const continue debugger default delete do else enum export extends finally for from function get if implements import in instanceof interface let new of package private protected public readonly return set static super switch this throw try typeof var void while with yield as satisfies keyof infer namespace declare type ' +
    // Java
    'boolean byte char double final float goto int long native short synchronized throws transient volatile assert extends implements instanceof null true false var record sealed permits ' +
    // Python
    'and assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield True False None match self ' +
    // Go / C / C++
    'chan defer fallthrough func go goto interface map range select struct switch type bool complex64 complex128 uint int8 int16 int32 int64 uint8 uint16 uint32 uint64 uintptr float32 float64 rune string byte nil true false include define ifndef endif pragma template typename using namespace const constexpr nullptr auto explicit operator virtual override public private protected struct enum union sizeof new delete this template'
  ).split(/\s+/)
);

const LITERALS = new Set(['true', 'false', 'null', 'undefined', 'None', 'True', 'False', 'nil', 'nullptr']);

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Tiny multi-language tokenizer -> colored <span>s. Good enough for editorial code. */
export function highlight(code: string): string {
  const re =
    /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d[\w.]*)|\b([A-Za-z_]\w*)\b|(@\w+)/g;
  let out = '';
  let last = 0;
  for (let m; (m = re.exec(code)); ) {
    out += esc(code.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[1]) out += `<span class="tok-c">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="tok-s">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="tok-n">${esc(m[3])}</span>`;
    else if (m[5]) out += `<span class="tok-t">${esc(m[5])}</span>`;
    else if (m[4]) {
      const w = m[4];
      if (KEYWORDS.has(w)) out += `<span class="tok-k">${esc(w)}</span>`;
      else if (LITERALS.has(w)) out += `<span class="tok-n">${esc(w)}</span>`;
      else if (/^[A-Z]/.test(w)) out += `<span class="tok-t">${esc(w)}</span>`;
      else if (code[m.index + m[0].length] === '(') out += `<span class="tok-f">${esc(w)}</span>`;
      else out += esc(w);
    }
  }
  out += esc(code.slice(last));
  return out;
}

/* ---------------- markdown ---------------- */

const blockMath = {
  name: 'blockMath',
  level: 'block' as const,
  start(src: string) {
    const i = src.indexOf('$$');
    return i === -1 ? undefined : i;
  },
  tokenizer(src: string) {
    // Display math only — two strict shapes:
    //  a) multi-line:  "$$\n … \n$$" (delimiters alone on their lines)
    //  b) single-line: "$$…$$" with nothing after the closer on that line
    // A line like "$$n$$, which…" matches neither (the "," blocks (b)), so it
    // falls through to the paragraph + inline tokenizer instead of lazily
    // swallowing the rest of the document.
    const m =
      /^[ \t]*\$\$[ \t]*\n([\s\S]+?)\n[ \t]*\$\$[ \t]*(?:\n+|$)|^[ \t]*\$\$([^$\n]+?)\$\$[ \t]*(?:\n+|$)/.exec(src);
    if (m) return { type: 'blockMath', raw: m[0], text: (m[1] ?? m[2]).trim() };
    return undefined;
  },
  renderer(token: { text: string }) {
    try {
      return `<div class="math-block">${katex.renderToString(token.text, { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<pre><code>${esc(token.text)}</code></pre>`;
    }
  },
};

const inlineMath = {
  name: 'inlineMath',
  level: 'inline' as const,
  start(src: string) {
    const i = src.indexOf('$');
    return i === -1 ? undefined : i;
  },
  tokenizer(src: string) {
    // LeetCode house style: $$x$$ used inline — may span a single hard-wrap
    // newline ("$$O(n)\n$$"), so the content allows newlines but no '$'.
    let m = /^\$\$([^$]+?)\$\$/.exec(src);
    if (m) return { type: 'inlineMath', raw: m[0], text: m[1].trim() };
    // Classic single-dollar inline math (kept line-bound to avoid currency pairs).
    m = /^\$(\s?[^\s$][^$\n]*?)\$(?!\d)/.exec(src);
    if (m) return { type: 'inlineMath', raw: m[0], text: m[1].trim() };
    return undefined;
  },
  renderer(token: { text: string }) {
    try {
      return katex.renderToString(token.text, { displayMode: false, throwOnError: false });
    } catch {
      return `<code>${esc(token.text)}</code>`;
    }
  },
};

let configured = false;
function configureMarked() {
  if (configured) return;
  configured = true;
  marked.use({
    extensions: [blockMath, inlineMath],
    renderer: {
      code(token: { text?: string; lang?: string }) {
        const code = token.text ?? '';
        return `<pre><code class="hl">${highlight(code)}</code></pre>`;
      },
    },
  });
}

/** LeetCode-flavoured Markdown -> sanitized HTML (fenced code, $math$, [TOC], inline SVG). */
export function renderMarkdown(markdown: string): string {
  configureMarked();
  let s = markdown.replace(/^\[TOC\]\s*$/gm, '');
  // LeetCode slideshow embeds ("!?!../Documents/542.json:960,540!?!") — dead offline
  s = s.replace(/!\?![^\n]*?!\?!/g, '');
  // breaks:false on purpose — LeetCode hard-wraps their markdown source, and
  // soft wraps must flow as spaces (breaks:true would force mid-sentence <br>s).
  const html = marked.parse(s, { async: false, breaks: false }) as string;
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe', 'details', 'summary'],
    ADD_ATTR: [
      'target',
      'frameborder',
      'allow',
      'allowfullscreen',
      'viewBox',
      'preserveAspectRatio',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-dasharray',
      'font-family',
      'dominant-baseline',
      'text-anchor',
      'marker-end',
      'markerWidth',
      'markerHeight',
      'refX',
      'refY',
      'orient',
    ],
  });
}
