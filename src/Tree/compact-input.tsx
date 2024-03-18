import { ForwardedRef, KeyboardEvent, forwardRef, useRef, useState } from "react";
import { Input, Quote } from "./styles";
import { CompactInputProps } from "./constants";
import { useForwardedRef } from "../shared/functions";


export const CompactInput = forwardRef(function CompactInput(
  props: CompactInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>
) {
  const ref = useForwardedRef(forwardedRef);
  const valueBefore = useRef('');
  const [state, setState] = useState({
    size: 0,
    length: 0,
  });
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      valueBefore.current = ref.current!.value;
      props.onChange?.(ref.current!.value);
      ref.current!.blur();
    } else if (event.key === 'Escape') {
      ref.current!.blur();
    }
  }
  const onBlur = () => {
    if (props.revertOnBlur) {
      ref.current!.value = valueBefore.current;
    }
    reEvaluate();
  }
  const onFocus = () => {
    valueBefore.current = ref.current!.value;
  }
  const reEvaluate = () => setState(s => ({
    ...s,
    size: Math.max(props.minWidth ?? 1, ref.current!.value.length),
    type: props.type ?? 'text',
  }));
  if (!ref.current) {
    setTimeout(() => {
      ref.current!.value = props.value.toString();
      reEvaluate();
    })
  }
  const showQuote = ref.current?.value !== 'null' && props.type === 'text';
  return (
    <>
      <Quote
        showIf={showQuote}
        children={'"'}
      />
      <Input
        ref={ref}
        onKeyUp={onKeyUp}
        onChange={reEvaluate}
        min={1}
        size={state.size}
        max={state.length}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      <Quote
        showIf={showQuote}
        children={'"'}
        $pushLeft={true}
      />
    </>
  );
});
