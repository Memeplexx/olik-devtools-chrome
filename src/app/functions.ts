import { StateAction, deserialize, libState, readState, updateFunctions } from "olik";
import { useHooks } from "./hooks";
import { getTreeHTML } from "../shared/functions";

// export const doReadState = (type: string, state: unknown) => {
//   if (!type) { return null; }
//   const segments = type.split('.');
//   segments.pop();
//   const stateActions: StateAction[] = segments
//     .map(seg => {
//       const arg = seg.match(/\(([^)]*)\)/)?.[1];
//       const containsParenthesis = arg !== null && arg !== undefined;
//       if (containsParenthesis && !updateFunctions.includes(seg)) {
//         const functionName = seg.split('(')[0];
//         const typedArg = deserialize(arg);
//         return { name: functionName, arg: typedArg };
//       } else {
//         return { name: seg, arg: null };
//       }
//     });
//   stateActions.push({ name: '$state' });
//   return readState({ state, stateActions, cursor: { index: 0 } });
// }
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
	const stateBefore = hooks.items.length > 1 ? hooks.items[hooks.items.length - 2].state : libState.initialState;
	const stateAfter = hooks.items.length > 0 ? hooks.items[hooks.items.length - 1].state : libState.initialState;
	const query = hooks.query.substring('store.'.length);
	const selected = getTreeHTML({
		before: doReadState(query, stateBefore),
		after: doReadState(query, stateAfter),
		depth: 1
	});
	hooks.setSelected(selected);
}