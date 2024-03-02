import React, { Fragment, ReactNode } from "react";


export const Div = React.forwardRef(function Div(
  { children, showIf, ...props }:  React.HTMLAttributes<HTMLDivElement>,
  ref?: React.ForwardedRef<HTMLDivElement>
) {
  return showIf === false ? null : <div ref={ref} {...props}>{children}</div>;
});

export const Span = React.forwardRef(function Span(
  { children, showIf, ...props }:  React.HTMLAttributes<HTMLSpanElement>,
  ref?: React.ForwardedRef<HTMLSpanElement>
) {
  return showIf === false ? null : <span ref={ref} {...props}>{children}</span>;
});

export const Button = React.forwardRef(function Button(
  { children, showIf, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>,
  ref?: React.ForwardedRef<HTMLButtonElement>
) {
  return showIf === false ? null : <button ref={ref} {...props}>{children}</button>;
});

export const Pre = React.forwardRef(function Pre(
  { children, showIf, ...props }: React.HTMLAttributes<HTMLPreElement>,
  ref?: React.ForwardedRef<HTMLPreElement>
) {
  return showIf === false ? null : <pre ref={ref} {...props}>{children}</pre>;
});

export const Svg = React.forwardRef(function Svg(
  { children, showIf, ...props }: React.SVGProps<SVGSVGElement, SVGSVGElement>,
  ref?: React.ForwardedRef<SVGSVGElement>
) {
  return showIf === false ? null : <svg ref={ref} {...props}>{children}</svg>;
});

export const Frag = ({ showIf, children }: { showIf: boolean, children?: ReactNode }) => {
  return showIf === false ? null : <Fragment children={children} />
}
