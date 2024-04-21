import { libState } from "olik";
import { silentlyApplyStateAction } from "../shared/functions";
import { Item, State } from "./constants";


export const useOutputs = (state: State) => ({
  onClickHideIneffectiveActions: () => {
    state.set(s => ({ showOptions: false, hideUnchanged: !s.hideUnchanged }));
  },
  onClickHideHeaders: () => {
    state.set(s => ({ showOptions: false, hideHeaders: !s.hideHeaders }));
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