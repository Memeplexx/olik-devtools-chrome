import { useStore } from "./store-utils";


export const useInputs = () => {
  const { store, num } = useStore();
  return {
    store,
    num,
  }
}