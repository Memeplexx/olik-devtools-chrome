import { ReactNode, useMemo, useRef } from "react";
import { InputValue, ValueType } from "../input/constants";
import { is, useRecord } from "../shared/functions";
import { NodeType, RenderNodeArgs, State } from "./constants";

export const useInputs = (
  props: RenderNodeArgs,
) => {
  const state = useLocalState(props);
  const derivedState = useDerivedState(props);
  useValueUpdater(props, state);
  return {
    ...state,
    ...derivedState,
  };
}

export const useLocalState = (
  props: RenderNodeArgs,
) => {
  const record = useRecord({
    showOptions: false,
    showArrayOptions: false,
    isEditingObjectKey: false,
    isShowingTextArea: false,
    key: '',
    value: props.item as InputValue,
    type: (() => {
      if (is.number(props.item)) return 'number';
      if (is.string(props.item)) return 'string';
      if (is.boolean(props.item)) return 'boolean';
      if (is.date(props.item)) return 'date';
      if (is.null(props.item)) return 'null';
      if (is.undefined(props.item)) return 'undefined';
      return 'string';
    })() as ValueType,
  });
  return {
    ...record,
    keyNodeRef: useRef<HTMLInputElement>(null),
  };
}

const useDerivedState = (
  props: RenderNodeArgs,
) => {
  return {
    isPrimitive: !is.array(props.item) && !is.record(props.item),
    hasObjectKey: props.objectKey !== undefined,
    showActionType: props.isTopLevel && !!props.actionType,
    isUnchanged: useMemo(() => {
      return props.unchanged.includes(props.keyConcat);
    }, [props.keyConcat, props.unchanged]),
    isContracted: useMemo(() => {
      return props.contractedKeys.includes(props.keyConcat);
    }, [props.contractedKeys, props.keyConcat]),
    isHidden: useMemo(() => {
      return props.unchanged.includes(props.keyConcat) && props.hideUnchanged;
    }, [props.hideUnchanged, props.keyConcat, props.unchanged]),
    isEmpty: useMemo(() => {
      if (is.array(props.item)) return !props.item.length;
      if (is.record(props.item)) return !Object.keys(props.item).length;
      return false;
    }, [props.item]),
    nodeType: useMemo(() => {
      if (is.array(props.item)) return 'array';
      if (is.record(props.item)) return 'object';
      if (is.number(props.item)) return 'number';
      if (is.string(props.item)) return 'string';
      if (is.boolean(props.item)) return 'boolean';
      if (is.date(props.item)) return 'date';
      if (is.null(props.item)) return 'null';
      if (is.undefined(props.item)) return 'undefined';
      return 'unknown';
    }, [props.item]) as NodeType,
    nodeEl: useMemo(() => {
      if (is.null(props.item)) return 'null';
      if (is.undefined(props.item)) return '';
      if (is.boolean(props.item)) return props.item.toString();
      if (is.number(props.item)) return props.item.toString();
      if (is.string(props.item)) return `"${props.item}"`;
      if (is.date(props.item)) return props.item.toISOString();
      return props.item;
    }, [props.item]) as ReactNode,
  }
}

const useValueUpdater = (
  props: RenderNodeArgs,
  state: State,
) => {
  const setState = state.set;
  useMemo(() => {
    setState({ value: props.item as InputValue });
  }, [props.item, setState]);
  useMemo(() => {
    setState({ key: props.objectKey! });
  }, [props.objectKey, setState]);
}
