import { ChangeEvent, FocusEvent, MouseEvent } from "react";
import { TypedKeyboardEvent, is, isoDateRegexPattern, useEventHandlerForDocument } from "../shared/functions";
import { CompactInputProps, InputValue, ValueType } from "./constants";
import { useInputs } from "./inputs";

export const useOutputs = <V extends InputValue>(props: CompactInputProps<V>, inputs: ReturnType<typeof useInputs>) => {
  return {
    onClick: (event: MouseEvent<HTMLInputElement>) => {
      if (props.type === 'boolean') {
        props.onUpdate(!props.value as V);
        inputs.ref.current?.blur();
      }
      props.onClick?.(event);
    },
    onKeyUp: (event: TypedKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        inputs.ref.current!.blur();
      } else if (event.key === 'Escape' && !inputs.showPopup) {
        inputs.canceled.current = true;
        inputs.ref.current!.blur();
        inputs.canceled.current = false;
        manuallyFireChangeEvent(inputs);
      }
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const inputVal = event.target.value;
      const valueOfNewType = ((v) => {
        if (is.string(v)) return inputVal;
        if (is.number(v)) return inputVal.trim() === ''  ? 0 : parseFloat(inputVal);
        if (is.boolean(v)) return inputVal === 'true';
        if (is.date(v)) return new Date(inputVal);
        if (is.null(v)) return null;
      })(props.value) as V;
      props.onChange?.(valueOfNewType);
    },
    onKeyDown: (event: TypedKeyboardEvent<HTMLInputElement>) => {
      if (props.disabled) {
        event.preventDefault();
      } else if (is.date(props.value)) {
        event.preventDefault();  
      } else if (is.number(props.value) && /^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
      }
      inputs.animationEnabled.current = false;
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      props.onBlur?.(event);
      if (inputs.calendarOpened.current) { return; }
      if (inputs.canceled.current) { return; }
      if (inputs.ref.current!.value === inputs.valueBefore.current) { return; }
      if (props.type === 'boolean') { return; }
      props.onUpdate(props.value);
    },
    onFocus: (e: FocusEvent<HTMLInputElement>) => {
      inputs.valueBefore.current = inputs.ref.current!.value;
      props.onFocus?.(e);
    },
    onMouseOver: (e: MouseEvent<HTMLInputElement>) => {
      inputs.setState({ isHovered: true });
      props.onMouseOver?.(e);
    },
    onMouseOut: (e: MouseEvent<HTMLInputElement>) => {
      inputs.setState({ isHovered: false });
      props.onMouseOut?.(e);
    },
    onClickChangeType: (type: ValueType) => () => {
      props.onChangeType?.(type);
      const valueOfNewType = ((v) => {
        if (type === 'string') return v;
        if (type === 'number') return (/^[0-9]$/.test(v) ? +v : 0);
        if (type === 'boolean') return (v === 'true');
        if (type === 'date') return new Date(isoDateRegexPattern.test(v) ? v : 0);
        if (type === 'null') return null;
      })(inputs.ref.current!.value) as V;
      props.onUpdate(valueOfNewType);
    },
    onDocumentKeyup: useEventHandlerForDocument('keyup', event => {
      if (event.key === 'Escape' && inputs.showPopup) {
        inputs.setState({ isHovered: false });
      }
    }),
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
