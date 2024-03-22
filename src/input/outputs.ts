import { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { decideComparing, is, isoDateRegexPattern, useEventHandlerForDocument } from "../shared/functions";
import { CompactInputProps, InputValue, ValueType } from "./constants";
import { useInputs } from "./inputs";

export const useOutputs = <V extends InputValue>(props: CompactInputProps<V>, inputs: ReturnType<typeof useInputs>) => {
  return {
    onClick: () => {
      if (props.type === 'boolean') {
        props.onUpdate(!props.value as V);
        inputs.ref.current?.blur();
      }
    },
    onKeyUp: (event: KeyboardEvent) => {
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
      props.onChange?.(decideComparing(props.type,
        ['string', () => event.target.value as V],
        ['number', () => parseFloat(event.target.value) as V],
        ['boolean', () => (event.target.value === 'true') as V],
        ['date', () => new Date(event.target.value) as V],
        ['null', () => null as V],
      ));
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (props.disabled) {
        event.preventDefault();
      } else if (is.date(props.value)) {
        event.preventDefault();  
      } else if (is.number(props.value) && !/[0-9]/.test(event.key)) {
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
      const v = inputs.ref.current!.value;
      const val = decideComparing(type,
        ['string', () => v as V],
        ['number', () => (/[0-9]/.test(v) ? +v : 0) as V],
        ['boolean', () => (v === 'true') as V],
        ['date', () => new Date(isoDateRegexPattern.test(v) ? v : 0) as V],
        ['null', () => null as V],
      );
      props.onChangeType?.(type);
      props.onUpdate(val);
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
