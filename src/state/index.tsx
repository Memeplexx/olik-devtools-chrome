import { ForwardedRef, forwardRef } from "react";
import { Props } from "./constants";
import { useInputs } from "./inputs";
import { JsonWrapper } from "./styles";
import { Tree } from "../tree";


export const State = forwardRef(function State(
  props: Props,
  ref: ForwardedRef<HTMLDivElement>
) {
  const inputs = useInputs(props, ref);
  return (
    <JsonWrapper
      ref={inputs.containerRef}
      className={props.className}
      children={
        <Tree
          {...inputs.treeProps}
        />
      }
    />
  );
});