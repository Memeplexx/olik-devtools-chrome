import { ButtonHTMLAttributes, ComponentType, ForwardedRef, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef,  } from "react";
import { TypedKeyboardEvent } from "../shared/functions";


type ReplaceKeyboardEvents<E extends HTMLElement, A extends HTMLAttributes<E>> = {
  [key in keyof A]: 
    key extends ('onKeyUp' | 'onKeyDown') ? (e: TypedKeyboardEvent<E>) => void 
    : A[key]
};

export type ButtonProps = ReplaceKeyboardEvents<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>;

export type InputProps = ReplaceKeyboardEvents<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>;

export type TextAreaProps = ReplaceKeyboardEvents<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>;

export type DivProps = ReplaceKeyboardEvents<HTMLDivElement, HTMLAttributes<HTMLDivElement>>;

export type SpanProps = ReplaceKeyboardEvents<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>;

export type ElementProps = ReplaceKeyboardEvents<HTMLElement, HTMLAttributes<HTMLElement>>;

export const possible = {
  div: forwardRef(function Div(
    { children, showIf, ...props }: DivProps,
    ref?: ForwardedRef<HTMLDivElement>,
  ) {
    return showIf === false ? null : <div ref={ref} {...props}>{children}</div>;
  }),
  span: forwardRef(function Span(
    { children, showIf, ...props }: SpanProps,
    ref?: ForwardedRef<HTMLSpanElement>,
  ) {
    return showIf === false ? null : <span ref={ref} {...props}>{children}</span>;
  }),
  input: forwardRef(function Input(
    { children, showIf, ...props }: InputProps,
    ref?: ForwardedRef<HTMLInputElement>
  ) {
    return showIf === false ? null : <input ref={ref} {...props}>{children}</input>;
  }),
  textarea: forwardRef(function Input(
    { children, showIf, ...props }: TextAreaProps,
    ref?: ForwardedRef<HTMLTextAreaElement>
  ) {
    return showIf === false ? null : <textarea ref={ref} {...props}>{children}</textarea>;
  }),
  button: forwardRef(function Button(
    { children, showIf, ...props }: ButtonProps,
    ref?: ForwardedRef<HTMLButtonElement>
  ) {
    return showIf === false ? null : <button ref={ref} {...props}>{children}</button>;
  }),
  element: function Element<P>(ComponentType: ComponentType<P>) {
    return forwardRef(function Element(
      { children, showIf, ...props }: P & { showIf?: boolean, children?: React.ReactNode },
      ref?: ForwardedRef<HTMLElement>
    ) {
      return showIf === false ? null : <ComponentType ref={ref} {...props as P}>{children}</ComponentType>;
    });
  }
}
