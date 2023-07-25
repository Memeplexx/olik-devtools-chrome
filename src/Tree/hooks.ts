import { RecursiveRecord, Store, createStore, deserialize, getStore, updateFunctions } from "olik";
import React from "react";
import { TreeProps } from "./constants";
import { StoreInternal } from "olik/dist/type-internal";

type TreeState = TreeProps & ReturnType<typeof useInitialHooks>;

export const useHooks = (props: TreeProps) => {
  const state = useInitialHooks(props);
  if (props.selectedState) { return beautifyJson(props.selectedState); }
  if (state.justUpdated.current) { setTimeout(() => state.justUpdated.current = false); return ''; }
  initializeStore(state);
  selectStore(state, sendActionToApp(props));
  return beautifyJson(state.stateRef.current);
}

const useInitialHooks = (props: TreeProps) => {
  const storeRef = React.useRef<Store<RecursiveRecord> | null>(null);
  const stateRef = React.useRef<unknown | null>(null);
  const justUpdated = React.useRef(false);
  return {
    ...props,
    storeRef,
    stateRef,
    justUpdated
  }
}

const initializeStore = (props: TreeState) => {
  if (!props.storeRef.current) {
    if (!chrome.runtime) {
      props.storeRef.current = getStore(); // get store from demo app
    } else {
      props.storeRef.current = createStore<RecursiveRecord>({ state: props.state! });
    }
  }
  if (chrome.runtime) {
    props.storeRef.current.$set(props.state!);
  }
}

const selectStore = (props: TreeState, onActionRequested: () => unknown) => {
  props.stateRef.current = props.state;
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
        props.justUpdated.current = true;
        onActionRequested();
      }
    } else {
      subStore = subStore[key];
    }
    if (subStore) {
      const state = subStore.$state;
      if (state != null && (!Array.isArray(state) || !state.every(e => e == null))) {
        props.stateRef.current = state;
      }
    }
  });
}

const sendActionToApp = (props: TreeProps) => {
  return () => chrome?.tabs?.query({ active: true })
    .then(result => chrome.scripting.executeScript({
      target: { tabId: result[0].id! },
      func: (action) => document.getElementById('olik-action')!.innerHTML = action,
      args: [props.query],
    }))
    .catch(console.error);
}

const beautifyJson = (object: unknown) => {
  if (!object) { return ''; }
  return JSON.stringify(object, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}
