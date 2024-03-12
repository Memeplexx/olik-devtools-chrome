import { StateProps } from "./constants";
import { JsonWrapper } from "./styles";
import React from "react";
import { useInputs } from "./inputs";


export const State = React.forwardRef(function Tree(
  props: StateProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const inputs = useInputs(props, ref);
  return (
    <JsonWrapper
      ref={inputs.containerRef}
      className={props.className}
      children={inputs.data}
    />
  );
});