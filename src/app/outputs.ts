import { BasicRecord, libState } from "olik";
import { clipboardWrite, silentlyApplyStateAction } from "../shared/functions";
import { Item, State } from "./constants";
import { MouseEvent } from "react";


export const useOutputs = (state: State) => ({
  onClickCopyTag: (tag: string) => (event: MouseEvent) => {
    event.stopPropagation();
    clipboardWrite(tag).catch(console.error);
  },
  onClickHideIneffectiveActions: () => {
    state.set(s => ({ showOptions: false, hideUnchanged: !s.hideUnchanged }));
  },
  onClickDisplayInline: () => {
    state.set(s => ({ showOptions: false, displayInline: !s.displayInline }));
  },
  onClickClear: () => {
    state.set(s => ({ showOptions: false, items: s.items.map(i => ({ ...i, visible: false })) }));
  },
  onClickItem: (selectedId: number) => () => {
    const fullState = state.items.find(i => i.id === selectedId)?.fullState ?? state.items.at(-1)!.fullState;
    state.set({ selectedId: state.selectedId === selectedId ? null : selectedId });
    silentlyUpdateAppStoreState(state, fullState);
  },
  onEditorChange: (query: string) => {
    state.set({ query });
  },
  onEditorEnter: (query: string) => {
    silentlyApplyStateAction(state.storeRef.current!, query);
  },
  onClickToggleMenu: () => {
    state.set(s => ({ showOptions: !s.showOptions }));
  },
  onHideMenu: () => {
    state.set({ showOptions: false });
  },
  onClickNodeKey: (idToUpdate: number) => (key: string) => {
    state.set(s => ({
      items: s.items.map(item => {
        if (item.id !== idToUpdate) 
          return item;
        return {
          ...item,
          contractedKeys: item.contractedKeys.includes(key) ? item.contractedKeys.filter(k => k !== key) : [...item.contractedKeys, key],
        } as Item;
      })
    }));
  },
  onMouseOverItem: (id: number) => () => {
    state.set(s => ({
      items: s.items.map(item => ({ ...item, hovered: item.id === id })),
    }));
  },
  onMouseOutItem: () => {
    state.set(s => ({
      items: s.items.map(item => ({ ...item, hovered: false })),
    }));
  },
});

const silentlyUpdateAppStoreState = (local: State, newState: BasicRecord) => {
  if (!chrome.runtime) {
    libState.disableDevtoolsDispatch = true;
    local.storeRef.current!.$set(newState);
    libState.disableDevtoolsDispatch = false;
  } else {
    chrome.tabs
      .query({ active: true })
      .then(result => chrome.scripting.executeScript({
        target: { tabId: result[0].id! },
        func: (state: string) => document.getElementById('olik-state')!.innerHTML = state,
        args: [JSON.stringify(newState)]
      }))
      .catch(console.error);
  }
}