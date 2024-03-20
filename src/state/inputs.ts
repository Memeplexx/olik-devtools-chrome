import { StateAction, deserialize, readState, updateFunctions } from "olik";
import { ForwardedRef, useState } from "react";
import { getStateIdToPathMap, is, useForwardedRef } from "../shared/functions";
import { Tree } from "../tree";
import { StateProps } from "./constants";


export const useInputs = (props: StateProps, ref: ForwardedRef<HTMLDivElement>) => {
  const localState = useLocalState(props, ref);
  return {
    ...localState,
    data: tryReadState(localState),
  };
}

const useLocalState = (props: StateProps, ref: ForwardedRef<HTMLDivElement>) => {
  const [state, setState] = useState({
    containerRef: useForwardedRef<HTMLDivElement>(ref),
    contractedKeys: new Array<string>(),
    stateIdToPathMap: new Map<string, string>(),
  });
  if (props.state && state.stateIdToPathMap.size === 0) {
    setState(s => ({ ...s, stateIdToPathMap: getStateIdToPathMap(props.state) }));
  }
  return { ...props, ...state, setState };
}

const tryReadState = (arg: ReturnType<typeof useLocalState> & { query: string }): JSX.Element => {
  const onClickNodeKey = (key: string) => arg.setState(s => ({
    ...s,
    contractedKeys: s.contractedKeys.includes(key)
      ? s.contractedKeys.filter(k => k !== key)
      : [...s.contractedKeys, key]
  }));
  try {
    const state = doReadState(arg.query, arg.state || {});
    if (state === undefined) { throw new Error(); }
    return Tree({ onClickNodeKey, unchanged: [], ...arg, state });
  } catch (e) {
    const segments = arg.query.split('.').filter(e => !!e).slice(0, -1);
    return segments.length === 0 
      ? Tree({ onClickNodeKey, unchanged: [], ...arg }) 
      : tryReadState({ ...arg, query: segments.join('.') });
  }
};

const doReadState = (type: string, state: unknown) => {
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

