import * as AsyncApiStandalone from '@asyncapi/react-component/browser/standalone/index.js';

/**
 * Render an AsyncAPI document (YAML or JSON text) into `el`.
 * A fresh mount node is created per call because the bundle uses React 18 `createRoot`,
 * which warns when called twice on the same node.
 */
export function renderAsyncApi(el: HTMLElement, source: string): void {
  el.empty();
  const mount = el.createDiv({ cls: 'asyncapi-mount' });
  try {
    AsyncApiStandalone.render({ schema: source }, mount);
  } catch (e) {
    mount.setText(`AsyncAPI render failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}
