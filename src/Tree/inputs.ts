import { ForwardedRef, useState } from "react";
import { useForwardedRef } from "../shared/functions";
import { TreeProps } from "./constants";
import { getStateAsJsx } from "./tree-maker";
import { StateAction, deserialize, readState, updateFunctions } from "olik";

export const useInputs = (props: TreeProps, ref: ForwardedRef<HTMLDivElement>) => {
  const containerRef = useForwardedRef<HTMLDivElement>(ref);
  const [contractedKeys, setContractedKeys] = useState(new Array<string>());
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

export const doReadState = (type: string, state: unknown) => {
  if (type === undefined) { return state; }
  const segments = type.split('.').filter(s => s !== '');
  const stateActions: StateAction[] = segments
    .map(seg => {
      const arg = seg.match(/\(([^)]*)\)/)?.[1];
      const containsParenthesis = arg !== null && arg !== undefined;
      if (containsParenthesis && !updateFunctions.includes(seg)) {
        const functionName = seg.split('(')[0];
        const typedArg = deserialize(arg);
        return { name: functionName, arg: typedArg };
      } else {
        return { name: seg, arg: null };
      }
    });
  stateActions.push({ name: '$state' });
  return readState({ state, stateActions, cursor: { index: 0 } });
}