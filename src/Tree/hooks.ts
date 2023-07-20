import { RecursiveRecord, Store, createStore, deserialize, getStore, updateFunctions } from "olik";
import React from "react";
import { TreeProps } from "./constants";
import { StoreInternal } from "olik/dist/type-internal";

export const useHooks = (props: TreeProps) => {

  const state = useState(props);

  return {
    state
  }
}

const useState = (props: TreeProps) => {
  const storeRef = React.useRef<Store<RecursiveRecord> | null>(null);
  const stateRef = React.useRef<unknown | null>(null);
  const createdStore = React.useRef(false);
  const justUpdated = React.useRef(false);

  if (props.selectedState) {
    return props.selectedState;
  }

  if (!props.state) {
    return;
  }

  if (justUpdated.current) {
    setTimeout(() => justUpdated.current = false);
    return;
  }

  // initialize store
  if (!storeRef.current) {
    if (!chrome.runtime) {
      storeRef.current = getStore();
    } else {
      createdStore.current = true;
      storeRef.current = createStore<RecursiveRecord>({ state: props.state });
    }
  }
  if (chrome.runtime) {
    storeRef.current.$set(props.state);
  }
  stateRef.current = props.state;

  let subStore = getStore() as unknown as StoreInternal;
  const segments = props.query.split('.');
  if (segments[0] === 'store') {
    segments.shift();
  }
  segments.forEach(key => {
    const arg = key.match(/\(([^)]*)\)/)?.[1];
    const containsParenthesis = arg !== null && arg !== undefined;
    if (containsParenthesis) {
      const functionName = key.split('(')[0];
      const typedArg = deserialize(arg);
      const functionToCall = subStore[functionName];
      if (!updateFunctions.includes(functionName)) {
        subStore = functionToCall(typedArg);
      } else if (props.query.endsWith('\n')) {
        subStore = functionToCall(typedArg);
        justUpdated.current = true;
        chrome?.tabs?.query({ active: true })
          .then(result => chrome.scripting.executeScript({
            target: { tabId: result[0].id! },
            func: (action) => document.getElementById('olik-action')!.innerHTML = action,
            args: [props.query],
          }))
          .catch(console.error);
      }
    } else {
      subStore = subStore[key];
    }
    if (subStore) {
      const state = subStore.$state;
      if (state != null && (!Array.isArray(state) || !state.every(e => e == null))) {
        stateRef.current = state;
      }
    }
  });

  return stateRef.current;
}