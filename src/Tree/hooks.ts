import { RecursiveRecord, Store, createStore, deserialize, getStore, updateFunctions } from "olik";
import React from "react";
import { TreeProps } from "./constants";
import { StoreInternal } from "olik/dist/type-internal";

export const useHooks = (props: TreeProps) => {

  const thing = useState(props);
  const state = !thing ? '' : syntaxHighlight(JSON.stringify(thing, null, 2)).replace(/"([^"]+)":/g, '$1:');

  return {
    state
  }
}

const useState = (props: TreeProps) => {
  const storeRef = React.useRef<Store<RecursiveRecord> | null>(null);
  const stateRef = React.useRef<unknown | null>(null);
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
      storeRef.current = getStore(); // get store from demo app
    } else {
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
        sendActionToApp(props);
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

const sendActionToApp = (props: TreeProps) => {
  chrome?.tabs?.query({ active: true })
    .then(result => chrome.scripting.executeScript({
      target: { tabId: result[0].id! },
      func: (action) => document.getElementById('olik-action')!.innerHTML = action,
      args: [props.query],
    }))
    .catch(console.error);
}

const syntaxHighlight = (json: string) => {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
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