import { Store, createStore, updateFunctions } from "olik";
import React from "react";
import styled from "styled-components";
import { getStore } from 'olik';


export const Tree = (props: {
  state: any,
  query: string,
  className?: string,
}) => {
  const storeRef = React.useRef<Store<Record<string, any>> | null>(null);
  const stateRef = React.useRef(null);
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
      storeRef.current = getStore() as any as Store<Record<string, any>>;
    } else {
      createdStore.current = true;
      storeRef.current = createStore<Record<string, any>>({ state: props.state });
    }
  }
  if (chrome.runtime) {
    storeRef.current.$set(props.state);
  }
  stateRef.current = props.state;

  // determine selected state
  let subStore: Store<Record<string, any>> = storeRef.current!;
  props.query
    .split('.')
    .filter(i => !!i)
    .forEach(key => {
      const arg = key.match(/\(([^)]*)\)/)?.[1];
      const containsParenthesis = arg !== null && arg !== undefined;
      let subStoreLocal: Store<Record<string, any>>;
      if (containsParenthesis) {
        const functionName = key.split('(')[0];
        let typedArg = !isNaN(Number(arg)) ? parseFloat(arg)
          : arg === 'true' ? true : arg === 'false' ? false
            : arg;
        if (typeof (typedArg) === 'string') {
          if (typedArg.startsWith(`'`) || typedArg.startsWith(`"`)) {
            typedArg = typedArg.slice(1);
          }
          if (typedArg.endsWith(`'`) || typedArg.endsWith(`"`)) {
            typedArg = typedArg.slice(0, -1);
          }
        }
        if (typeof (subStore[functionName]) !== 'function') {
          return;
        } else {
          if (updateFunctions.includes(functionName)) {
            const updateRequested = props.query.endsWith('\n');
            if (updateRequested) {
              justUpdated.current = true;
              subStoreLocal = (subStore[functionName] as any as Function)(typedArg!);
              chrome?.tabs?.query({ active: true })
                .then(result => chrome.scripting.executeScript({
                  target: { tabId: result[0].id! },
                  func: (action) => document.getElementById('olik-action')!.innerHTML = action,
                  args: [props.query],
                }));
            }
            return;
          } else {
            subStoreLocal = (subStore[functionName] as any as Function)(typedArg!);
          }
        }
      } else {
        subStoreLocal = subStore[key] as any as Store<Record<string, any>>;
      }
      const state = subStoreLocal.$state as any;
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

