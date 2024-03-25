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
  const inputsProps = usePropsForHTMLElement(showTextArea ? textAreaEl : inputEl, props, ['data-key']);
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
  { setState }: ReturnType<typeof useLocalState>
) => {
  useEffect(() => {
    setState({ initialized: true });
  }, [setState]);
}

const useAnimateOnValueChange = <V extends InputValue>(
  props: CompactInputProps<V>,
  { setState, animationEnabled }: ReturnType<typeof useLocalState>
) => {
  useMemo(() => {
    if (!animationEnabled.current) return;
    setState({ initialized: false, animate: false });
    setTimeout(() => setState({ initialized: true, animate: true }));
    animationEnabled.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value, setState]);
}

const useDatePicker = <V extends InputValue>(
  props: CompactInputProps<V>,
  { inputRef, calendarOpened, valueAsString }: ReturnType<typeof useLocalState>,
) => {
  const flatPickerRef = useRef<Instance | null>(null);
  const dateChanged = useRef(false);
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
      onClose: s => {
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

const useInputElementChanger = <V extends InputValue>(
  props: CompactInputProps<V>,
  { initialized, showTextArea }: ReturnType<typeof useLocalState>
) => {
  if (!initialized) {
    setTimeout(() => props.onChangeInputElement?.(showTextArea));
  }
  const wasTextArea = useRef(showTextArea);
  if (wasTextArea.current == showTextArea) { return; }
  wasTextArea.current = showTextArea;
  setTimeout(() => props.onChangeInputElement?.(showTextArea));
}

const useTextAreaReSizer = <V extends InputValue>(
  props: CompactInputProps<V>,
  { setState, textMeasurerRef }: ReturnType<typeof useLocalState>
) => {
  useMemo(() => {
    setTimeout(() => {
      const textMeasurer = textMeasurerRef.current;
      if (!textMeasurer) return;
      const styles = getComputedStyle(textMeasurer);
      setState({ textAreaWidth: parseInt(styles.width), textAreaHeight: parseInt(styles.height) });
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textMeasurerRef, props.value, setState])
}
