import 'flatpickr/dist/flatpickr.css';
import { ForwardedRef, forwardRef } from "react";
import { CompactInputProps, InputValue, types } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { Input, Quote, Wrapper } from "./styles";
import { PopupList } from '../popup-list';
import { is } from '../shared/functions';
import { IoIosSwap } from 'react-icons/io';


export const CompactInput = forwardRef(function CompactInput<V extends InputValue>(
  props: CompactInputProps<V>,
  forwardedRef: ForwardedRef<HTMLInputElement>
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onUpdate, value, size, showQuotes, onChange, onChangeType, allowTypeSelectorPopup, additionalOptions, ...inputProps } = props;
  const inputs = useInputs(props, forwardedRef);
  const outputs = useOutputs(props, inputs);
  return (
    <Wrapper
      onMouseOver={outputs.onMouseOver}
      onMouseOut={outputs.onMouseOut}
      children={
        <>
          <Quote
            showIf={showQuotes && is.string(props.value)}
            children='"'
            $type='start'
          />
          <Input
            {...inputProps}
            value={inputs.valueAsString}
            size={inputs.inputSize}
            max={inputs.max}
            ref={inputs.ref}
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
            showIf={showQuotes && is.string(props.value)}
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
