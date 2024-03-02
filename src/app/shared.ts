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
