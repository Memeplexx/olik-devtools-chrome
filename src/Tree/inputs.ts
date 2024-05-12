import { ReactNode, useMemo, useRef } from "react";
import { InputValue, ValueType } from "../input/constants";
import { useRecord } from "../shared/functions";
import { RenderNodeArgs } from "./constants";
import { is } from "../shared/type-check";

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
  type: (() => {
    if (is.number(props.item))
      return 'number';
    if (is.string(props.item))
      return 'string';
    if (is.boolean(props.item))
      return 'boolean';
    if (is.date(props.item))
      return 'date';
    if (is.null(props.item))
      return 'null';
    if (is.undefined(props.item))
      return 'undefined';
    return 'string';
  })() as ValueType,
  keyNodeRef: useRef<HTMLInputElement>(null),
});

const useDerivedState = (
  props: RenderNodeArgs,
  state: ReturnType<typeof useLocalState>,
) => {
  const isPrimitive = !is.array(props.item) && !is.record(props.item);
  const hasObjectKey = props.objectKey !== undefined;
  const showActionType = props.isTopLevel && !!props.actionType;
  const isUnchanged = useMemo(() => {
    return props.unchanged.includes(props.keyConcat);
  }, [props.keyConcat, props.unchanged]);
  const isContracted = useMemo(() => {
    return props.contractedKeys.includes(props.keyConcat);
  }, [props.contractedKeys, props.keyConcat]);
  const isHidden = useMemo(() => {
    return props.unchanged.includes(props.keyConcat) && props.hideUnchanged;
  }, [props.hideUnchanged, props.keyConcat, props.unchanged]);
  const isEmpty = useMemo(() => {
    if (is.array(props.item))
      return !props.item.length;
    if (is.record(props.item))
      return !Object.keys(props.item).length;
    return false;
  }, [props.item]);
  const nodeEl = useMemo(() => {
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
  }, [props.item]) as ReactNode;
  const isChanged = useMemo(() => {
    return props.changed.includes(props.keyConcat);
  }, [props.changed, props.keyConcat]);
  const $displayInline = props.displayInline;
  const $showTextArea = state.isShowingTextArea;
  const $unchanged = useMemo(() => {
    return props.unchanged.includes(props.keyConcat);
  }, [props.keyConcat, props.unchanged])
  const $isArrayOrObject = useMemo(() => {
    return is.array(props.item) || is.record(props.item);
  }, [props.item]);
  const $color = useMemo(() => {
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
  }, [props.item, props.keyConcat, props.unchanged]);
  const $nonValueColor = useMemo(() => {
    if (props.unchanged.includes(props.keyConcat))
      return 'gray';
    return '#e4e4e4';
  }, [props.keyConcat, props.unchanged]);
  const styles = useMemo(() => ({
    $unchanged,
    $displayInline,
    $showTextArea,
    $isArrayOrObject,
    $color,
    $nonValueColor,
  }), [$unchanged, $displayInline, $showTextArea, $isArrayOrObject, $color, $nonValueColor]);
  return {
    isPrimitive,
    hasObjectKey,
    showActionType,
    isUnchanged,
    isContracted,
    isHidden,
    isEmpty,
    nodeEl,
    isChanged,
    styles,
  }
};

const useValueUpdater = (
  props: RenderNodeArgs,
  state: ReturnType<typeof useLocalState>,
) => {
  useMemo(() => {
    state.set({ value: props.item as InputValue });
  }, [props.item, state]);
  useMemo(() => {
    state.set({ key: props.objectKey! });
  }, [props.objectKey, state]);
}
