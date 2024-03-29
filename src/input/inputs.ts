import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { ForwardedRef, useEffect, useMemo, useRef } from "react";
import { is, useAttributeObserver, useForwardedRef, usePropsForHTMLElement, useRecord, useResizeObserver } from "../shared/functions";
import { Derived, InputValue, Props, State, TextInputElement } from "./constants";

const inputEl = document.createElement('input');
const textAreaEl = document.createElement('textarea');

export const useInputs = <V extends InputValue>(
  props: Props<V>,
  forwardedRef: ForwardedRef<TextInputElement>
) => {
  const state = useLocalState(forwardedRef);
  const derived = useDerivedState(props, state);
  useInitializer(state);
  useDatePicker(props, state, derived);
  useAnimateOnValueChange(state);
  useInputElementChanger(props, state, derived);
  useTextAreaReSizer(state);
  return {
    ...state,
    ...derived,
  };
}

export const useLocalState = (
  forwardedRef: ForwardedRef<TextInputElement>
) => useRecord({
  initialized: false,
  isHovered: false,
  animate: true,
  textAreaWidth: 0,
  textAreaHeight: 0,
  inputRef: useForwardedRef(forwardedRef),
  textMeasurerRef: useRef<HTMLSpanElement>(null),
  valueBefore: useRef(''),
  onEscapePressed: useRef(false),
  calendarOpened: useRef(false),
  animationEnabled: useRef(true),
});

export const useDerivedState = <V extends InputValue>(
  props: Props<V>,
  state: State,
) => {
  const val = props.value;
  const valueAsString = useMemo(() => {
    if (is.null(val)) return 'null';
    if (is.undefined(val)) return '';
    if (is.boolean(val)) return val.toString();
    if (is.number(val)) return val.toString();
    if (is.string(val)) return val.toString();
    if (is.date(val)) return val.toISOString();
  }, [val]) as string;
  const showTextArea = !!props.allowTextArea && props.valueType === 'string';
  return {
    showPopup: props.allowTypeSelectorPopup && state.isHovered,
    inputSize: Math.max(1, valueAsString.length),
    max: useMemo(() => is.number(val) ? val : 0, [val]),
    showQuote: useMemo(() => props.allowQuotesToBeShown && props.valueType === 'string', [props.allowQuotesToBeShown, props.valueType]),
    inputsProps: usePropsForHTMLElement(showTextArea ? textAreaEl : inputEl, props),
    valueAsString,
    showTextArea,
  };
}

const useInitializer = (
  state: State
) => {
  useEffect(() => {
    state.set({ initialized: true });
  }, [state]);
}

const useDatePicker = <V extends InputValue>(
  props: Props<V>,
  state: State,
  derived: Derived,
) => {
  const flatPickerRef = useRef<Instance | null>(null);
  const dateChanged = useRef(false);
  if (is.date(props.value) && !flatPickerRef.current && state.inputRef.current) {
    flatPickerRef.current = flatpickr(state.inputRef.current, {
      enableTime: true,
      defaultDate: derived.valueAsString,
      formatDate: d => d.toISOString(),
      onOpen: () => {
        dateChanged.current = false;
        state.calendarOpened.current = true;
      },
      onChange: () => {
        dateChanged.current = true;
      },
      onClose: s => {
        if (!dateChanged.current) { return; }
        setTimeout(() => state.calendarOpened.current = false);
        props.onChangeCommit(s[0] as V);
      },
    })
  } else if (flatPickerRef.current && !is.date(props.value)) {
    flatPickerRef.current.destroy();
    flatPickerRef.current = null;
  }
}

const useInputElementChanger = <V extends InputValue>(
  props: Props<V>,
  state: State,
  derived: Derived,
) => {
  if (!state.initialized) {
    setTimeout(() => props.onChangeInputElement?.(derived.showTextArea));
  }
  const wasTextArea = useRef(derived.showTextArea);
  if (wasTextArea.current == derived.showTextArea) { return; }
  wasTextArea.current = derived.showTextArea;
  setTimeout(() => props.onChangeInputElement?.(derived.showTextArea));
}

const useAnimateOnValueChange = (
  state: State,
) => {
  useAttributeObserver({
    element: state.inputRef.current,
    attributes: ['value'],
    onChange: () => {
      if (!state.animationEnabled.current) return;
      state.set({ initialized: false, animate: false });
      requestAnimationFrame(() => requestAnimationFrame(() => state.set({ initialized: true, animate: true })));
      state.animationEnabled.current = true;
    },
  })
}

const useTextAreaReSizer = (
  state: State,
) => {
  useResizeObserver({
    element: state.textMeasurerRef.current,
    onChange: size => {
      state.set({ textAreaWidth: size.width, textAreaHeight: size.height });
    },
  });
}
