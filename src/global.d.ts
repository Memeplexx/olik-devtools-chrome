import 'react';

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: unknown }>;

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    showIf?: boolean;
  }
  interface SVGProps<SVGSVGElement> extends SVGProps<SVGSVGElement> {
    showIf?: boolean;
  }
  namespace JSX {
    interface IntrinsicElements {
      ['app-date-picker']: { value: string, ref: React.RefObject<HTMLElement> };
    }
  }
}
