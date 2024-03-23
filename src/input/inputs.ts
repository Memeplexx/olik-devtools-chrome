import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { ForwardedRef, useEffect, useMemo, useRef } from "react";
import { is, useForwardedRef, useRecord } from "../shared/functions";
import { CompactInputProps, InputValue } from "./constants";

export const useInputs = <V extends InputValue>(
  props: CompactInputProps<V>,
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const localState = useLocalState(props, forwardedRef);
  useInitializer(localState);
  useDatePicker(props, localState);
  useAnimateOnValueChange(props, localState);
  return localState;
}

const useLocalState = <V extends InputValue>(
  props: CompactInputProps<V>,
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const localState = useRecord({
    initialized: false,
    isHovered: false,
    animate: true,
  });
  const valueAsString = (() => {
    if (is.null(props.value)) return 'null';
    if (is.undefined(props.value)) return '';
    if (is.boolean(props.value)) return props.value.toString();
    if (is.number(props.value)) return props.value.toString();
    if (is.string(props.value)) return props.value.toString();
    if (is.date(props.value)) return props.value.toISOString();
  })() as string;
  return {
    ...localState,
    ref: useForwardedRef(forwardedRef),
    valueBefore: useRef(''),
    flatPickerRef: useRef<Instance | null>(null),
    canceled: useRef(false),
    calendarOpened: useRef(false),
    dateChanged: useRef(false),
    animationEnabled: useRef(true),
    showPopup: props.allowTypeSelectorPopup && localState.isHovered,
    inputSize: Math.max(1, valueAsString.length),
    inputType: useMemo(() => is.number(props.value) ? 'number' : 'string', [props.value]),
    max: useMemo(() => is.number(props.value) ? props.value : 0, [props.value]),
    valueAsString,
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

const useAnimateOnValueChange = <V extends InputValue>(
  props: CompactInputProps<V>,
  localState: ReturnType<typeof useLocalState>
) => {
  const setState = localState.setState;
  useMemo(() => {
    if (!localState.animationEnabled.current) { return; }
    setState({ initialized: false, animate: false });
    setTimeout(() => setState({ initialized: true, animate: true }));
    localState.animationEnabled.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value, setState]);
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
