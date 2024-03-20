import 'flatpickr/dist/flatpickr.css';
import { ForwardedRef, forwardRef } from "react";
import { CompactInputProps } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { Input, Quote } from "./styles";


export const CompactInput = forwardRef(function CompactInput(
  props: CompactInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onComplete, ...inputProps } = props;
  const inputs = useInputs(props, forwardedRef);
  const outputs = useOutputs(props, inputs);
  return (
    <>
      <Quote 
        showIf={inputs.ref.current?.value === ''}
        children='"'
      />
      <Input
        {...inputProps}
        ref={inputs.ref}
        onKeyDown={outputs.onKeyDown}
        onKeyUp={outputs.onKeyUp}
        onChange={outputs.onChange}
        size={inputs.state.size}
        onBlur={outputs.onBlur}
        onFocus={outputs.onFocus}
        $initialized={!!inputs.ref.current}
      />
      <Quote 
        showIf={inputs.ref.current?.value === ''}
        children='"'
      />
    </>
  );
});
