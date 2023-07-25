import 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    showIf?: boolean;
  }
  interface SVGProps<SVGSVGElement> extends SVGProps<SVGSVGElement> {
    showIf?: boolean;
  }
}