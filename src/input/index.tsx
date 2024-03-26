import 'flatpickr/dist/flatpickr.css';
import { ForwardedRef, MutableRefObject, forwardRef } from "react";
import { Props, InputValue, TextInputElement, types } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { Input, TextMeasurerWrapper, Quote, TextArea, TextAreaWrapper, TextMeasurer, Wrapper } from "./styles";
import { PopupList } from '../popup-list';
import { IoIosSwap } from 'react-icons/io';


export const CompactInput = forwardRef(function CompactInput<V extends InputValue>(
  props: Props<V>,
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
  };
  return (
    <Wrapper
      onMouseOver={outputs.onMouseOver}
      onMouseOut={outputs.onMouseOut}
      $isTextArea={inputs.showTextArea}
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
            type={inputs.inputType}
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
                        children={inputs.valueAsString}
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
