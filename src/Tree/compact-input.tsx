import { KeyboardEvent, useRef, useState } from "react";
import styled from "styled-components";
import { possible } from "../html";


const Input = styled.input`
  margin-right: ${p => p.type === 'text' ? '0px' : '-26px'};
  :focus {
    outline: 1px solid #add8e6;
  }
`;

const Quote = styled(possible.span)<{ $pushLeft?: boolean }>`
  ${p => p.$pushLeft ? 'margin-left: -4px;' : ''}
`;

export const CompactInput = <V extends number | string>(props: { value: V, onChange: (arg: V) => void, type: 'number' | 'text' }) => {
  const ref = useRef<HTMLInputElement>(null);
  const valueBefore = useRef('');
  const [state, setState] = useState({
    size: 0,
    length: 0,
    type: 'text' as 'number' | 'text',
  });
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      valueBefore.current = ref.current!.value;
      props.onChange(ref.current!.value as V);
      ref.current!.blur();
    } else if (event.key === 'Escape') {
      ref.current!.blur();
    }
  }
  const onBlur = () => {
    ref.current!.value = valueBefore.current;
    reEvaluate();
  }
  const onFocus = () => {
    valueBefore.current = ref.current!.value;
  }
  const reEvaluate = () => setState(s => ({
    ...s,
    size: Math.max(1, ref.current!.value.length),
    length: Math.pow(10, ref.current!.value.length),
    type: props.type,
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
        type={props.type}
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
}
