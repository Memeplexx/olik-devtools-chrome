import { StateAction, Store, readPropMap } from "olik";
import { useEffect } from "react";
import { useStore } from "./store-utils";


const serialize = (...items: Store<unknown>[]) => {
  items.forEach(readable => {
    readable.$onChange(result => {
      const urlParams = new URLSearchParams(window.location.search);
      const key = (readable as unknown as { $stateActions: StateAction[] }).$stateActions
        .filter(action => !(action.name in readPropMap))
        .map(action => action.name).join('.');
      const value = JSON.stringify(result);
      urlParams.set(key, value);
      window.history.replaceState({}, '', `${window.location.href.split('?')[0]}?${urlParams.toString()}`);
    })
  });
}

export const useInputs = () => {

  const { store, num, localState, localStore } = useStore({ key: 'testing', value: { num: 0, obj: { num2: 0 } } });
  // const { store, num } = useStore();
  useEffect(() => {
    serialize(store.bool, store.num);
  }, [store]);
  return {
    store,
    num,

    localState,
    localStore,
  }
}