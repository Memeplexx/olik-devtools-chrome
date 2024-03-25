import { ChangeEvent, FocusEvent, MouseEvent } from "react";
import { TypedKeyboardEvent, is, isoDateRegexPattern, useEventHandlerForDocument } from "../shared/functions";
import { CompactInputProps, InputValue, TextInputElement, ValueType } from "./constants";
import { useInputs } from "./inputs";


export const useOutputs = <V extends InputValue>(props: CompactInputProps<V>, inputs: ReturnType<typeof useInputs>) => {
  return {
    onClick: (event: MouseEvent<TextInputElement>) => {
      if (props.type === 'boolean') {
        props.onChangeCommit(!props.value as V);
        inputs.inputRef.current?.blur();
      }
      props.onClick?.(event);
    },
    onKeyUp: (event: TypedKeyboardEvent<TextInputElement>) => {
      if (event.key === 'Enter' && !(inputs.showTextArea && event.shiftKey)) {
        inputs.inputRef.current!.blur();
      } else if (event.key === 'Escape' && !inputs.showPopup) {
        inputs.onEscapePressed.current = true;
        inputs.inputRef.current!.blur();
        inputs.onEscapePressed.current = false;
        manuallyFireChangeEvent(inputs);
      }
    },
    onChange: (event: ChangeEvent<TextInputElement>) => {
      const inputVal = event.target.value;
      const valueOfNewType = (() => {
        const v = props.value;
        if (is.string(v)) return inputVal;
        if (is.number(v)) return inputVal.trim() === ''  ? 0 : parseFloat(inputVal);
        if (is.boolean(v)) return inputVal === 'true';
        if (is.date(v)) return new Date(inputVal);
        if (is.null(v)) return null;
      })() as V;
      props.onChange?.(valueOfNewType);
    },
    onKeyDown: (event: TypedKeyboardEvent<TextInputElement>) => {
      if (event.key === 'Enter' && inputs.showTextArea && !event.shiftKey) {
        event.preventDefault();
      } else if (props.readOnly) {
        event.preventDefault();
      } else if (is.date(props.value)) {
        event.preventDefault();  
      } else if (is.number(props.value) && /^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
      }
      inputs.animationEnabled.current = false;
    },
    onBlur: (event: FocusEvent<TextInputElement>) => {
      props.onBlur?.(event);
      if (inputs.calendarOpened.current) return;
      if (inputs.onEscapePressed.current) return;
      if (inputs.inputRef.current!.value === inputs.valueBefore.current) return;
      if (props.type === 'boolean') return;
      props.onChangeCommit(props.value);
    },
    onFocus: (e: FocusEvent<TextInputElement>) => {
      inputs.valueBefore.current = inputs.inputRef.current!.value;
      props.onFocus?.(e);
    },
    onMouseOver: (e: MouseEvent<TextInputElement>) => {
      inputs.setState({ isHovered: true });
      props.onMouseOver?.(e);
    },
    onMouseOut: (e: MouseEvent<TextInputElement>) => {
      inputs.setState({ isHovered: false });
      props.onMouseOut?.(e);
    },
    onClickChangeType: (type: ValueType) => () => {
      props.onChangeType?.(type);
      const v = inputs.inputRef.current!.value;
      const valueOfNewType = (() => {
        if (type === 'string') return v;
        if (type === 'number') return (/^[0-9]$/.test(v) ? +v : 0);
        if (type === 'boolean') return (v === 'true');
        if (type === 'date') return new Date(isoDateRegexPattern.test(v) ? v : 0);
        if (type === 'null') return null;
      })() as V;
      props.onChangeCommit(valueOfNewType);
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
  const prototype = inputs.inputRef.current instanceof HTMLInputElement ? HTMLInputElement : HTMLTextAreaElement;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype.prototype, 'value')!.set!;
  nativeInputValueSetter.call(inputs.inputRef.current!, inputs.valueBefore.current);
  inputs.inputRef.current!.dispatchEvent(new Event('input', { bubbles: true }));
}
