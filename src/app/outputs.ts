import { libState } from "olik";
import { useInputs } from "./inputs";


export const useOutputs = (props: ReturnType<typeof useInputs>) => ({
  onClickHideIneffectiveActions: () => {
    props.setState(s => ({ ...s, hideUnchanged: !props.hideUnchanged }));
  },
  onClickItem: (selectedId: number) => () => {
    const itemsFlattened = props.items.flatMap(i => i.items);
    if (props.selectedId === selectedId) {
      props.setState(s => ({ ...s, selectedId: null }));
      silentlyUpdateAppStoreState(props, itemsFlattened[itemsFlattened.length - 1].state);
    } else {
      props.setState(s => ({ ...s, selectedId, storeStateVersion: itemsFlattened.find(i => i.id === selectedId)!.state }));
      silentlyUpdateAppStoreState(props, itemsFlattened.find(i => i.id === selectedId)!.state);
    }
  },
  onClickClear: () => {
    props.setState(s => ({ ...s, items: s.items.map(i => ({ ...i, visible: false } ) ) }));
  },
  onQueryChanged: (query: string) => {
    props.setState(s => ({ ...s, query }));
  },
})

const silentlyUpdateAppStoreState = (props: ReturnType<typeof useInputs>, state: Record<string, unknown>) => {
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