import 'flatpickr/dist/flatpickr.css';
import { ForwardedRef, MutableRefObject, forwardRef } from "react";
import { CompactInputProps, InputValue, TextInputElement, types } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { Input, Quote, TextArea, Wrapper } from "./styles";
import { PopupList } from '../popup-list';
import { IoIosSwap } from 'react-icons/io';


export const CompactInput = forwardRef(function CompactInput<V extends InputValue>(
  props: CompactInputProps<V>,
  forwardedRef: ForwardedRef<TextInputElement>
) {
  const inputs = useInputs(props, forwardedRef);
  const outputs = useOutputs(props, inputs);
  const commonInputProps = {
    value: inputs.valueAsString,
    onKeyDown: outputs.onKeyDown,
    onKeyUp: outputs.onKeyUp,
    onChange: outputs.onChange,
    onClick: outputs.onClick,
    onBlur: outputs.onBlur,
    onFocus: outputs.onFocus,
    $initialized: inputs.initialized,
    $valueType: props.type,
    $animate: inputs.animate,
  }
  return (
    <Wrapper
      showIf={!props.showIf}
      onMouseOver={outputs.onMouseOver}
      onMouseOut={outputs.onMouseOut}
      $isTextArea={inputs.showTextArea}
      children={
        <>
          <Quote
            showIf={inputs.showOpenQuote}
            children='"'
            $type='start'
          />
          <Input
            {...inputs.inputsProps}
            {...commonInputProps}
            showIf={!inputs.showTextArea}
            type={inputs.inputType}
            min='0'
            max={inputs.max}
            size={inputs.inputSize}
            ref={inputs.inputRef as MutableRefObject<HTMLInputElement>}
          />
          <TextArea
            {...inputs.inputsProps}
            {...commonInputProps}
            showIf={inputs.showTextArea}
            ref={inputs.inputRef as MutableRefObject<HTMLTextAreaElement>}
            $height={inputs.textAreaHeight}
            rows={1}
          />
          <Quote
            showIf={inputs.showCloseQuote}
            children='"'
            $type='end'
          />
          <PopupList
            showIf={inputs.showPopup}
            children={[
              ...(props.additionalOptions || []),
              ...types.map(type => ({
                text: type,
                icon: IoIosSwap,
                onClick: outputs.onClickChangeType(type),
                showIf: type !== props.type,
              })),
            ]}
          />
        </>
      }
    />
  );
});
