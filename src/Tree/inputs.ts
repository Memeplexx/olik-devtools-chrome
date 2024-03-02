import React from "react";
import { useForwardedRef } from "../shared/functions";
import { TreeProps } from "./constants";
import { getStateAsJsx } from "./tree-maker";
import { doReadState } from "../app/functions";

export const useInputs = (props: TreeProps, ref: React.ForwardedRef<HTMLDivElement>) => {
  const containerRef = useForwardedRef<HTMLDivElement>(ref);
  const [contractedKeys, setContractedKeys] = React.useState(new Array<string>());
  const onClickNodeKey = (key: string) => {
    setContractedKeys(keys => {
      if (keys.includes(key)) {
        return keys.filter(k => k !== key);
      } else {
        return [...keys, key];
      }
    })
  }
  const newJsx = tryReadState({...props, contractedKeys, onClickNodeKey});
  return {
    containerRef,
    data: newJsx,
  }
}

const tryReadState = ({ state, contractedKeys, query, onClickNodeKey }: { query: string, contractedKeys: string[], state: unknown, onClickNodeKey: (k: string) => void }): JSX.Element => {
  try {
    const stateRev = doReadState(query, state || {});
    if (stateRev === undefined) {
      throw new Error();
    }
    return getStateAsJsx({ state: stateRev, onClickNodeKey, contractedKeys });
  } catch (e) {
    const segments = query.split('.').filter(e => !!e);
    segments.pop();
    if (segments.length === 0) {
      return getStateAsJsx({ state, onClickNodeKey, contractedKeys });
    } else {
      return tryReadState({ query: segments.join('.'), state, onClickNodeKey, contractedKeys });
    }
  }
};
