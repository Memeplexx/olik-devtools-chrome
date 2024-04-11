import 'flatpickr/dist/flatpickr.css';
import { ForwardedRef, MutableRefObject, forwardRef } from "react";
import { Props, InputValue, TextInputElement, types } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { Input, TextMeasurerWrapper, Quote, TextArea, TextAreaWrapper, TextMeasurer, Wrapper } from "./styles";
import { IconOption, PopupList } from '../popup-list';
import { IoIosSwap } from 'react-icons/io';


export const CompactInput = forwardRef(function CompactInput<V extends InputValue>(
  props: Props<V>,
  forwardedRef: ForwardedRef<TextInputElement>
) {
  const inputs = useInputs(props, forwardedRef);
  const outputs = useOutputs(props, inputs);
  const commonInputProps = {
    value: inputs.value,
    onKeyDown: outputs.onKeyDown,
    onKeyUp: outputs.onKeyUp,
    onChange: outputs.onChange,
    onClick: outputs.onClick,
    onBlur: outputs.onBlur,
    onFocus: outputs.onFocus,
    $initialized: inputs.initialized,
    $valueType: props.valueType,
    $animate: inputs.animate,
    $isChanged: props.isChanged,
  };
  return (
    <Wrapper
      $isTextArea={inputs.showTextArea}
      onMouseOver={outputs.onMouseOver}
      onMouseOut={outputs.onMouseOut}
      children={
        <>
          <Quote
            if={inputs.showQuote}
            $type='start'
            children='"'
          />
          <Input
            if={!inputs.showTextArea}
            {...inputs.inputsProps}
            {...commonInputProps}
            min='0'
            max={inputs.max}
            size={inputs.inputSize}
            ref={inputs.inputRef as MutableRefObject<HTMLInputElement>}
          />
          <TextAreaWrapper
            if={inputs.showTextArea}
            children={
              <>
                <TextArea
                  {...inputs.inputsProps}
                  {...commonInputProps}
                  ref={inputs.inputRef as MutableRefObject<HTMLTextAreaElement>}
                  $height={inputs.textAreaHeight}
                  $width={inputs.textAreaWidth}
                  rows={1}
                  cols={1}
                />
                <TextMeasurerWrapper
                  ref={inputs.textMeasurerRef}
                  children={
                    <>
                      <TextMeasurer
                        children={inputs.value}
                      />
                      <Quote
                        if={inputs.showQuote}
                        $type='end'
                        children='"'
                      />
                    </>
                  }
                />
              </>
            }
          />
          <PopupList
            if={inputs.showPopup}
            position={inputs.showTextArea ? 'below' : 'right'}
            children={
              <>
                {props.additionalOptions ?? null}
                {types.map(type => (
                  <IconOption
                    if={type !== props.valueType}
                    key={type}
                    text={type}
                    icon={IoIosSwap}
                    onClick={outputs.onClickChangeType(type)}
                  />
                ))}
              </>
            }
          />
        </>
      }
    />
  );
});
