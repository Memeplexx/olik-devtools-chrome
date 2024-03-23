import 'flatpickr/dist/flatpickr.css';
import { ForwardedRef, forwardRef } from "react";
import { CompactInputProps, InputValue, types } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { Input, Quote, Wrapper } from "./styles";
import { PopupList } from '../popup-list';
import { IoIosSwap } from 'react-icons/io';


export const CompactInput = forwardRef(function CompactInput<V extends InputValue>(
  props: CompactInputProps<V>,
  forwardedRef: ForwardedRef<HTMLInputElement>
) {
  const inputs = useInputs(props, forwardedRef);
  const outputs = useOutputs(props, inputs);
  return (
    <Wrapper
      onMouseOver={outputs.onMouseOver}
      onMouseOut={outputs.onMouseOut}
      children={
        <>
          <Quote
            showIf={inputs.showQuote}
            children='"'
            $type='start'
          />
          <Input
            {...inputs.inputsProps}
            value={inputs.valueAsString}
            size={inputs.inputSize}
            max={inputs.max}
            ref={inputs.inputRef}
            onKeyDown={outputs.onKeyDown}
            onKeyUp={outputs.onKeyUp}
            onChange={outputs.onChange}
            onClick={outputs.onClick}
            onBlur={outputs.onBlur}
            onFocus={outputs.onFocus}
            $initialized={inputs.initialized}
            $valueType={props.type}
            type={inputs.inputType}
            min='0'
            $animate={inputs.animate}
          />
          <Quote
            showIf={inputs.showQuote}
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
