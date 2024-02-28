import { libState } from "olik";
import { focusId, scrollTree } from "./functions";
import { useHooks } from "./hooks";


export const useEvents = (props: ReturnType<typeof useHooks>) => ({
  onMouseEnterItem: (id: number) => () => {
    if (props.selectedId) { return; }
    focusId(props, id);
    scrollTree(props);
  },
  onClickShowHiddenArgs: () => {
    props.set({ hideIneffectiveActions: !props.hideIneffectiveActions });
  },
  onMouseLeaveItem: () => {
    if (!props.selectedId) {
      props.set({ selected: '' });
    }
  },
  onClickItem: (selectedId: number) => () => {
    const itemsFlattened = props.items.flatMap(i => i.items);
    if (props.selectedId === selectedId) {
      props.set({ selectedId: null });
      silentlyUpdateAppStoreState(props, itemsFlattened[itemsFlattened.length - 1].state);
    } else {
      props.set({ selectedId });
      focusId(props, selectedId);
      silentlyUpdateAppStoreState(props, itemsFlattened.find(i => i.id === selectedId)!.state);
    }
  },
  onClickClear: () => {
    props.set({ items: [] });
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