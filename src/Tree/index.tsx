import { RecursiveRecord, Store, createStore, deserialize, mustBe, updateFunctions, getStore } from "olik";
import { StoreInternal } from "olik/dist/type-internal";
import React from "react";
import styled from "styled-components";


export const Tree = (props: {
  state: RecursiveRecord | null,
  query: string,
  selectedState: RecursiveRecord | null,
  className?: string,
}) => {
  const storeRef = React.useRef<Store<RecursiveRecord> | null>(null);
  const stateRef = React.useRef<unknown | null>(null);
  const createdStore = React.useRef(false);
  const justUpdated = React.useRef(false);

  if (props.selectedState) {
    return (
      <ScrollPane className={props.className}>
        <JsonWrapper>
          {JSON.stringify(props.selectedState, null, 2)}
        </JsonWrapper>
      </ScrollPane>
    );
  }

  if (!props.state) {
    return <div></div>;
  }

  if (justUpdated.current) {
    setTimeout(() => justUpdated.current = false);
    return <div></div>;
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
  })

  console.log('!')
  return (
    <ScrollPane className={props.className}>
      <JsonWrapper>
        {JSON.stringify(stateRef.current, null, 2)}
      </JsonWrapper>
    </ScrollPane>
  );
}




const ScrollPane = styled.div`
  overflow: auto;
`;

const JsonWrapper = styled.pre`
  font-family: 'Source Code Pro', monospace;
  font-size: 12px;
`;

