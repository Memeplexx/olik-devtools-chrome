import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { FocusEvent, ForwardedRef, KeyboardEvent, forwardRef, useRef, useState } from "react";
import { isoDateRegexPattern, useForwardedRef } from "../shared/functions";
import { CompactInputProps } from "./constants";
import styled from "styled-components";
import 'flatpickr/dist/flatpickr.css';


const Input = styled.input<{ $initialized: boolean }>`
  display: ${p => p.$initialized ? 'inline' : 'none'};
  ${p => p.readOnly && `pointer-events: none;`}
  :focus {
    outline: 1px solid #add8e6;
  }
  :hover {
    background-color: rgba(255,255,255,0.1);
  }
`;

export const CompactInput = forwardRef(function CompactInput(
  { value, onChange, onCancel, ...props}: CompactInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>
) {
  const ref = useForwardedRef(forwardedRef);
  const valueBefore = useRef('');
  const isDate = isoDateRegexPattern.test(ref.current?.value ?? '');
  const flatPickerRef = useRef<Instance | null>(null);
  const changed = useRef(false);
  const canceled = useRef(false);
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
  }
  const [state, setState] = useState({
    size: 0,
  });
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      ref.current!.blur();
    } else if (event.key === 'Escape') {
      canceled.current = true;
      ref.current!.blur();
      canceled.current = false;
      ref.current!.value = valueBefore.current;
      onCancel?.();
    }
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (isDate) {
      event.preventDefault();
    }
  }
  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (canceled.current || ref.current!.value === valueBefore.current) {
      return;
    }
    onChange!(event.target.value);
    props.onBlur?.(event);
  }
  const onFocus = () => {
    ref.current!.select();
    valueBefore.current = ref.current!.value;
  }
  const resize = () => setState(s => ({
    ...s,
    size: Math.max(1, ref.current!.value.length),
  }));
  if (!ref.current) {
    setTimeout(() => {
      ref.current!.value = value.toString();
      resize();
    })
  }
  return (
    <Input
      {...props}
      ref={ref}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onChange={resize}
      size={state.size}
      onBlur={onBlur}
      onFocus={onFocus}
      $initialized={!!ref.current}
    />
  );
});
