import { libState } from "olik";
import { focusId, scrollTree } from "./functions";
import { useHooks } from "./hooks";
import { getTreeHTML } from "../shared/functions";


export const useEvents = (props: ReturnType<typeof useHooks>) => ({
  onMouseEnterItem: (id: number) => () => {
    if (props.selectedId) { return; }
    focusId(props, id);
    scrollTree(props);
  },
  onClickShowHiddenArgs: () => {
    props.setState(s => ({ ...s, hideIneffectiveActions: !props.hideIneffectiveActions }));
  },
  onMouseLeaveItem: () => {
    if (!props.selectedId) {
      const itemsFlattened = props.items.flatMap(i => i.items);
      const id = itemsFlattened[itemsFlattened.length - 1].id;
      const itemIndex = itemsFlattened.findIndex(item => item.id === id);
      const stateBefore = itemsFlattened.slice(0, itemIndex).reverse().find(i => !!i.last)?.state || props.storeStateInitial;
      const stateAfter = itemsFlattened[itemIndex].state;
      const selected = getTreeHTML({
        before: stateBefore,
        after: stateAfter,
        depth: 1
      });
      props.setState(s => ({ ...s, selected  }));
    }
  },
  onClickItem: (selectedId: number) => () => {
    const itemsFlattened = props.items.flatMap(i => i.items);
    if (props.selectedId === selectedId) {
      props.setState(s => ({ ...s, selectedId: null }));
      silentlyUpdateAppStoreState(props, itemsFlattened[itemsFlattened.length - 1].state);
    } else {
      props.setState(s => ({ ...s, selectedId }));
      focusId(props, selectedId);
      silentlyUpdateAppStoreState(props, itemsFlattened.find(i => i.id === selectedId)!.state);
    }
  },
  onClickClear: () => {
    props.setState(s => ({ ...s, items: [] }));
  }
})

const silentlyUpdateAppStoreState = (props: ReturnType<typeof useHooks>, state: Record<string, unknown>) => {
  if (!chrome.runtime) {
    libState.disableDevtoolsDispatch = true;
    props.storeRef.current!.$set(state);
    libState.disableDevtoolsDispatch = false;
  } else {
    const updateStateDiv = (state: string) => document.getElementById('olik-state')!.innerHTML = state;
    chrome.tabs
      .query({ active: true })
      .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: updateStateDiv, args: [JSON.stringify(state)] }))
      .catch(console.error);
  }
}