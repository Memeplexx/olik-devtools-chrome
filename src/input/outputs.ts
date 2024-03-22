import { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { useInputs } from "./inputs";
import { CompactInputProps, InputValue, ValueType } from "./constants";
import { decisionMap, is, isoDateRegexPattern } from "../shared/functions";

export const useOutputs = <V extends InputValue>(props: CompactInputProps<V>, inputs: ReturnType<typeof useInputs>) => {
  return {
    onClick: () => {
      if (props.type !== 'boolean') { return; }
      props.onUpdate(!props.value as V);
    },
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
      const val = decisionMap(
        [() => props.type === 'string', () => event.target.value as V],
        [() => props.type === 'number', () => parseFloat(event.target.value) as V],
        [() => props.type === 'boolean', () => (event.target.value === 'true') as V],
        [() => props.type === 'date', () => new Date(event.target.value) as V],
        [() => props.type === 'null', () => null as V],
      );
      props.onChange?.(val);
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (is.date(props.value)) {
        event.preventDefault();  
      } else if (is.number(props.value) && !/[0-9]/.test(event.key)) {
        event.preventDefault();
      }
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      if (inputs.calendarOpened.current) { return; }
      if (inputs.canceled.current) { return; }
      if (inputs.ref.current!.value === inputs.valueBefore.current) { return; }
      if (props.type === 'boolean') { return; }
      props.onBlur?.(event);
      props.onUpdate(props.value);
    },
    onFocus: (e: FocusEvent<HTMLInputElement>) => {
      inputs.ref.current!.select();
      inputs.valueBefore.current = inputs.ref.current!.value;
      props.onFocus?.(e);
    },
    onMouseOver: (e: MouseEvent<HTMLInputElement>) => {
      inputs.setState({ isFocused: true });
      props.onMouseOver?.(e);
    },
    onMouseOut: (e: MouseEvent<HTMLInputElement>) => {
      inputs.setState({ isFocused: false });
      props.onMouseOut?.(e);
    },
    onClickChangeType: (type: ValueType) => () => {
      const v = inputs.ref.current!.value;
      const val = decisionMap(
        [() => type === 'string', () => v as V],
        [() => type === 'number', () => (/[0-9]/.test(v) ? +v : 0) as V],
        [() => type === 'boolean', () => (v === 'true') as V],
        [() => type === 'date', () => new Date(isoDateRegexPattern.test(v) ? v : 0) as V],
        [() => type === 'null', () => null as V],
      );
      props.onChangeType?.(type);
      props.onUpdate(val);
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
