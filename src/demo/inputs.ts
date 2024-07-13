import { configureDevtools } from "olik/devtools";
import { hooks } from "./store";




export const useInputs = () => {

  const { store } = hooks.useStore();
  const { local, state: { num, bool } } = hooks.useLocalStore('child', { num: 0, bool: false });
  const numStore = local.num;

  if (typeof (navigator) !== 'undefined' && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    configureDevtools(/*{ whitelist: [store.flatObj.one, store.flatObj.two] }*/); // TODO: fix typing issue

  return {
    store,
    numStore,
    num,
    bool,
  }
}