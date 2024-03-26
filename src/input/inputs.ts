import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { ForwardedRef, useEffect, useMemo, useRef } from "react";
import { is, useForwardedRef, usePropsForHTMLElement, useRecord } from "../shared/functions";
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
  useInputElementChanger(props, localState);
  useTextAreaReSizer(props, localState);
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
    textAreaWidth: 0,
    textAreaHeight: 0,
  });
  const v = props.value;
  const valueAsString = useMemo(() => {
    if (is.null(v)) return 'null';
    if (is.undefined(v)) return '';
    if (is.boolean(v)) return v.toString();
    if (is.number(v)) return v.toString();
    if (is.string(v)) return v.toString();
    if (is.date(v)) return v.toISOString();
  }, [v]) as string;
  const inputType = useMemo(() => is.number(v) ? 'number' : 'string', [v]);
  const showTextArea = !!props.allowTextArea && props.type === 'string';
  const inputsProps = usePropsForHTMLElement(showTextArea ? textAreaEl : inputEl, props);
  const max = useMemo(() => is.number(v) ? v : 0, [v]);
  const showQuote = useMemo(() => props.allowQuotesToBeShown && is.string(v), [props.allowQuotesToBeShown, v]);
  const showCloseQuote = useMemo(() => props.allowQuotesToBeShown && is.string(v) && !showTextArea, [props.allowQuotesToBeShown, v, showTextArea]);
  const inputRef = useForwardedRef(forwardedRef);
  const textMeasurerRef = useRef<HTMLSpanElement>(null);
  return {
    ...localState,
    inputRef,
    textMeasurerRef,
    valueBefore: useRef(''),
    onEscapePressed: useRef(false),
    calendarOpened: useRef(false),
    animationEnabled: useRef(true),
    showPopup: props.allowTypeSelectorPopup && localState.isHovered,
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
  state: ReturnType<typeof useLocalState>
) => {
  const { setState } = state;
  useEffect(() => {
    setState({ initialized: true });
  }, [setState]);
}

const useAnimateOnValueChange = <V extends InputValue>(
  props: CompactInputProps<V>,
  state: ReturnType<typeof useLocalState>
) => {
  useMemo(() => {
    if (!state.animationEnabled.current) return;
    state.setState({ initialized: false, animate: false });
    setTimeout(() => state.setState({ initialized: true, animate: true }));
    state.animationEnabled.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value, state.setState]);
}

const useDatePicker = <V extends InputValue>(
  props: CompactInputProps<V>,
  state: ReturnType<typeof useLocalState>,
) => {
  const flatPickerRef = useRef<Instance | null>(null);
  const dateChanged = useRef(false);
  if (is.date(props.value) && !flatPickerRef.current && state.inputRef.current) {
    flatPickerRef.current = flatpickr(state.inputRef.current, {
      enableTime: true,
      defaultDate: state.valueAsString,
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
  props: CompactInputProps<V>,
  state: ReturnType<typeof useLocalState>
) => {
  if (!state.initialized) {
    setTimeout(() => props.onChangeInputElement?.(state.showTextArea));
  }
  const wasTextArea = useRef(state.showTextArea);
  if (wasTextArea.current == state.showTextArea) { return; }
  wasTextArea.current = state.showTextArea;
  setTimeout(() => props.onChangeInputElement?.(state.showTextArea));
}

const useTextAreaReSizer = <V extends InputValue>(
  props: CompactInputProps<V>,
  state: ReturnType<typeof useLocalState>
) => {
  useMemo(() => {
    setTimeout(() => {
      const textMeasurer = state.textMeasurerRef.current;
      if (!textMeasurer) return;
      const styles = getComputedStyle(textMeasurer);
      state.setState({ textAreaWidth: parseInt(styles.width), textAreaHeight: parseInt(styles.height) });
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.textMeasurerRef, props.value, state.setState])
}
