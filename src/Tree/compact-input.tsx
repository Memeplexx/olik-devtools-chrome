import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { ForwardedRef, KeyboardEvent, forwardRef, useRef, useState } from "react";
import { isoDateRegexPattern, useForwardedRef } from "../shared/functions";
import { CompactInputProps } from "./constants";
import styled from "styled-components";
import 'flatpickr/dist/flatpickr.css';


const Input = styled.input`
  :focus {
    outline: 1px solid #add8e6;
  }
  :hover {
    background-color: rgba(255,255,255,0.1);
  }
`;

export const CompactInput = forwardRef(function CompactInput(
  props: CompactInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>
) {
  const ref = useForwardedRef(forwardedRef);
  const valueBefore = useRef('');
  const isDate = isoDateRegexPattern.test(ref.current?.value ?? '');
  const flatPickerRef = useRef<Instance | null>(null);
  const changed = useRef(false);
  if (isDate && !flatPickerRef.current) {
    flatPickerRef.current = flatpickr(ref.current!, {
      enableTime: true,
      defaultDate: props.value,
      formatDate: d => d.toISOString(),
      onChange: () => changed.current = true,
      onOpen: () => changed.current = false,
      onClose: function onChangeFlatpickr(s) {
        if (!changed.current) { return; }
        props.onChange?.(s[0].toISOString());
      },
    })
  }
  const [state, setState] = useState({
    size: 0,
    length: 0,
  });
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      valueBefore.current = ref.current!.value;
      props.onChange?.(ref.current!.value);
      ref.current!.blur();
    } else if (event.key === 'Escape') {
      ref.current!.blur();
    }
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (isDate) {
      event.preventDefault();
    }
  }
  const onBlur = () => {
    if (props.revertOnBlur) {
      ref.current!.value = valueBefore.current;
    }
    reEvaluate();
  }
  const onFocus = () => {
    valueBefore.current = ref.current!.value;
  }
  const reEvaluate = () => setState(s => ({
    ...s,
    size: Math.max(props.minWidth ?? 1, ref.current!.value.length),
    type: props.type ?? 'text',
  }));
  if (!ref.current) {
    setTimeout(() => {
      ref.current!.value = props.value.toString();
      reEvaluate();
    })
  }

  return (
    <Input
      ref={ref}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onChange={reEvaluate}
      min={1}
      size={state.size}
      max={state.length}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
});
