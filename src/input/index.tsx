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
  const { onUpdate, ...inputProps } = props;
  const inputs = useInputs(props, forwardedRef);
  const outputs = useOutputs(props, inputs);
  return (
    <>
      <Quote 
        showIf={inputs.showQuotes.current}
        children='"'
      />
      <Input
        {...inputProps}
        ref={inputs.ref}
        onKeyDown={outputs.onKeyDown}
        onKeyUp={outputs.onKeyUp}
        onChange={outputs.onChange}
        size={Math.max(1, (props.value as string).length)}
        onBlur={outputs.onBlur}
        onFocus={outputs.onFocus}
        $initialized={inputs.init}
      />
      <Quote 
        showIf={inputs.showQuotes.current}
        children='"'
      />
    </>
  );
});
