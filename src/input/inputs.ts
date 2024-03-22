import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { ForwardedRef, useEffect, useMemo, useRef } from "react";
import { decisionMap, is, useForwardedRef, useRecord } from "../shared/functions";
import { CompactInputProps, InputValue } from "./constants";

export const useInputs = <V extends InputValue>(
  props: CompactInputProps<V>,
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const localState = useLocalState(props, forwardedRef);
  useInitializer(localState);
  useDatePicker(props, localState);
  return localState;
}

const useLocalState = <V extends InputValue>(
  props: CompactInputProps<V>,
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const localState = useRecord({
    initialized: false,
    isHovered: false,
  })
  return {
    ...localState,
    ref: useForwardedRef(forwardedRef),
    valueBefore: useRef(''),
    flatPickerRef: useRef<Instance | null>(null),
    canceled: useRef(false),
    calendarOpened: useRef(false),
    dateChanged: useRef(false),
    inputType: useMemo(() => decisionMap(
      [() => is.number(props.value), () => 'number'],
      [() => true, () => 'string'],
    ), [props.value]),
    max: useMemo(() => decisionMap(
      [() => is.number(props.value), () => props.value as number],
      [() => true, () => 0],
    ), [props.value]),
    valueAsString: useMemo(() => decisionMap(
      [() => is.null(props.value), () => 'null'],
      [() => is.undefined(props.value), () => ''],
      [() => is.boolean(props.value), () => (props.value as boolean).toString()],
      [() => is.number(props.value), () => (props.value as number).toString()],
      [() => is.string(props.value), () => (props.value as string).toString()],
      [() => is.date(props.value), () => (props.value as Date).toISOString()],
    ), [props.value]),
  };
}

const useInitializer = (
  localState: ReturnType<typeof useLocalState>
) => {
  const setState = localState.setState;
  useEffect(() => {
    setState({ initialized: true });
  }, [setState]);
}

const useDatePicker = <V extends InputValue>(
  props: CompactInputProps<V>,
  localState: ReturnType<typeof useLocalState>,
) => {
  if (is.date(props.value) && !localState.flatPickerRef.current && localState.ref.current) {
    localState.flatPickerRef.current = flatpickr(localState.ref.current, {
      enableTime: true,
      defaultDate: localState.valueAsString,
      formatDate: d => d.toISOString(),
      onOpen: () => {
        localState.dateChanged.current = false;
        localState.calendarOpened.current = true;
      },
      onChange: () => {
        localState.dateChanged.current = true;
      },
      onClose: (s) => {
        if (!localState.dateChanged.current) { return; }
        setTimeout(() => localState.calendarOpened.current = false);
        props.onUpdate(s[0] as V);
      },
    })
  } else if (localState.flatPickerRef.current && !is.date(props.value)) {
    localState.flatPickerRef.current.destroy();
    localState.flatPickerRef.current = null;
  }
}
