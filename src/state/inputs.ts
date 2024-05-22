import { StateAction, deserialize, readState, updatePropMap } from "olik";
import { ForwardedRef } from "react";
import { silentlyApplyStateAction, useForwardedRef, useRecord, useStorageSynchronizer } from "../shared/functions";
import { Props, State } from "./constants";
import { TreeProps } from "../tree/constants";


export const useInputs = (
  props: Props,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const state = useLocalState(ref);
  useStorageSynchronizer(state, 'contractedKeys');
  return {
    ...state,
    treeProps: getTreeProps(props, state),
  };
}

export const useLocalState = (ref: ForwardedRef<HTMLDivElement>) => useRecord({
  contractedKeys: new Array<string>(),
  containerRef: useForwardedRef<HTMLDivElement>(ref),
});

const getTreeProps = (props: Props, state: State): TreeProps => {
  const commonTreeProps = {
    query: props.query,
    unchanged: [],
    changed: props.changed,
    contractedKeys: state.contractedKeys,
    onChangeState: (actionType: string) => silentlyApplyStateAction(props.store, actionType),
    onClickNodeKey: (key: string) => state.set(s => ({
      contractedKeys: s.contractedKeys.includes(key)
        ? s.contractedKeys.filter(k => k !== key)
        : [...s.contractedKeys, key]
    })),
  }
  try {
    const stateRead = doReadState(props.query, props.state || {});
    if (stateRead === undefined)
      throw new Error();
    return { ...commonTreeProps, state: stateRead };
  } catch (e) {
    const segments = props.query.split('.').filter(e => !!e).slice(0, -1);
    if (!segments.length)
      return { ...commonTreeProps, state: props.state };
    return getTreeProps({ ...props, query: segments.join('.') }, state);
  }
};

const doReadState = (type: string, state: unknown) => {
  if (type === undefined)
    return state;
  const segments = type.split('.').filter(s => s !== '');
  const stateActions: StateAction[] = segments
    .map(seg => {
      const arg = seg.match(/\(([^)]*)\)/)?.[1];
      const containsParenthesis = arg !== null && arg !== undefined;
      if (containsParenthesis && !(seg in updatePropMap)) {
        const functionName = seg.split('(')[0];
        const typedArg = deserialize(arg);
        return { name: functionName, arg: typedArg };
      } else {
        return { name: seg, arg: null };
      }
    });
  stateActions.push({ name: '$state' });
  return readState(state, stateActions);
}
