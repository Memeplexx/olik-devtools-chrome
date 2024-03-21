import { Instance } from "flatpickr/dist/types/instance";
import { isoDateRegexPattern, useForwardedRef } from "../shared/functions";
import { ForwardedRef, useRef, useState } from "react";
import flatpickr from "flatpickr";
import { CompactInputProps } from "./constants";

export const useInputs = (
  props: CompactInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const localState = useLocalState(forwardedRef);
  useUpdateTypeOnValueChange(props, localState);
  useDatePicker(props, localState);
  useShowOnInit(localState);
  return localState;
}

const useShowOnInit = (
  localState: ReturnType<typeof useLocalState>,
) => {
  if (localState.ref.current) { return; }
  setTimeout(() => localState.setState(s => ({ ...s, show: true })));
}

const useLocalState = (
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const [state, setState] = useState({
    show: false,
    ref: useForwardedRef(forwardedRef),
    valueBefore: useRef(''),
    type: useRef<'text' | 'number' | 'date' | 'null' | 'boolean'>('text'),
    showQuotes: useRef(false),
    flatPickerRef: useRef<Instance | null>(null),
    canceled: useRef(false),
    calendarOpened: useRef(false),
    dateChanged: useRef(false),
  });
  return { ...state, setState };
}

const useUpdateTypeOnValueChange = (
  props: CompactInputProps,
  localState: ReturnType<typeof useLocalState>,
) => {
  if (localState.ref.current?.value === props.value) { return; }
  if (isoDateRegexPattern.test((props.value as string) ?? '')) {
    localState.type.current = 'date';
  } else if (!isNaN(Number(props.value))) {
    localState.type.current = 'number';
  } else if (props.value === 'true' || props.value === 'false') {
    localState.type.current = 'boolean';
  } else if ('null' === props.value) {
    localState.type.current = 'null';
  } else {
    localState.type.current = 'text';
  }
  localState.showQuotes.current = localState.type.current === 'text' && !!props.showQuotes;
}

const useDatePicker = (
  props: CompactInputProps,
  localState: ReturnType<typeof useLocalState>
) => {
  if (localState.type.current === 'date' && !localState.flatPickerRef.current && localState.ref.current) {
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
  } else if (localState.flatPickerRef.current && localState.type.current !== 'date') {
    localState.flatPickerRef.current.destroy();
    localState.flatPickerRef.current = null;
  }
}
