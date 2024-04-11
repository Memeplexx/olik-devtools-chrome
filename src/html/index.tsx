import { ButtonHTMLAttributes, ComponentType, ForwardedRef, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes, forwardRef,  } from "react";
import { TypedKeyboardEvent } from "../shared/types";


type ReplaceKeyboardEvents<E extends HTMLElement, A extends HTMLAttributes<E>> = {
  [key in keyof A]: 
    key extends ('onKeyUp' | 'onKeyDown') ? (e: TypedKeyboardEvent<E>) => void 
    : A[key]
};

export type IfProps = { if?: boolean };

export type ButtonProps = ReplaceKeyboardEvents<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>;

export type InputProps = ReplaceKeyboardEvents<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>;

export type TextAreaProps = ReplaceKeyboardEvents<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>;

export type DivProps = ReplaceKeyboardEvents<HTMLDivElement, HTMLAttributes<HTMLDivElement>>;

export type SpanProps = ReplaceKeyboardEvents<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>;

export type ElementProps = ReplaceKeyboardEvents<HTMLElement, HTMLAttributes<HTMLElement>>;

const stripUnKnownProps = function <P extends { children?: ReactNode } & IfProps>(props: P) {
  return (Object.keys(props) as Array<keyof P>)
    .reduce((acc, key) => { if (key !== 'if' && key !== 'children') { acc[key] = props[key]; } return acc; }, {} as P);
}

export const possible = {
  div: forwardRef(function Div(
    props: DivProps & IfProps,
    ref?: ForwardedRef<HTMLDivElement>,
  ) {
    return props.if === false ? null : <div ref={ref} {...stripUnKnownProps(props)}>{props.children}</div>;
  }),
  span: forwardRef(function Span(
    props: SpanProps & IfProps,
    ref?: ForwardedRef<HTMLSpanElement>,
  ) {
    return props.if === false ? null : <span ref={ref} {...stripUnKnownProps(props)}>{props.children}</span>;
  }),
  input: forwardRef(function Input(
    props: InputProps & IfProps,
    ref?: ForwardedRef<HTMLInputElement>
  ) {
    return props.if === false ? null : <input ref={ref} {...stripUnKnownProps(props)}>{props.children}</input>;
  }),
  textarea: forwardRef(function Input(
    props: TextAreaProps & IfProps,
    ref?: ForwardedRef<HTMLTextAreaElement>
  ) {
    return props.if === false ? null : <textarea ref={ref} {...stripUnKnownProps(props)}>{props.children}</textarea>;
  }),
  button: forwardRef(function Button(
    props: ButtonProps & IfProps,
    ref?: ForwardedRef<HTMLButtonElement>
  ) {
    return props.if === false ? null : <button ref={ref} {...stripUnKnownProps(props)}>{props.children}</button>;
  }),
  element: function Element<P>(ComponentType: ComponentType<P>) {
    return forwardRef(function Element(
      props: P & { children?: React.ReactNode } & IfProps,
      ref?: ForwardedRef<HTMLElement>
    ) {
      return props.if === false ? null : <ComponentType ref={ref} {...props as P}>{props.children}</ComponentType>;
    });
  },
}
