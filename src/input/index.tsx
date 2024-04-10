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
            showIf={inputs.showQuote}
            $type='start'
            children='"'
          />
          <Input
            {...inputs.inputsProps}
            {...commonInputProps}
            showIf={!inputs.showTextArea}
            min='0'
            max={inputs.max}
            size={inputs.inputSize}
            ref={inputs.inputRef as MutableRefObject<HTMLInputElement>}
          />
          <TextAreaWrapper
            showIf={inputs.showTextArea}
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
                        showIf={inputs.showQuote}
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
            showIf={inputs.showPopup}
            position={inputs.showTextArea ? 'below' : 'right'}
            children={
              <>
                {props.additionalOptions ?? null}
                {types.map(type => (
                  <IconOption
                    key={type}
                    text={type}
                    icon={IoIosSwap}
                    onClick={outputs.onClickChangeType(type)}
                    showIf={type !== props.valueType}
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
