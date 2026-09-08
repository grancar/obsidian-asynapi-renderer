import { describe, it, expect } from 'vitest';
import { isAsyncApiSource, parseBlockBody } from '../src/detect';

describe('isAsyncApiSource', () => {
  it('accepts a YAML spec with a top-level asyncapi key', () => {
    expect(isAsyncApiSource('asyncapi: 3.0.0\ninfo:\n  title: x\n')).toBe(true);
  });

  it('accepts a YAML spec preceded by a comment, with a quoted key', () => {
    expect(isAsyncApiSource("# streetlights\n'asyncapi': '2.6.0'\n")).toBe(true);
  });

  it('accepts pretty-printed and single-line JSON', () => {
    expect(isAsyncApiSource('{\n  "asyncapi": "3.0.0",\n  "info": {}\n}')).toBe(true);
    expect(isAsyncApiSource('{"asyncapi":"3.0.0","info":{}}')).toBe(true);
  });

  it('rejects OpenAPI, empty text and a commented-out key', () => {
    expect(isAsyncApiSource('openapi: 3.1.0\ninfo: {}\n')).toBe(false);
    expect(isAsyncApiSource('')).toBe(false);
    expect(isAsyncApiSource('# asyncapi: 3.0.0\nopenapi: 3.1.0\n')).toBe(false);
  });
});

describe('parseBlockBody', () => {
  it('treats a single file: line as a vault path', () => {
    expect(parseBlockBody('file: specs/orders.yaml')).toEqual({ kind: 'file', path: 'specs/orders.yaml' });
    expect(parseBlockBody('\n  file:specs/orders.yaml \n')).toEqual({ kind: 'file', path: 'specs/orders.yaml' });
  });

  it('treats a multi-line body as inline source, unchanged', () => {
    const src = 'asyncapi: 3.0.0\ninfo:\n  title: x\n';
    expect(parseBlockBody(src)).toEqual({ kind: 'inline', source: src });
  });

  it('flags an empty body', () => {
    expect(parseBlockBody('   \n')).toEqual({ kind: 'empty' });
  });
});
