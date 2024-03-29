import { ChangeEvent, FocusEvent, MouseEvent } from "react";
import { TypedKeyboardEvent, is, isoDateRegexPattern, useEventHandlerForDocument } from "../shared/functions";
import { Props, InputValue, State, TextInputElement, ValueType, Inputs } from "./constants";


export const useOutputs = <V extends InputValue>(
  props: Props<V>,
  state: Inputs,
) => ({
  onClick: (event: MouseEvent<TextInputElement>) => {
    if (props.valueType === 'boolean') {
      props.onChangeCommit(!props.value as V);
      state.inputRef.current?.blur();
    }
    props.onClick?.(event);
  },
  onKeyUp: (event: TypedKeyboardEvent<TextInputElement>) => {
    if (event.key === 'Enter' && !(state.showTextArea && event.shiftKey)) {
      state.inputRef.current!.blur();
    } else if (event.key === 'Escape' && !state.showPopup) {
      state.onEscapePressed.current = true;
      state.inputRef.current!.blur();
      state.onEscapePressed.current = false;
      manuallyFireChangeEvent(state);
    }
  },
  onChange: (event: ChangeEvent<TextInputElement>) => {
    const inputVal = event.target.value;
    const valueOfNewType = (() => {
      if (props.valueType === 'string') return inputVal;
      if (props.valueType === 'number') return inputVal.trim() === '' ? '' : inputVal.trim() === '-' ? '-' : parseFloat(inputVal);
      if (props.valueType === 'boolean') return inputVal === 'true';
      if (props.valueType === 'date') return new Date(isoDateRegexPattern.test(inputVal) ? inputVal : 0);
      if (props.valueType === 'null') return null;
    })() as V;
    props.onChange?.(valueOfNewType);
  },
  onKeyDown: (event: TypedKeyboardEvent<TextInputElement>) => {
    if (event.key === 'Enter' && state.showTextArea && !event.shiftKey) {
      event.preventDefault();
    } else if (props.readOnly) {
      event.preventDefault();
    } else if (is.date(props.value)) {
      event.preventDefault();
    }
    state.animationEnabled.current = false;
  },
  onBlur: (event: FocusEvent<TextInputElement>) => {
    props.onBlur?.(event);
    if (state.calendarOpened.current) return;
    if (state.onEscapePressed.current) return;
    if (state.inputRef.current!.value === state.valueBefore.current) return;
    if (props.valueType === 'boolean') return;
    props.onChangeCommit(props.value);
  },
  onFocus: (event: FocusEvent<TextInputElement>) => {
    state.valueBefore.current = state.inputRef.current!.value;
    props.onFocus?.(event);
  },
  onMouseOver: (event: MouseEvent<TextInputElement>) => {
    state.set({ isHovered: true });
    props.onMouseOver?.(event);
  },
  onMouseOut: (event: MouseEvent<TextInputElement>) => {
    state.set({ isHovered: false });
    props.onMouseOut?.(event);
  },
  onClickChangeType: (type: ValueType) => () => {
    props.onChangeValueType?.(type);
    const { value } = state.inputRef.current!;
    const valueOfNewType = (() => {
      if (type === 'string') return value;
      if (type === 'number') return (/^-?\d*\.?\d+$/.test(value) ? +value : 0);
      if (type === 'boolean') return (value === 'true');
      if (type === 'date') return new Date(isoDateRegexPattern.test(value) ? value : 0);
      if (type === 'null') return null;
    })() as V;
    props.onChangeCommit(valueOfNewType);
  },
  onDocumentKeyup: useEventHandlerForDocument('keyup', event => {
    if (event.key === 'Escape' && state.showPopup) {
      state.set({ isHovered: false });
    }
  }),
});

/**
 * We need this because the `onChange` event is not fired when the value is changed programmatically.
 * https://stackoverflow.com/a/46012210/1087131
 * @param state 
 */
const manuallyFireChangeEvent = (state: State) => {
  const prototype = state.inputRef.current instanceof HTMLInputElement ? HTMLInputElement : HTMLTextAreaElement;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype.prototype, 'value')!.set!;
  nativeInputValueSetter.call(state.inputRef.current!, state.valueBefore.current);
  state.inputRef.current!.dispatchEvent(new Event('input', { bubbles: true }));
}
