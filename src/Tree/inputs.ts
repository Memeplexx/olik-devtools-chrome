import { ForwardedRef, useImperativeHandle, useRef, useState } from "react";
import { decisionMap, is, useForwardedRef } from "../shared/functions";
import { NodeType, RenderNodeArgs, RenderedNodeHandle } from "./constants";

export const useInputs = (
  props: RenderNodeArgs,
  forwardedRef: ForwardedRef<RenderedNodeHandle>
) => {
  const ref = useForwardedRef(forwardedRef);
  const keyNodeRef = useRef<HTMLInputElement>(null);
  const valNodeRef = useRef<HTMLInputElement>(null);
  const childNodeRef = useRef<RenderedNodeHandle>(null);
  const prevStateRef = useRef(props.state);
  const valueValue = props.item === null ? 'null' : props.item === undefined ? '' : is.date(props.item) ? props.item.toISOString() : props.item.toString();
  const [state, setState] = useState({
    showOptions: false,
    showArrayOptions: false,
    editObjectKey: false,
    addingNewObject: false,
    keyValue: props.objectKey, 
    valueValue
  });
  if (prevStateRef.current !== props.state) {
    if (state.keyValue !== props.objectKey) {
      setState(s => ({ ...s, keyValue: props.objectKey }));
    }
    if (state.valueValue !== valueValue) {
      setState(s => ({ ...s, valueValue }));
    }
    prevStateRef.current = props.state;
  }
  const isPrimitive = !is.array(props.item) && !is.record(props.item);
  const hasObjectKey = props.objectKey !== undefined;
  const isUnchanged = props.unchanged.includes(props.keyConcat);
  const isContracted = props.contractedKeys.includes(props.keyConcat);
  const isEmpty = is.array(props.item) ? !props.item.length : is.record(props.item) ? !Object.keys(props.item).length : false;
  const isHidden = isUnchanged && props.hideUnchanged;
  const showActionType = props.isTopLevel && !!props.actionType;
  const nodeType = decisionMap([
    [() => is.array(props.item), 'array'],
    [() => is.record(props.item), 'object'],
    [() => is.number(props.item), 'number'],
    [() => is.string(props.item), 'string'],
    [() => is.boolean(props.item), 'boolean'],
    [() => is.date(props.item), 'date'],
    [() => is.null(props.item), 'null'],
    [() => is.undefined(props.item), 'undefined'],
  ]) as NodeType;
  const nodeEl = decisionMap([
    [() => is.null(props.item), () => 'null'],
    [() => is.undefined(props.item), () => ''],
    [() => is.boolean(props.item), () => (props.item as boolean).toString()],
    [() => is.number(props.item), () => (props.item as number).toString()],
    [() => is.string(props.item), () => `"${(props.item as string).toString()}"`],
    [() => is.date(props.item), () => (props.item as Date).toISOString()],
    [() => true, () => props.item],
  ])() as JSX.Element;
  useImperativeHandle(forwardedRef, () => ({
    focusChildKey: () => {
      setState(s => ({ ...s, editObjectKey: true }));
      setTimeout(() => {
        keyNodeRef.current?.focus();
        keyNodeRef.current?.select();
      })
    },
    focusChildValue: () => {
      setTimeout(() => {
        valNodeRef.current?.focus();
      })
    }
  }), []);
  return {
    keyNodeRef,
    valNodeRef,
    childNodeRef,
    ref,
    isPrimitive,
    hasObjectKey,
    isContracted,
    isEmpty,
    isHidden,
    isUnchanged,
    showActionType,
    nodeType,
    nodeEl,
    ...state,
    setState,
  };
}