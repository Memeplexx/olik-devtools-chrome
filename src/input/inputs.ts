import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { ForwardedRef, useEffect, useMemo, useRef } from "react";
import { is, useAttributeObserver, useForwardedRef, usePropsForHTMLElement, useRecord, useResizeObserver } from "../shared/functions";
import { Props, InputValue, State, TextInputElement, Derived } from "./constants";

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
  const valueAsString = useMemo(() => {
    if (is.null(props.value)) return 'null';
    if (is.undefined(props.value)) return '';
    if (is.boolean(props.value)) return props.value.toString();
    if (is.number(props.value)) return props.value.toString();
    if (is.string(props.value)) return props.value.toString();
    if (is.date(props.value)) return props.value.toISOString();
  }, [props.value]) as string;
  const inputType = useMemo(() => is.number(props.value) ? 'number' : 'string', [props.value]);
  const showTextArea = !!props.allowTextArea && props.type === 'string';
  const inputsProps = usePropsForHTMLElement(showTextArea ? textAreaEl : inputEl, props);
  const max = useMemo(() => is.number(props.value) ? props.value : 0, [props.value]);
  const showQuote = useMemo(() => props.allowQuotesToBeShown && is.string(props.value), [props.allowQuotesToBeShown, props.value]);
  const showCloseQuote = useMemo(() => props.allowQuotesToBeShown && is.string(props.value) && !showTextArea, [props.allowQuotesToBeShown, props.value, showTextArea]);
  return {
    showPopup: props.allowTypeSelectorPopup && state.isHovered,
    inputSize: Math.max(1, valueAsString.length),
    inputType,
    max,
    showQuote,
    showCloseQuote,
    valueAsString,
    inputsProps,
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
    ref: state.inputRef,
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
  state: State
) => {
  useResizeObserver({
    ref: state.textMeasurerRef,
    onChange: size => {
      state.set({ textAreaWidth: size.width, textAreaHeight: size.height });
    },
  });
}
