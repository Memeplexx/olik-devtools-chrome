import { getTreeHTML } from "../shared/functions";
import { useInputs } from "./inputs";

export const focusId = (props: ReturnType<typeof useInputs>, id: number) => {
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

export const scrollTree = (props: ReturnType<typeof useInputs>) => {
  setTimeout(() => {
    const firstTouchedElement = props.treeRef!.current!.querySelector('.touched');
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