declare module '@asyncapi/react-component/browser/standalone/index.js' {
  interface AsyncApiProps {
    schema: string | object;
    config?: Record<string, unknown>;
  }
  // The UMD bundle exports { render, hydrate, hljs } directly (no default export).
  export function render(props: AsyncApiProps, el: HTMLElement): void;
  export function hydrate(props: AsyncApiProps, el: HTMLElement): void;
}
