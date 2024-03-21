import { Instance } from "flatpickr/dist/types/instance";
import { isoDateRegexPattern, useForwardedRef } from "../shared/functions";
import { ForwardedRef, useRef } from "react";
import flatpickr from "flatpickr";
import { CompactInputProps } from "./constants";

export const useInputs = (
  props: CompactInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const ref = useForwardedRef(forwardedRef);
  const valueBefore = useRef('');
  const type = useRef<'text' | 'number' | 'date' | 'null'>('text');
  const flatPickerRef = useRef<Instance | null>(null);
  const canceled = useRef(false);
  const calendarOpened = useRef(false);
  const dateChanged = useRef(false);
  if (ref.current?.value !== props.value) {
    if (isoDateRegexPattern.test((props.value as string) ?? '')) {
      type.current = 'date';
    } else if (!isNaN(Number(props.value))) {
      type.current = 'number';
    } else if ('null' === props.value) {
      type.current = 'null';
    } else {
      type.current = 'text';
    }
  }
  if (type.current === 'date' && !flatPickerRef.current && ref.current) {
    flatPickerRef.current = flatpickr(ref.current, {
      enableTime: true,
      defaultDate: props.value as string,
      formatDate: d => d.toISOString(),
      onOpen: () => {
        dateChanged.current = false;
        calendarOpened.current = true;
      },
      onChange: () => {
        dateChanged.current = true;
      },
      onClose: function onChangeFlatpickr(s) {
        if (!dateChanged.current) { return; }
        setTimeout(() => calendarOpened.current = false);
        props.onComplete(s[0].toISOString());
      },
    })
  } else if (flatPickerRef.current && type.current !== 'date') {
    flatPickerRef.current.destroy();
    flatPickerRef.current = null;
  }
  return {
    ref,
    canceled,
    calendarOpened,
    type,
    valueBefore,
    props,
  }
}
