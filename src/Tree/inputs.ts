import { useMemo, useRef } from "react";
import { decide, is, useRecord } from "../shared/functions";
import { NodeType, RenderNodeArgs } from "./constants";
import { InputValue, ValueType } from "../input/constants";

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
  const record = useRecord({
    showOptions: false,
    showArrayOptions: false,
    isEditingObjectKey: false,
    keyValue: '',
    valueValue: props.item as InputValue,
    valueType: decide(
      [() => is.number(props.item), 'number'],
      [() => is.string(props.item), 'string'],
      [() => is.boolean(props.item), 'boolean'],
      [() => is.date(props.item), 'date'],
      [() => is.null(props.item), 'null'],
      [() => is.undefined(props.item), 'undefined'],
      [() => true, 'string'],
    ) as ValueType,
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
      return is.array(props.item) ? !props.item.length : is.record(props.item) ? !Object.keys(props.item).length : false;
    }, [props.item]),
    nodeType: useMemo(() => decide(
      [() => is.array(props.item), 'array'],
      [() => is.record(props.item), 'object'],
      [() => is.number(props.item), 'number'],
      [() => is.string(props.item), 'string'],
      [() => is.boolean(props.item), 'boolean'],
      [() => is.date(props.item), 'date'],
      [() => is.null(props.item), 'null'],
      [() => is.undefined(props.item), 'undefined'],
    ) as NodeType, [props.item]),
    nodeEl: useMemo(() => decide(
      [() => is.null(props.item), () => 'null'],
      [() => is.undefined(props.item), () => ''],
      [() => is.boolean(props.item), () => (props.item as boolean).toString()],
      [() => is.number(props.item), () => (props.item as number).toString()],
      [() => is.string(props.item), () => `"${(props.item as string).toString()}"`],
      [() => is.date(props.item), () => (props.item as Date).toISOString()],
      [() => true, () => props.item],
    ) as JSX.Element, [props.item]),
  }
}

const useValueUpdater = (
  localState: ReturnType<typeof useLocalState>,
  props: RenderNodeArgs,
) => {
  const setState = localState.setState;
  useMemo(() => {
    setState({ valueValue: props.item as InputValue });
  }, [props.item, setState]);
  useMemo(() => {
    setState({ keyValue: props.objectKey! });
  }, [props.objectKey, setState]);
}
