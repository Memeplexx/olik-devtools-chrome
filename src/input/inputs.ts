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
  const valueAsString = useMemo(() => {
    return ((v) => {
      if (is.null(v)) return 'null';
      if (is.undefined(v)) return '';
      if (is.boolean(v)) return v.toString();
      if (is.number(v)) return v.toString();
      if (is.string(v)) return v.toString();
      if (is.date(v)) return v.toISOString();
    })(props.value) as string;
  }, [props.value]);
  const inputsProps = useMemo(() => {
    return (Object.keys(props) as Array<keyof typeof props>)
      .filter(k => (k in htmlEl))
      .reduce<Record<string, unknown>>((acc, key) => { acc[key] = props[key]; return acc; }, {});
  }, [props]);
  const inputType = useMemo(() => {
    return is.number(props.value) ? 'number' : 'string';
  }, [props.value]);
  const max = useMemo(() => {
    return is.number(props.value) ? props.value : 0;
  }, [props.value]);
  const showQuote = useMemo(() => {
    return props.showQuotes && is.string(props.value);
  }, [props.showQuotes, props.value]);
  return {
    ...localState,
    inputRef: useForwardedRef(forwardedRef),
    valueBefore: useRef(''),
    flatPickerRef: useRef<Instance | null>(null),
    canceled: useRef(false),
    calendarOpened: useRef(false),
    dateChanged: useRef(false),
    animationEnabled: useRef(true),
    showPopup: props.allowTypeSelectorPopup && localState.isHovered,
    inputSize: Math.max(1, valueAsString.length),
    inputType,
    max,
    showQuote,
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
  const { flatPickerRef, inputRef, dateChanged, calendarOpened, valueAsString } = localState;
  if (is.date(props.value) && !flatPickerRef.current && inputRef.current) {
    flatPickerRef.current = flatpickr(inputRef.current, {
      enableTime: true,
      defaultDate: valueAsString,
      formatDate: d => d.toISOString(),
      onOpen: () => {
        dateChanged.current = false;
        calendarOpened.current = true;
      },
      onChange: () => {
        dateChanged.current = true;
      },
      onClose: (s) => {
        if (!dateChanged.current) { return; }
        setTimeout(() => calendarOpened.current = false);
        props.onUpdate(s[0] as V);
      },
    })
  } else if (flatPickerRef.current && !is.date(props.value)) {
    flatPickerRef.current.destroy();
    flatPickerRef.current = null;
  }
}
