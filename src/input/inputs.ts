import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { ForwardedRef, useMemo, useRef } from "react";
import { decisionMap, isoDateRegexPattern, useForwardedRef } from "../shared/functions";
import { CompactInputProps } from "./constants";

export const useInputs = (
  props: CompactInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const localState = useLocalState(props, forwardedRef);
  useDatePicker(props, localState);
  return localState;
}

const useLocalState = (
  props: CompactInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const type = useMemo(() => decisionMap(
    [() => isoDateRegexPattern.test((props.value as string) ?? ''), 'date'],
    [() => props.value !== '' && !isNaN(Number(props.value)), 'number'],
    [() => props.value === 'true' || props.value === 'false', 'boolean'],
    [() => 'null' === props.value, 'null'],
    [() => true, 'text'],
  ), [props.value]);
  const showQuotes = useMemo(() => {
    return type === 'text' && !!props.showQuotes;
  }, [type, props.showQuotes]);
  return {
    type,
    showQuotes,
    ref: useForwardedRef(forwardedRef),
    valueBefore: useRef(''),
    flatPickerRef: useRef<Instance | null>(null),
    canceled: useRef(false),
    calendarOpened: useRef(false),
    dateChanged: useRef(false),
  };
}

const useDatePicker = (
  props: CompactInputProps,
  localState: ReturnType<typeof useLocalState>,
) => {
  if (localState.type === 'date' && !localState.flatPickerRef.current && localState.ref.current) {
    localState.flatPickerRef.current = flatpickr(localState.ref.current, {
      enableTime: true,
      defaultDate: props.value as string,
      formatDate: d => d.toISOString(),
      onOpen: () => {
        localState.dateChanged.current = false;
        localState.calendarOpened.current = true;
      },
      onChange: () => {
        localState.dateChanged.current = true;
      },
      onClose: function onChangeFlatpickr(s) {
        if (!localState.dateChanged.current) { return; }
        setTimeout(() => localState.calendarOpened.current = false);
        props.onUpdate(s[0].toISOString());
      },
    })
  } else if (localState.flatPickerRef.current && localState.type !== 'date') {
    localState.flatPickerRef.current.destroy();
    localState.flatPickerRef.current = null;
  }
}
