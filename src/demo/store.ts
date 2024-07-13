import { createStore } from "olik";
import { createUseStoreHooks } from "olik-react";
import { initialState } from "./constants";





const store = (!chrome.runtime ? createStore(initialState) : undefined)!;

export const hooks = (!chrome.runtime ? createUseStoreHooks(store) : undefined)!;