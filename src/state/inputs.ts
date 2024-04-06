import { StateAction, deserialize, is, readState } from "olik";
import { ForwardedRef, ReactNode } from "react";
import { silentlyApplyStateAction, useForwardedRef, useRecord } from "../shared/functions";
import { Tree } from "../tree";
import { Props, State } from "./constants";


export const useInputs = (
  props: Props,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const localState = useLocalState(ref);
  return {
    ...localState,
    data: tryReadState(props, localState),
  };
}

export const useLocalState = (ref: ForwardedRef<HTMLDivElement>) => useRecord({
  contractedKeys: new Array<string>(),
  containerRef: useForwardedRef<HTMLDivElement>(ref),
});

const tryReadState = (props: Props, state: State): ReactNode => {
  const commonTreeProps = {
    unchanged: [],
    changed: props.changed,
    contractedKeys: state.contractedKeys,
    onChangeState: (actionType: string) => silentlyApplyStateAction(props.store, actionType),
    onClickNodeKey: (key: string) => state.set(s => ({
      ...s,
      contractedKeys: s.contractedKeys.includes(key)
        ? s.contractedKeys.filter(k => k !== key)
        : [...s.contractedKeys, key]
    })),
  }
  try {
    const stateRead = doReadState(props.query, props.state || {});
    if (stateRead === undefined) { throw new Error(); }
    return Tree({ ...commonTreeProps, state: stateRead });
  } catch (e) {
    const segments = props.query.split('.').filter(e => !!e).slice(0, -1);
    if (segments.length === 0) {
      return Tree({ ...commonTreeProps, state: props.state });
    }
    return tryReadState({ ...props, query: segments.join('.') }, state);
  }
};

const doReadState = (type: string, state: unknown) => {
  if (type === undefined) { return state; }
  const segments = type.split('.').filter(s => s !== '');
  const stateActions: StateAction[] = segments
    .map(seg => {
      const arg = seg.match(/\(([^)]*)\)/)?.[1];
      const containsParenthesis = arg !== null && arg !== undefined;
      if (containsParenthesis && !is.anyUpdateFunction(seg)) {
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

