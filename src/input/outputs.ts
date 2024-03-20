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
        inputs.ref.current!.value = inputs.valueBefore.current;
      }
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      inputs.resize();
      props.onChange?.(event);
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (inputs.isDate) {
        event.preventDefault();
      }
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      if (inputs.canceled.current || inputs.ref.current!.value === inputs.valueBefore.current) {
        return;
      }
      props.onBlur?.(event);
      props.onComplete(inputs.ref.current!.value);
    },
    onFocus: (e: FocusEvent<HTMLInputElement>) => {
      inputs.ref.current!.select();
      inputs.valueBefore.current = inputs.ref.current!.value;
      props.onFocus && props.onFocus(e);
    },
  }
}
