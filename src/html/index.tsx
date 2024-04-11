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
  div: forwardRef(function(
    props: DivProps & IfProps,
    ref?: ForwardedRef<HTMLDivElement>,
  ) {
    if (props.if === false) return null;
    return <div ref={ref} {...stripUnKnownProps(props)}>{props.children}</div>;
  }),
  span: forwardRef(function(
    props: SpanProps & IfProps,
    ref?: ForwardedRef<HTMLSpanElement>,
  ) {
    if (props.if === false) return null;
    return <span ref={ref} {...stripUnKnownProps(props)}>{props.children}</span>;
  }),
  input: forwardRef(function(
    props: InputProps & IfProps,
    ref?: ForwardedRef<HTMLInputElement>
  ) {
    if (props.if === false) return null;
    return <input ref={ref} {...stripUnKnownProps(props)}>{props.children}</input>;
  }),
  textarea: forwardRef(function(
    props: TextAreaProps & IfProps,
    ref?: ForwardedRef<HTMLTextAreaElement>
  ) {
    if (props.if === false) return null;
    return <textarea ref={ref} {...stripUnKnownProps(props)}>{props.children}</textarea>;
  }),
  button: forwardRef(function(
    props: ButtonProps & IfProps,
    ref?: ForwardedRef<HTMLButtonElement>
  ) {
    if (props.if === false) return null;
    return <button ref={ref} {...stripUnKnownProps(props)}>{props.children}</button>;
  }),
  element: function Element<P>(ComponentType: ComponentType<P>) {
    return forwardRef(function(
      props: P & { children?: React.ReactNode } & IfProps,
      ref?: ForwardedRef<HTMLElement>
    ) {
      if (props.if === false) return null;
      return <ComponentType ref={ref} {...stripUnKnownProps(props)}>{props.children}</ComponentType>;
    });
  },
}
