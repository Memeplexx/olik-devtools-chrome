import { StateAction, deserialize, readState, updateFunctions } from "olik";
import { ForwardedRef, ReactNode } from "react";
import { useForwardedRef, useRecord } from "../shared/functions";
import { Tree } from "../tree";
import { StateProps } from "./constants";


export const useInputs = (props: StateProps, ref: ForwardedRef<HTMLDivElement>) => {
  const localState = useLocalState(ref);
  return {
    ...localState,
    data: tryReadState({ ...props, ...localState }),
  };
}

const useLocalState = (ref: ForwardedRef<HTMLDivElement>) => {
  const record = useRecord({
    contractedKeys: new Array<string>(),
  });
  return {
    ...record,
    containerRef: useForwardedRef<HTMLDivElement>(ref),
  }
}

const tryReadState = (arg: ReturnType<typeof useLocalState> & StateProps): ReactNode => {
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

