import { useMemo, useRef, useState } from "react";
import { decisionMap, is } from "../shared/functions";
import { NodeType, RenderNodeArgs } from "./constants";

export const useInputs = (
  props: RenderNodeArgs,
) => {
  const localState = useLocalState(props);
  const derivedState = useDerivedState(props);
  useValueUpdater(localState, props);
  return {
    ...localState,
    ...derivedState,
  };
}

export const useLocalState = (
  props: RenderNodeArgs,
) => {
  const [state, setState] = useState({
    showOptions: false,
    showArrayOptions: false,
    isEditingObjectKey: false,
    keyValue: props.objectKey,
    valueValue: '',
    keyNodeRef: useRef<HTMLInputElement>(null),
  });
  return { ...state, setState };
}

const useDerivedState = (
  props: RenderNodeArgs,
) => {
  return {
    isPrimitive: !is.array(props.item) && !is.record(props.item),
    hasObjectKey: props.objectKey !== undefined,
    isUnchanged: props.unchanged.includes(props.keyConcat),
    isContracted: props.contractedKeys.includes(props.keyConcat),
    isEmpty: is.array(props.item) ? !props.item.length : is.record(props.item) ? !Object.keys(props.item).length : false,
    isHidden: props.unchanged.includes(props.keyConcat) && props.hideUnchanged,
    showActionType: props.isTopLevel && !!props.actionType,
    nodeType: useMemo(() => decisionMap([
      [() => is.array(props.item), 'array'],
      [() => is.record(props.item), 'object'],
      [() => is.number(props.item), 'number'],
      [() => is.string(props.item), 'string'],
      [() => is.boolean(props.item), 'boolean'],
      [() => is.date(props.item), 'date'],
      [() => is.null(props.item), 'null'],
      [() => is.undefined(props.item), 'undefined'],
    ]) as NodeType, [props.item]),
    nodeEl: useMemo(() => decisionMap([
      [() => is.null(props.item), () => 'null'],
      [() => is.undefined(props.item), () => ''],
      [() => is.boolean(props.item), () => (props.item as boolean).toString()],
      [() => is.number(props.item), () => (props.item as number).toString()],
      [() => is.string(props.item), () => `"${(props.item as string).toString()}"`],
      [() => is.date(props.item), () => (props.item as Date).toISOString()],
      [() => true, () => props.item],
    ])() as JSX.Element, [props.item]),
  }
}

const useValueUpdater = (
  localState: ReturnType<typeof useLocalState>,
  props: RenderNodeArgs,
) => {
  const setState = localState.setState;
  useMemo(() => {
    setState(s => ({ ...s, valueValue: props.item === null ? 'null' : props.item === undefined ? '' : is.date(props.item) ? props.item.toISOString() : props.item.toString() }));
  }, [props.item, setState]);
  useMemo(() => {
    setState(s => ({ ...s, keyValue: props.objectKey }));
  }, [props.objectKey, setState]);
}
