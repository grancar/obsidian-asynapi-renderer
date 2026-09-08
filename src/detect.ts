export const SPEC_EXTENSIONS = ['yaml', 'yml', 'json'] as const;

// ponytail: regex sniff instead of a YAML parse. Ceiling: an indented `asyncapi:` key nested
// inside a non-AsyncAPI document is a false positive. Upgrade path: js-yaml load of the first document.
const ASYNCAPI_KEY = /^\s*\{?\s*["']?asyncapi["']?\s*:/m;

export function isAsyncApiSource(text: string): boolean {
  return ASYNCAPI_KEY.test(text);
}

export type BlockBody =
  | { kind: 'inline'; source: string }
  | { kind: 'file'; path: string }
  | { kind: 'empty' };

const FILE_REF = /^file:\s*(.+)$/; // no `m` flag: only matches when the whole trimmed body is one line

export function parseBlockBody(body: string): BlockBody {
  const trimmed = body.trim();
  if (!trimmed) return { kind: 'empty' };
  const match = FILE_REF.exec(trimmed);
  if (match) return { kind: 'file', path: match[1].trim() };
  return { kind: 'inline', source: body };
}
