import { TreeProps } from "./constants";
import { JsonWrapper } from "./styles";
import React from "react";
import { useInputs } from "./inputs";


export const Tree = React.forwardRef(function Tags(
  props: TreeProps,
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