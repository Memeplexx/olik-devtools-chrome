import { useLocalStore, useStore } from "./store-utils";


// const serialize = (...items: Store<unknown>[]) => {
//   items.forEach(readable => {
//     readable.$onChange(result => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const key = (readable as unknown as { $stateActions: StateAction[] }).$stateActions
//         .filter(action => !(action.name in readPropMap))
//         .map(action => action.name).join('.');
//       const value = JSON.stringify(result);
//       urlParams.set(key, value);
//       window.history.replaceState({}, '', `${window.location.href.split('?')[0]}?${urlParams.toString()}`);
//     })
//   });
// }

// useEffect(() => {
//   serialize(store.bool, store.num);
// }, [store]);

export const useInputs = () => {

  const { store } = useStore();
  const { local, state: { num, bool } } = useLocalStore('child', { num: 0, bool: false });
  const numStore = local.num;

  return {
    store,
    numStore,
    num,
    bool,
  }
}