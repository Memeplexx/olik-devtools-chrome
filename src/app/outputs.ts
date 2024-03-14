import { Store, deserialize, libState } from "olik";
import { useInputs } from "./inputs";


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
      silentlyApplyStateAction(props, query);
    },
  }
}

const silentlyApplyStateAction = (props: ReturnType<typeof useInputs>, query: string) => {
  if (!chrome.runtime) {
    let store = props.storeRef.current!;
    query.split('.').filter(e => !!e).forEach(key => {
      const arg = key.match(/\(([^)]*)\)/)?.[1];
      const containsParenthesis = arg !== null && arg !== undefined;
      if (containsParenthesis) {
        const functionName = key.split('(')[0];
        const typedArg = deserialize(arg);
        const functionToCall = store[functionName] as unknown as ((arg?: unknown) => unknown);
        store = functionToCall(typedArg) as Store<Record<string, unknown>>;
      } else {
        store = store[key] as unknown as Store<Record<string, unknown>>;
      }
    })
  } else {
    const updateDiv = (query: string) => document.getElementById('olik-action')!.innerHTML = query;
    chrome.tabs
      .query({ active: true })
      .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: updateDiv, args: [query] }))
      .catch(console.error);
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