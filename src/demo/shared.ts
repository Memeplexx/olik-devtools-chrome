import { useInputs } from "./inputs";

export const useShared = ({ store }: ReturnType<typeof useInputs>) => ({
  thing: () => {
    const one = store.arr.$find.id.$eq(3).id;
    store.arr.$find.id.$eq(one).text.$set('changed');
    store.bool.$toggle();
  },
});