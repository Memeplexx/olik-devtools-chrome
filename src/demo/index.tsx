import { useRef } from 'react';
import { useInputs } from './inputs';
import { AddButton, Container, NestedButton, PatchButton, ToggleButton } from './styles';


export const Demo = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const inputs = useInputs();
  const { store } = inputs;
  const onClickIncrement = () => {
    store.num.$add(1);
  }
  const thing = () => {
    const one = store.arr.$find.id.$eq(3).id;
    store.arr.$find.id.$eq(one).text.$set('changed');
    store.bool.$toggle();
  }
  const onClickNested = () => {
    thing();
  };
  const onClickPatch = () => {
    store.flatObj.$patch({ one: 'hee', two: '' });
  }
  const onClickPatch2 = () => {
    store.flatObj.$patch({ one: 'hee', two: store.arr.$find.id.$eq(3).text });
  }
  const onClickToggle = () => {
    store.bool.$toggle();
  }
  const onClickToggleModal = () => {
    store.modal.$set(store.modal.$state ? null : 'confirmDeleteGroup');
  }
  const num = useRef(0);
  return (
    <Container
      {...props}
      children={
        <>
          <AddButton
            onClick={onClickIncrement}
            children={`Increment | ${inputs.num}`}
          />
          <PatchButton
            onClick={onClickPatch}
            children='patch'
          />
          <PatchButton
            onClick={onClickPatch2}
            children='patch2'
          />
          <ToggleButton
            onClick={onClickToggle}
            children='toggle'
          />
          <ToggleButton
            onClick={onClickToggleModal}
            children='toggle modal'
          />
          <NestedButton
            onClick={onClickNested}
            children='nested'
          />
          <button onClick={() => {
            if (!store.bool.$state) {
              store.bool.$set(true)
            } else {
              store.bool.$set(false)
            }
          }}>TEST</button>
          <button onClick={() => {
            store.arr.$push({ id: num.current++, text: 'new' });
          }}>Add</button>
          <button onClick={() => {
            store.arr.$find.id.$eq(2).$delete();
          }}>Remove</button>
          <button onClick={() => {
            store.arr.$find.id.$eq(1).text.$set('changed');
          }}>Update</button>
        </>
      }
    />
  )
};



