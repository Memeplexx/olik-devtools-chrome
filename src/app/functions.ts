import { StateAction, deserialize, readState, updateFunctions } from "olik";
import { useHooks } from "./hooks";
import { getTreeHTML } from "../shared/functions";

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

export const focusId = (props: ReturnType<typeof useHooks>, id: number) => {
  const itemsFlattened = props.items.flatMap(i => i.items);
  const itemIndex = itemsFlattened.findIndex(item => item.id === id);
  const stateBefore = itemsFlattened.slice(0, itemIndex).reverse().find(i => !!i.last)?.state || props.storeStateInitial;
  const stateAfter = itemsFlattened[itemIndex].state;
  const selected = getTreeHTML({
    before: stateBefore,
    after: stateAfter,
    depth: 1
  });
  props.setState(s => ({ ...s, selected }));
}

export const scrollTree = (props: ReturnType<typeof useHooks>) => {
  setTimeout(() => {
    const firstTouchedElement = props.treeRef.current!.querySelector('.touched');
    if (firstTouchedElement) {
      firstTouchedElement.scrollIntoView(/*{ behavior: 'smooth' }*/);
    }
  });
}

export const getCleanStackTrace = (stack: string) => {
  return stack
    .trim()
    .substring('Error'.length)
    .trim()
    .split('\n')
    .filter(s => !s.includes('node_modules'))
    .map(s => s.trim().substring('at '.length).trim())
    .map(s => {
      const [fn, filePath] = s.split(' (');
      let url: string;
      const fun = fn.substring(fn.indexOf('.') + 1);
      try {
        url = new URL(filePath.replace('(app-pages-browser)/', '').substring(1, filePath.length - 2)).pathname;
      } catch (e) {
        return { fn: fun, filePath: '' };
      }
      return { fn: fun, filePath: url };
    })
    .filter(s => s.filePath !== '')
    .map(s => ({ ...s, filePath: s.filePath.includes(':') ? s.filePath.substring(0, s.filePath.indexOf(':')) : s.filePath }))
    .map(s => ({ ...s, filePath: s.filePath.replace(/\.[^/.]+$/, "") }))
    .map(s => `${s.filePath}.${s.fn}`)
    .map(s => s.replace('///', ''))
    .reverse();
}