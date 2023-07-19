import { RecursiveRecord, Store, createStore, deserialize, mustBe, updateFunctions, getStore } from "olik";
import React from "react";
import styled from "styled-components";


export const Tree = (props: {
  state: RecursiveRecord | null,
  query: string,
  className?: string,
}) => {
  const storeRef = React.useRef<Store<RecursiveRecord> | null>(null);
  const stateRef = React.useRef<unknown | null>(null);
  const createdStore = React.useRef(false);
  const justUpdated = React.useRef(false);

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

  // determine selected state
  let subStore: Store<unknown> = storeRef.current;
  props.query
    .split('.')
    .filter(i => !!i)
    .forEach(key => {
      const arg = key.match(/\(([^)]*)\)/)?.[1];
      const containsParenthesis = arg !== null && arg !== undefined;
      let subStoreLocal: Store<unknown>;
      if (containsParenthesis) {
        const functionName = key.split('(')[0];
        const typedArg = deserialize(arg);
        const storeProp = mustBe.record(subStore)[functionName];
        if (typeof storeProp !== 'function') {
          return;
        } else {
          const storeFunction = mustBe.function<unknown, Store<unknown>>(storeProp);
          if (updateFunctions.includes(functionName)) {
            const updateRequested = props.query.endsWith('\n');
            if (updateRequested) {
              justUpdated.current = true;
              subStoreLocal = storeFunction(typedArg);
              chrome?.tabs?.query({ active: true })
                .then(result => chrome.scripting.executeScript({
                  target: { tabId: result[0].id! },
                  func: (action) => document.getElementById('olik-action')!.innerHTML = action,
                  args: [props.query],
                }))
                .catch(console.error);
            }
            return;
          } else {
            subStoreLocal = storeFunction(typedArg);
          }
        }
      } else {
        subStoreLocal = mustBe.record<Store<unknown>>(subStore)[key];
      }
      const state = subStoreLocal.$state;
      if (state == null || (Array.isArray(state) && state.every(e => e == null))) {
        return;
      }
      stateRef.current = state;
      subStore = subStoreLocal;
    });

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

