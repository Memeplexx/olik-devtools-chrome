import { StateAction, deserialize, readState, updateFunctions } from "olik";
import { useHooks } from "./hooks";
import { getTreeHTML } from "../shared/functions";

export const doReadState = (type: string, state: unknown) => {
  if (!type) { return state; }
  const segments = type.split('.');
  if (type.endsWith(')')) {
    segments.pop();
  }
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

export const updateSetSelection = (hooks: ReturnType<typeof useHooks>) => {
  if (!hooks.items.length) { return; }
  const stateBefore = hooks.items[hooks.items.length - 1].state;
  const stateAfter = hooks.incomingRef.current.state;
  const selected = getTreeHTML({
    before: stateBefore,
    after: stateAfter,
    depth: 1
  });
  hooks.set({ selected });
}

export const focusId = (props: ReturnType<typeof useHooks>, id: number) => {
  const itemIndex = props.items.findIndex(item => item.id === id);
  const stateBefore = props.items.slice(0, itemIndex).reverse().find(i => !!i.last)?.state || props.storeStateInitial;
  const stateAfter = props.items[itemIndex].state;
  const selected = getTreeHTML({
    before: stateBefore,
    after: stateAfter,
    depth: 1
  });
  props.set({ selected });
}

export const scrollTree = (props: ReturnType<typeof useHooks>) => {
  setTimeout(() => {
    const firstTouchedElement = props.treeRef.current!.querySelector('.touched');
    if (firstTouchedElement) {
      firstTouchedElement.scrollIntoView(/*{ behavior: 'smooth' }*/);
    }
  });
}