import { configureDevtools } from "olik/devtools";
import { createStoreHooks } from "olik-react";
import { initialState } from "./constants";
import { useMemo } from "react";


export const useInputs = () => {

  const { useStore, useLocalStore } = useMemo(() => createStoreHooks(initialState), []);

  const { store } = useStore();
  const { local, state: { num, bool } } = useLocalStore('child', { num: 0, bool: false });
  const numStore = local.num;

  if (typeof (navigator) !== 'undefined' && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    configureDevtools({ whitelist: [store.flatObj.one, store.flatObj.two] }); // TODO: fix typing issue

  return {
    store,
    numStore,
    num,
    bool,
  }
}