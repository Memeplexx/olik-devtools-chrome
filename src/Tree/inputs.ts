import { ReactNode, useMemo, useRef } from "react";
import { InputValue, ValueType } from "../input/constants";
import { useRecord } from "../shared/functions";
import { is } from "../shared/type-check";
import { RenderNodeArgs } from "./constants";

export const useInputs = (
  props: RenderNodeArgs,
) => {
  const state = useLocalState(props);
  const derived = useDerivedState(props, state);
  useValueUpdater(props, state);
  return {
    ...state,
    ...derived,
  };
}

export const useLocalState = (
  props: RenderNodeArgs,
) => useRecord({
  showOptions: false,
  showArrayOptions: false,
  isEditingObjectKey: false,
  isShowingTextArea: false,
  key: '',
  value: props.item as InputValue,
  type: getValueType(props.item),
  keyNodeRef: useRef<HTMLInputElement>(null),
});

const useDerivedState = (
  props: RenderNodeArgs,
  state: ReturnType<typeof useLocalState>,
) => ({
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
  isChanged: useMemo(() => {
    return props.changed.includes(props.keyConcat);
  }, [props.changed, props.keyConcat]),
  isEmpty: useMemo(() => {
    if (is.array(props.item))
      return !props.item.length;
    if (is.record(props.item))
      return !Object.keys(props.item).length;
    return false;
  }, [props.item]),
  nodeEl: useMemo(() => {
    if (is.null(props.item))
      return 'null';
    if (is.undefined(props.item))
      return '';
    if (is.boolean(props.item))
      return props.item.toString();
    if (is.number(props.item))
      return props.item.toString();
    if (is.string(props.item))
      return `"${props.item}"`;
    if (is.date(props.item))
      return props.item.toISOString();
    return props.item;
  }, [props.item]) as ReactNode,
  styles: {
    $displayInline: props.displayInline,
    $showTextArea: state.isShowingTextArea,
    $unchanged: useMemo(() => {
      return props.unchanged.includes(props.keyConcat);
    }, [props.keyConcat, props.unchanged]),
    $isArrayOrObject: useMemo(() => {
      return is.array(props.item) || is.record(props.item);
    }, [props.item]),
    $nonValueColor: useMemo(() => {
      if (props.unchanged.includes(props.keyConcat))
        return 'gray';
      return '#e4e4e4';
    }, [props.keyConcat, props.unchanged]),
    $color: useMemo(() => {
      if (props.unchanged.includes(props.keyConcat))
        return 'gray';
      if (is.array(props.item))
        return 'red';
      if (is.record(props.item))
        return 'violet';
      if (is.number(props.item))
        return 'darkorange';
      if (is.string(props.item))
        return 'green';
      if (is.date(props.item))
        return 'deepskyblue';
      if (is.null(props.item))
        return 'lightblue';
      if (is.boolean(props.item))
        return '#00ff3c';
      if (is.undefined(props.item))
        return 'magenta';
    }, [props.item, props.keyConcat, props.unchanged]),
  },
});

const useValueUpdater = (
  props: RenderNodeArgs,
  state: ReturnType<typeof useLocalState>,
) => {
  useMemo(() => {
    state.set({ value: props.item as InputValue, type: getValueType(props.item) });
  }, [props.item, state]);
  useMemo(() => {
    state.set({ key: props.objectKey! });
  }, [props.objectKey, state]);
}

const getValueType = (item: unknown): ValueType => {
  if (is.number(item))
    return 'number';
  if (is.string(item))
    return 'string';
  if (is.boolean(item))
    return 'boolean';
  if (is.date(item))
    return 'date';
  if (is.null(item))
    return 'null';
  return '';
}
