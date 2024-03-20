import { ButtonHTMLAttributes, ForwardedRef, HTMLAttributes, InputHTMLAttributes, forwardRef,  } from "react";



export const possible = {
  div: forwardRef(function Div(
    { children, showIf, ...props }: HTMLAttributes<HTMLDivElement>,
    ref?: ForwardedRef<HTMLDivElement>,
  ) {
    return showIf === false ? null : <div ref={ref} {...props}>{children}</div>;
  }),
  span: forwardRef(function Span(
    { children, showIf, ...props }: HTMLAttributes<HTMLSpanElement>,
    ref?: ForwardedRef<HTMLSpanElement>,
  ) {
    return showIf === false ? null : <span ref={ref} {...props}>{children}</span>;
  }),
  input: forwardRef(function Input(
    { children, showIf, ...props }: InputHTMLAttributes<HTMLInputElement>,
    ref?: ForwardedRef<HTMLInputElement>
  ) {
    return showIf === false ? null : <input ref={ref} {...props}>{children}</input>;
  }),
  button: forwardRef(function Button(
    { children, showIf, ...props }: ButtonHTMLAttributes<HTMLButtonElement>,
    ref?: ForwardedRef<HTMLButtonElement>
  ) {
    return showIf === false ? null : <button ref={ref} {...props}>{children}</button>;
  }),
}
