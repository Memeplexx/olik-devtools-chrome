import { Instance } from "flatpickr/dist/types/instance";
import { isoDateRegexPattern, useForwardedRef } from "../shared/functions";
import { ForwardedRef, useRef, useState } from "react";
import flatpickr from "flatpickr";
import { CompactInputProps } from "./constants";

export const useInputs = (
  { value, onChange, ...props }: CompactInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const ref = useForwardedRef(forwardedRef);
  const valueBefore = useRef('');
  const isDate = isoDateRegexPattern.test(ref.current?.value ?? '');
  const flatPickerRef = useRef<Instance | null>(null);
  const changed = useRef(false);
  const canceled = useRef(false);
  const [state, setState] = useState({
    size: 0,
  });
  if (isDate && !flatPickerRef.current) {
    flatPickerRef.current = flatpickr(ref.current!, {
      enableTime: true,
      defaultDate: value,
      formatDate: d => d.toISOString(),
      onChange: () => changed.current = true,
      onOpen: () => changed.current = false,
      onClose: function onChangeFlatpickr(s) {
        if (!changed.current) { return; }
        onChange?.(s[0].toISOString());
      },
    })
  } else if (flatPickerRef.current && !isDate) {
    flatPickerRef.current.destroy();
    flatPickerRef.current = null;
  }
  const resize = () => setState(s => ({
    ...s,
    size: Math.max(1, ref.current!.value.length),
  }));
  if (ref.current && ref.current.value !== value.toString()) {
    ref.current.value = value.toString();
    resize();
  }
  return {
    ref,
    state,
    setState,
    resize,
    canceled,
    isDate,
    valueBefore,
    props,
  }
}