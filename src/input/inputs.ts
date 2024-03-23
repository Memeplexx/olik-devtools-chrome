import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { ForwardedRef, useEffect, useMemo, useRef } from "react";
import { is, useForwardedRef, useRecord } from "../shared/functions";
import { CompactInputProps, InputValue, TextInputElement } from "./constants";

const inputEl = document.createElement('input');
const textAreaEl = document.createElement('textarea');

export const useInputs = <V extends InputValue>(
  props: CompactInputProps<V>,
  forwardedRef: ForwardedRef<TextInputElement>
) => {
  const localState = useLocalState(props, forwardedRef);
  useInitializer(localState);
  useDatePicker(props, localState);
  useAnimateOnValueChange(props, localState);
  useSwitchFocusWhenRequired(props, localState);
  return localState;
}

const useLocalState = <V extends InputValue>(
  props: CompactInputProps<V>,
  forwardedRef: ForwardedRef<TextInputElement>
) => {
  const localState = useRecord({
    initialized: false,
    isHovered: false,
    animate: true,
    // textAreaHeight: 0,
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
  const inputType = useMemo(() => {
    return is.number(props.value) ? 'number' : 'string';
  }, [props.value]);
  const showTextArea = !!props.allowTextArea && inputType === 'string' && valueAsString.length > 24;
  const inputsProps = useMemo(() => {
    const el = showTextArea ? textAreaEl : inputEl;
    return (Object.keys(props) as Array<keyof typeof props>)
      .filter(k => (k in el))
      .reduce<Record<string, unknown>>((acc, key) => { acc[key] = props[key]; return acc; }, {});
  }, [props, showTextArea]);
  const max = useMemo(() => {
    return is.number(props.value) ? props.value : 0;
  }, [props.value]);
  const showOpenQuote = useMemo(() => {
    return props.allowQuotesToBeShown && is.string(props.value);
  }, [props.allowQuotesToBeShown, props.value]);
  const showCloseQuote = useMemo(() => {
    return props.allowQuotesToBeShown && is.string(props.value) && !showTextArea;
  }, [props.allowQuotesToBeShown, props.value, showTextArea]);
  const inputRef = useForwardedRef(forwardedRef);
  return {
    ...localState,
    inputRef,
    valueBefore: useRef(''),
    canceled: useRef(false),
    calendarOpened: useRef(false),
    animationEnabled: useRef(true),
    showPopup: props.allowTypeSelectorPopup && localState.isHovered,
    inputSize: Math.max(1, valueAsString.length),
    inputType,
    max,
    showOpenQuote,
    showCloseQuote,
    valueAsString,
    inputsProps,
    showTextArea,
    textAreaHeight: inputRef.current?.scrollHeight ?? 0,
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
  const flatPickerRef = useRef<Instance | null>(null);
  const dateChanged = useRef(false);
  const { inputRef, calendarOpened, valueAsString } = localState;
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
        props.onChangeCommit(s[0] as V);
      },
    })
  } else if (flatPickerRef.current && !is.date(props.value)) {
    flatPickerRef.current.destroy();
    flatPickerRef.current = null;
  }
}

const useSwitchFocusWhenRequired = <V extends InputValue>(
  props: CompactInputProps<V>,
  localState: ReturnType<typeof useLocalState>
) => {
  if (!localState.initialized) {
    setTimeout(() => props.onChangeInputElement?.(localState.showTextArea));
  }
  const wasTextArea = useRef(localState.showTextArea);
  if (wasTextArea.current == localState.showTextArea) { return; }
  const pos = localState.inputRef.current!.selectionStart;
  setTimeout(() => {
    localState.inputRef.current!.focus();
    localState.inputRef.current?.setSelectionRange(pos, pos);
  });
  wasTextArea.current = localState.showTextArea;
  setTimeout(() => props.onChangeInputElement?.(localState.showTextArea));
}
