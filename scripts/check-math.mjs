// Mirrors src/lib/markdown.ts config (without DOMPurify) and validates every lesson renders cleanly.
import { marked } from 'marked';
import katex from 'katex';
import fs from 'node:fs';
import path from 'node:path';

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const blockMath = {
  name: 'blockMath',
  level: 'block',
  start(src) {
    const i = src.indexOf('$$');
    return i === -1 ? undefined : i;
  },
  tokenizer(src) {
    const m =
      /^[ \t]*\$\$[ \t]*\n([\s\S]+?)\n[ \t]*\$\$[ \t]*(?:\n+|$)|^[ \t]*\$\$([^$\n]+?)\$\$[ \t]*(?:\n+|$)/.exec(src);
    if (m) return { type: 'blockMath', raw: m[0], text: (m[1] ?? m[2]).trim() };
  },
  renderer(token) {
    try {
      return `<div class="math-block">${katex.renderToString(token.text, { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<pre><code>${esc(token.text)}</code></pre>`;
    }
  },
};
const inlineMath = {
  name: 'inlineMath',
  level: 'inline',
  start(src) {
    const i = src.indexOf('$');
    return i === -1 ? undefined : i;
  },
  tokenizer(src) {
    let m = /^\$\$([^$]+?)\$\$/.exec(src);
    if (m) return { type: 'inlineMath', raw: m[0], text: m[1].trim() };
    m = /^\$(\s?[^\s$][^$\n]*?)\$(?!\d)/.exec(src);
    if (m) return { type: 'inlineMath', raw: m[0], text: m[1].trim() };
  },
  renderer(token) {
    try {
      return katex.renderToString(token.text, { displayMode: false, throwOnError: false });
    } catch {
      return `<code>${esc(token.text)}</code>`;
    }
  },
};
marked.use({
  extensions: [blockMath, inlineMath],
  renderer: {
    code(token) {
      return `<pre><code class="hl">CODE(${token.lang})</code></pre>`;
    },
  },
});

const dir = 'public/data/course';
let bad = 0;
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
for (const f of files) {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const html = marked.parse(doc.c, { async: false, breaks: true });

  // strip code spans/blocks before scanning for stray $$ (dollar signs are legal in code)
  const noCode = html.replace(/<pre>[\s\S]*?<\/pre>|<code>[\s\S]*?<\/code>/g, '');
  const strayDollars = (noCode.match(/\$\$/g) || []).length;
  const katexErrors = (html.match(/katex-error/g) || []).length;
  const rawFences = (noCode.match(/```/g) || []).length;

  if (strayDollars || katexErrors || rawFences) {
    bad++;
    console.log(
      `${f.padEnd(12)} stray$$:${strayDollars}  katexErr:${katexErrors}  rawFences:${rawFences}`
    );
    const i = noCode.indexOf('$$');
    if (i !== -1) console.log('   context:', noCode.slice(Math.max(0, i - 60), i + 60).replace(/\n/g, ' '));
  }
}
console.log(`\nchecked ${files.length} lessons, problems: ${bad}`);
