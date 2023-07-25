import React from "react";


export const Div = React.forwardRef(function Div(
  { children, showIf, ...props }:  React.HTMLAttributes<HTMLDivElement>,
  ref?: React.ForwardedRef<HTMLDivElement>
) {
  return showIf === false ? null : <div ref={ref} {...props}>{children}</div>;
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
