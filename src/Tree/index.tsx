import { useHooks } from "./hooks";
import { TreeProps } from "./constants";
import { JsonWrapper } from "./styles";
import React from "react";


export const Tree = React.forwardRef(function Tags(
  props: TreeProps,
  ref: React.ForwardedRef<HTMLPreElement>
) {
  const hooks = useHooks(props, ref);
  return (
    <JsonWrapper
      ref={hooks.containerRef}
      className={props.className}
      dangerouslySetInnerHTML={{ __html: hooks.data }}
    />
  );
});