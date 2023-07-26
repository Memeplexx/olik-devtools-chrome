import { useHooks } from "./hooks";
import { StateAction, deserialize, libState, readState, updateFunctions } from "olik";

export const useEvents = (props: ReturnType<typeof useHooks>) => ({
  onEditorChange: (text: string) => {
    props.setQuery(text);
  },
  onMouseEnterItem: (id: number) => () => {
    const itemIndex = props.items.findIndex(item => item.id === id)!;
    const item = props.items[itemIndex];
    props.setQuery(item.type || '');
    const itemBefore = itemIndex === 0
      ? { type: '', state: libState.initialState }
      : props.items.slice(0, itemIndex).reverse().find(item => item.last)!
    props.setSelected({
      before: doReadState(item.type, itemBefore.state),
      after: doReadState(item.type, item.state),
    });
    libState.disableDevtoolsDispatch = true;
    props.storeRef.current!.$set(item.state);
    libState.disableDevtoolsDispatch = false;
  },
  onMouseLeaveItem: () => {
    props.setQuery('');
    props.setSelected(null);
    libState.disableDevtoolsDispatch = true;
    props.storeRef.current!.$set(props.items[props.items.length - 1].state);
    libState.disableDevtoolsDispatch = false;
  },
})

const doReadState = (type: string, state: unknown) => {
  if (!type) { return null; }
  const segments = type.split('.');
  segments.pop();
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