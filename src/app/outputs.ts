import { libState } from "olik";
import { silentlyApplyStateAction } from "../shared/functions";
import { Item, State } from "./constants";
import { scrollToUpdatedNode } from "./shared";


export const useOutputs = (state: State) => ({
  onClickHideIneffectiveActions: () => {
    state.set(s => ({ hideUnchanged: !s.hideUnchanged, showOptions: false}));
  },
  onClickDisplayInline: () => {
    state.set(s => ({ displayInline: !s.displayInline, showOptions: false }));
  },
  onClickClear: () => {
    state.set(s => ({ items: s.items.map(i => ({ ...i, visible: false, showOptions: false })) }));
  },
  onClickItem: (selectedId: number) => () => {
    const itemsFlattened = state.items.flatMap(i => i.items);
    if (state.selectedId === selectedId) {
      state.set({ selectedId: null });
      silentlyUpdateAppStoreState(state, itemsFlattened[itemsFlattened.length - 1].fullState);
    } else {
      const item = itemsFlattened.find(i => i.id === selectedId)!;
      state.set({ selectedId/*, storeStateVersion: item.fullState, changed: item.changed*/ });
      silentlyUpdateAppStoreState(state, item.fullState);
      scrollToUpdatedNode(item.changed);
    }
  },
  onEditorChange: (query: string) => {
    state.set({ query });
  },
  onEditorEnter: (query: string) => {
    silentlyApplyStateAction(state.storeRef.current!, query);
  },
  onClickHeader: (selectedId: number) => () => {
    state.set({ items: state.items.map(i => ({ ...i, headerExpanded: i.id === selectedId ? !i.headerExpanded : i.headerExpanded })) });
  },
  onClickToggleMenu: () => {
    state.set(s => ({ showOptions: !s.showOptions }));
  },
  onClickNodeKey: (key: string) => {
    state.set(s => ({
      items: s.items.map(itemOuter => {
        if (itemOuter.id !== s.idRefOuter.current) return itemOuter;
        return {
          ...itemOuter,
          items: itemOuter.items.map(itemInner => {
            if (itemInner.id !== s.idRefInner.current) return itemInner;
            return {
              ...itemInner,
              contractedKeys: itemInner.contractedKeys.includes(key) ? itemInner.contractedKeys.filter(k => k !== key) : [...itemInner.contractedKeys, key],
            } satisfies Item
          })
        }
      })
    }));
  },
});

const silentlyUpdateAppStoreState = (state: State, newState: Record<string, unknown>) => {
  if (!chrome.runtime) {
    libState.disableDevtoolsDispatch = true;
    state.storeRef.current!.$set(newState);
    libState.disableDevtoolsDispatch = false;
  } else {
    const updateDiv = (state: string) => document.getElementById('olik-state')!.innerHTML = state;
    chrome.tabs
      .query({ active: true })
      .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: updateDiv, args: [JSON.stringify(state)] }))
      .catch(console.error);
  }
}