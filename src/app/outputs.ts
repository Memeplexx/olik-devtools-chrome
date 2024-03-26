import { libState } from "olik";
import { silentlyApplyStateAction } from "../shared/functions";
import { State } from "./constants";


export const useOutputs = (state: State) => {
  return {
    onClickHideIneffectiveActions: () => {
      state.set({ hideUnchanged: !state.hideUnchanged });
    },
    onClickItem: (selectedId: number) => () => {
      const itemsFlattened = state.items.flatMap(i => i.items);
      if (state.selectedId === selectedId) {
        state.set({ selectedId: null });
        silentlyUpdateAppStoreState(state, itemsFlattened[itemsFlattened.length - 1].state);
      } else {
        state.set({ selectedId, storeStateVersion: itemsFlattened.find(i => i.id === selectedId)!.state });
        silentlyUpdateAppStoreState(state, itemsFlattened.find(i => i.id === selectedId)!.state);
      }
    },
    onClickClear: () => {
      state.set(s => ({ items: s.items.map(i => ({ ...i, visible: false } ) ) }));
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
  }
}

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