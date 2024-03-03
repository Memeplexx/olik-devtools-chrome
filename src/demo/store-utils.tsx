import { Store, createStore, libState } from 'olik';
import { augmentOlikForReact, createUseStoreHook } from 'olik-react';
import { connectOlikDevtoolsToStore } from 'olik/devtools';
import { createContext, useMemo } from "react";
import { AppState, initialState } from './constants';



export const StoreContext = createContext<Store<AppState> | undefined>(undefined);

export const useStore = createUseStoreHook(StoreContext);

export default function StoreProvider({ children }: { children: React.ReactNode }) {

  augmentOlikForReact() // invoke before initializing store

  const store = useMemo(() => createStore(/*!chrome.runtime ? {} as typeof initialState :*/ initialState), []);

  if (!libState.olikDevtools && typeof(navigator) !== 'undefined' && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    connectOlikDevtoolsToStore({ trace: true });
  }

  return (
    <StoreContext.Provider
      value={store}
      children={children}
    />
  );
}
