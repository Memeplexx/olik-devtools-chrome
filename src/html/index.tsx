import React from "react";


export const Div = React.forwardRef(function Div(
  { inside, showIf, ...props }: { inside: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>,
  ref?: React.ForwardedRef<HTMLDivElement>
) {
  return showIf === false ? null : <div ref={ref} {...props}>{inside}</div>;
});

export const Button = React.forwardRef(function Button(
  { inside, showIf, ...props }: { inside: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>,
  ref?: React.ForwardedRef<HTMLButtonElement>
) {
  return showIf === false ? null : <button ref={ref} {...props}>{inside}</button>;
});

export const Pre = React.forwardRef(function Pre(
  { inside, showIf, ...props }: { inside: React.ReactNode } & React.HTMLAttributes<HTMLPreElement>,
  ref?: React.ForwardedRef<HTMLPreElement>
) {
  return showIf === false ? null : <pre ref={ref} {...props}>{inside}</pre>;
});
