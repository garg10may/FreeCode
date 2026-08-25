export type LangId = 'cpp' | 'java' | 'python' | 'javascript' | 'typescript' | 'go';

export const LANGUAGES: { id: LangId; label: string }[] = [
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python3' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'go', label: 'Go' },
];

type Node =
  | { k: 'scalar'; name: string }
  | { k: 'arr'; of: Node }
  | { k: 'list'; of: Node };

function parseType(input: string): Node {
  const s = input.trim();

  const listMatch = s.match(/^List\s*<(.+)>$/i) || s.match(/^List\[(.+)\]$/i);
  if (listMatch) return { k: 'list', of: parseType(listMatch[1]) };

  let core = s;
  let dims = 0;
  while (core.endsWith('[]')) {
    dims++;
    core = core.slice(0, -2);
  }
  if (dims > 0 && core) {
    let node: Node = parseType(core);
    for (let i = 0; i < dims; i++) node = { k: 'arr', of: node };
    return node;
  }

  return { k: 'scalar', name: s };
}

type ScalarMap = Record<string, string>;

const SCALARS: Record<LangId, ScalarMap> = {
  cpp: {
    integer: 'int',
    int: 'int',
    long: 'long long',
    string: 'std::string',
    str: 'std::string',
    boolean: 'bool',
    bool: 'bool',
    double: 'double',
    float: 'double',
    char: 'char',
    character: 'char',
    void: 'void',
  },
  java: {
    integer: 'int',
    int: 'int',
    long: 'long',
    string: 'String',
    str: 'String',
    boolean: 'boolean',
    bool: 'boolean',
    double: 'double',
    float: 'double',
    char: 'char',
    character: 'char',
    void: 'void',
  },
  python: {
    integer: 'int',
    int: 'int',
    long: 'int',
    string: 'str',
    str: 'str',
    boolean: 'bool',
    bool: 'bool',
    double: 'float',
    float: 'float',
    char: 'str',
    character: 'str',
    void: 'None',
  },
  javascript: {
    integer: 'number',
    int: 'number',
    long: 'number',
    string: 'string',
    str: 'string',
    boolean: 'boolean',
    bool: 'boolean',
    double: 'number',
    float: 'number',
    char: 'string',
    character: 'string',
    void: 'void',
  },
  typescript: {
    integer: 'number',
    int: 'number',
    long: 'number',
    string: 'string',
    str: 'string',
    boolean: 'boolean',
    bool: 'boolean',
    double: 'number',
    float: 'number',
    char: 'string',
    character: 'string',
    void: 'void',
  },
  go: {
    integer: 'int',
    int: 'int',
    long: 'int64',
    string: 'string',
    str: 'string',
    boolean: 'bool',
    bool: 'bool',
    double: 'float64',
    float: 'float64',
    char: 'byte',
    character: 'byte',
    void: '',
  },
};

function wrapArray(t: string, lang: LangId): string {
  switch (lang) {
    case 'cpp':
      return `std::vector<${t}>`;
    case 'java':
      return `${t}[]`;
    case 'python':
      return `List[${t}]`;
    case 'go':
      return `[]${t}`;
    default:
      return `${t}[]`;
  }
}

function wrapList(t: string, lang: LangId): string {
  switch (lang) {
    case 'cpp':
      return `std::vector<${t}>`;
    case 'java':
      return `List<${t}>`;
    case 'python':
      return `List[${t}]`;
    case 'go':
      return `[]${t}`;
    default:
      return `${t}[]`;
  }
}

function typeStr(raw: string, lang: LangId): string {
  const node = parseType(raw);
  const render = (n: Node): string => {
    if (n.k === 'arr') return wrapArray(render(n.of), lang);
    if (n.k === 'list') return wrapList(render(n.of), lang);
    const map = SCALARS[lang];
    return map[n.name.toLowerCase()] ?? n.name;
  };
  return render(node);
}

const FALLBACKS: Record<LangId, string> = {
  cpp: '// Write your solution here\n',
  java: '// Write your solution here\n',
  python: '# Write your solution here\n',
  javascript: '// Write your solution here\n',
  typescript: '// Write your solution here\n',
  go: '// Write your solution here\n',
};

interface MetaParam {
  name: string;
  type: string;
}
interface MetaData {
  name: string;
  params?: MetaParam[];
  return?: { type: string };
  manual?: boolean;
}

/** Generate a LeetCode-style starting snippet from problem metaData. */
export function makeStub(lang: LangId, metaData: string | null): string {
  let meta: MetaData | null = null;
  try {
    const parsed = JSON.parse(metaData || 'null') as MetaData | null;
    if (parsed && typeof parsed.name === 'string' && parsed.name && !parsed.manual) meta = parsed;
  } catch {
    /* malformed metadata */
  }
  if (!meta) return FALLBACKS[lang];

  const params = (meta.params || []).map((p) => ({
    name: p.name,
    type: typeStr(p.type, lang),
  }));
  const retRaw = meta.return?.type ? typeStr(meta.return.type, lang) : '';
  const fnName = meta.name;

  switch (lang) {
    case 'python': {
      const args = params.map((p) => `, ${p.name}: ${p.type}`).join('');
      return `class Solution:\n    def ${fnName}(self${args}) -> ${retRaw || 'None'}:\n` + `        pass\n`;
    }
    case 'cpp': {
      const args = params.map((p) => `${p.type} ${p.name}`).join(', ');
      return `class Solution {\npublic:\n    ${retRaw} ${fnName}(${args}) {\n        \n    }\n};\n`;
    }
    case 'java': {
      const args = params.map((p) => `${p.type} ${p.name}`).join(', ');
      return `class Solution {\n    public ${retRaw} ${fnName}(${args}) {\n        \n    }\n}\n`;
    }
    case 'javascript': {
      const args = params.map((p) => p.name).join(', ');
      return `var ${fnName} = function(${args}) {\n    \n};\n`;
    }
    case 'typescript': {
      const args = params.map((p) => `${p.name}: ${p.type}`).join(', ');
      const suffix = retRaw && retRaw !== 'void' ? `: ${retRaw}` : '';
      return `function ${fnName}(${args})${suffix} {\n    \n}\n`;
    }
    case 'go': {
      const args = params.map((p) => `${p.name} ${p.type}`).join(', ');
      const ret = retRaw ? ` ${retRaw}` : '';
      return `func ${fnName}(${args})${ret} {\n    \n}\n`;
    }
  }
}
