import { libState } from "olik";
import { useInputs } from "./inputs";
import { silentlyApplyStateAction } from "../shared/functions";


export const useOutputs = (inputs: ReturnType<typeof useInputs>) => {
  return {
    onClickHideIneffectiveActions: () => {
      inputs.setState({ hideUnchanged: !inputs.hideUnchanged });
    },
    onClickItem: (selectedId: number) => () => {
      const itemsFlattened = inputs.items.flatMap(i => i.items);
      if (inputs.selectedId === selectedId) {
        inputs.setState({ selectedId: null });
        silentlyUpdateAppStoreState(inputs, itemsFlattened[itemsFlattened.length - 1].state);
      } else {
        inputs.setState({ selectedId, storeStateVersion: itemsFlattened.find(i => i.id === selectedId)!.state });
        silentlyUpdateAppStoreState(inputs, itemsFlattened.find(i => i.id === selectedId)!.state);
      }
    },
    onClickClear: () => {
      inputs.setState(s => ({ ...s, items: s.items.map(i => ({ ...i, visible: false } ) ) }));
    },
    onEditorChange: (query: string) => {
      inputs.setState({ query });
    },
    onEditorEnter: (query: string) => {
      silentlyApplyStateAction(inputs.storeRef.current!, query.split('.'));
    },
    onClickHeader: (selectedId: number) => () => {
      inputs.setState({ items: inputs.items.map(i => ({ ...i, headerExpanded: i.id === selectedId ? !i.headerExpanded : i.headerExpanded })) });
    },
    onClickToggleMenu: () => {
      inputs.setState(s => ({ showOptions: !s.showOptions }));
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