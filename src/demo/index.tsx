import { appStore } from '../store';
import { useHooks } from './hooks';
import { AddButton, Container, NestedButton, PatchButton, ToggleButton } from './styles';


export const Demo = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const hooks = useHooks();
  const onClickIncrement = () => {
    appStore.num.$add(1); 
  }
  const thing = () => {
    const one = appStore.arr.$find.id.$eq(3).id;
    appStore.arr.$find.id.$eq(one).text.$set('changed');
    appStore.bool.$toggle();
  }
  const onClickNested = () => {
    thing();
  };
  const onClickPatch = () => {
    appStore.flatObj.$patch({ one: 'hee', two: '' });
  }
  const onClickPatch2 = () => {
    appStore.flatObj.$patch({ one: 'hee', two: appStore.arr.$find.id.$eq(3).text });
  }
  const onClickToggle = () => {
    appStore.bool.$toggle();
  }
  const onClickToggleModal = () => {
    appStore.modal.$set(appStore.modal.$state ? null : 'confirmDeleteGroup');
  }
  return (
    <Container
      {...props}
      children={
        <>
          <AddButton
            onClick={onClickIncrement}
            children={`Increment | ${hooks.num}`}
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
            if (!appStore.bool.$state) {
              appStore.bool.$set(true)
            } else {
              appStore.bool.$set(false)
            }
          }}>TEST</button>
        </>
      }
    />
  )
};



