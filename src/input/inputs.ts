import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { ForwardedRef, useEffect, useMemo, useRef } from "react";
import { is, useForwardedRef, useRecord } from "../shared/functions";
import { CompactInputProps, InputValue } from "./constants";

const htmlEl = document.createElement('input');

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
  const valueAsString = ((v) => {
    if (is.null(v)) return 'null';
    if (is.undefined(v)) return '';
    if (is.boolean(v)) return v.toString();
    if (is.number(v)) return v.toString();
    if (is.string(v)) return v.toString();
    if (is.date(v)) return v.toISOString();
  })(props.value) as string;
  const inputsProps = (Object.keys(props) as Array<keyof typeof props>)
    .filter(k => (k in htmlEl))
    .reduce<Record<string, unknown>>((acc, key) => { acc[key] = props[key]; return acc; }, {});
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
    showQuote: useMemo(() => props.showQuotes && is.string(props.value), [props.showQuotes, props.value]),
    valueAsString,
    inputsProps,
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
