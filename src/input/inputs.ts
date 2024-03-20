import { Instance } from "flatpickr/dist/types/instance";
import { isoDateRegexPattern, useForwardedRef } from "../shared/functions";
import { ForwardedRef, useRef, useState } from "react";
import flatpickr from "flatpickr";
import { CompactInputProps } from "./constants";

export const useInputs = (
  props: CompactInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>
) => {
  const ref = useForwardedRef(forwardedRef);
  const valueBefore = useRef('');
  const isDate = isoDateRegexPattern.test(ref.current?.value ?? '');
  const flatPickerRef = useRef<Instance | null>(null);
  const canceled = useRef(false);
  const [state, setState] = useState({
    size: 0,
  });
  if (isDate && !flatPickerRef.current) {
    flatPickerRef.current = flatpickr(ref.current!, {
      enableTime: true,
      defaultDate: props.value as string,
      formatDate: d => d.toISOString(),
      onClose: function onChangeFlatpickr(s) {
        if (valueBefore.current === ref.current!.value) { return; }
        props.onComplete(s[0].toISOString());
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
  if (ref.current?.value !== props.value) {
    setTimeout(() => {
      resize();
    });
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