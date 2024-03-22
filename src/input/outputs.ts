import { ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { useInputs } from "./inputs";
import { CompactInputProps } from "./constants";

export const useOutputs = (props: CompactInputProps, inputs: ReturnType<typeof useInputs>) => {
  return {
    onKeyUp: (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        inputs.ref.current!.blur();
      } else if (event.key === 'Escape') {
        inputs.canceled.current = true;
        inputs.ref.current!.blur();
        inputs.canceled.current = false;
        manuallyFireChangeEvent(inputs);
      }
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(event);
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (inputs.type !== 'date') { return; }
      event.preventDefault();
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      if (inputs.calendarOpened.current) { return; }
      if (inputs.canceled.current) { return; }
      if (inputs.ref.current!.value === inputs.valueBefore.current) { return; }
      props.onBlur?.(event);
      props.onUpdate(inputs.ref.current!.value);
    },
    onFocus: (e: FocusEvent<HTMLInputElement>) => {
      inputs.ref.current!.select();
      inputs.valueBefore.current = inputs.ref.current!.value;
      props.onFocus?.(e);
    },
  }
}

/**
 * We need this because the `onChange` event is not fired when the value is changed programmatically.
 * https://stackoverflow.com/a/46012210/1087131
 * @param inputs 
 */
const manuallyFireChangeEvent = (inputs: ReturnType<typeof useInputs>) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
  nativeInputValueSetter.call(inputs.ref.current!, inputs.valueBefore.current);
  inputs.ref.current!.dispatchEvent(new Event('input', { bubbles: true }));
}
