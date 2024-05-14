import { StoreDef, createStore } from 'olik';
import { augmentOlikForReact, createUseStoreHook } from 'olik-react';
import { configureDevtools } from 'olik/devtools';
import { createContext, useMemo } from "react";
import { AppState, initialState } from './constants';



export const StoreContext = createContext<StoreDef<AppState> | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = createUseStoreHook(StoreContext);

export default function StoreProvider({ children }: { children: React.ReactNode }) {

  augmentOlikForReact() // invoke before initializing store

  const store = useMemo(() => createStore(initialState), []);

  if (typeof(navigator) !== 'undefined' && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    configureDevtools({ whitelist: [store.flatObj.one, store.flatObj.two] });
  }

  return (
    <StoreContext.Provider
      value={store}
      children={children}
    />
  );
}
