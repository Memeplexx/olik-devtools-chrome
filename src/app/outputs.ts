import { libState } from "olik";
import { useInputs } from "./inputs";
import { silentlyApplyStateAction } from "../shared/functions";


export const useOutputs = (props: ReturnType<typeof useInputs>) => {
  return {
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
    onEditorChange: (query: string) => {
      props.setState(s => ({ ...s, query }));
    },
    onEditorEnter: (query: string) => {
      silentlyApplyStateAction(props.storeRef.current!, query.split('.'));
    },
  }
}

const silentlyUpdateAppStoreState = (props: ReturnType<typeof useInputs>, state: Record<string, unknown>) => {
  if (!chrome.runtime) {
    libState.disableDevtoolsDispatch = true;
    props.storeRef.current!.$set(state);
    libState.disableDevtoolsDispatch = false;
  } else {
    const updateDiv = (state: string) => document.getElementById('olik-state')!.innerHTML = state;
    chrome.tabs
      .query({ active: true })
      .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: updateDiv, args: [JSON.stringify(state)] }))
      .catch(console.error);
  }
}