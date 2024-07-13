import { useInputs } from "./inputs";
import { useShared } from "./shared";

export const useOutputs = (inputs: ReturnType<typeof useInputs>) => {
  const { store, numStore } = inputs;
  const shared = useShared(inputs);
  const result = {
    increment: () => {
      numStore.$add(1);
    },
    patch: () => {
      store.flatObj.$patch({ one: 'hee', two: '' });
    },
    patchDeep: () => {
      store.obj.$patchDeep({ one: { two: 'hee', three: true, four: 4 }, two: { three: [[9]] } });
    },
    toggle: () => {
      store.bool.$toggle();
    },
    toggleModal: () => {
      store.modal.$set(store.modal.$state ? null : 'confirmDeleteGroup');
    },
    set: () => {
      store.bool.$set(!store.$state.bool);
    },
    push: () => {
      store.arr.$push({ id: Math.max(...store.$state.arr.map(a => a.id)), text: 'new' });
    },
    delete: () => {
      const id = store.$state.arr[0]?.id;
      if (!id) return;
      store.arr.$find.id.$eq(id).$delete();
    },
    findAndSet: () => {
      const id = store.$state.arr[0]?.id;
      if (!id) return;
      store.arr.$find.id.$eq(id).text.$set('changed');
    },
    findAndSet2: () => {
      const id = store.$state.arr[0]?.id;
      if (!id) return;
      store.arr.$find.id.$eq(store.arr.$at(0).id).text.$set('changed');
    },
    onClickLongStackTrace: () => {
      shared.thing();
    },
    mergeMatchingArr: () => {
      store.arr.$mergeMatching.id.$with([{ id: 3, text: 'changed' }, { id: 4, text: 'another' }]);
    },
    mergeMatchingSing: () => {
      store.arr.$mergeMatching.id.$with({ id: 3, text: 'changed' })
    },
    setNew: () => {
      store.$setNew({ hello: { one: 'world' } });
    },
    setDate: () => {
      store.dat.$set(new Date());
    },
    setEmptyArray: () => {
      store.arr.$set([]);
      // store.arr.$clear();
    },
    setEmptyArrayDeep: () => {
      store.obj.two.$set({
        three: [],
        five: 'thing'
      })
    },
    setEmptyArrayDeep2: () => {
      // store.$patch({
      //   arrNested: [
      //     [
      //       store.obj.one.four,
      //     ]
      //   ]
      // })
    },
  };
  return result;
};
