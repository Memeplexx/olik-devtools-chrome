import { appStore } from '../store';
import { useHooks } from './hooks';
import { AddButton, Container, NestedButton, PatchButton, ToggleButton } from './styles';


export const Demo = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const hooks = useHooks();
  const onClickIncrement = () => {
    appStore.num.$add(1); 
  }
  const onClickNested = () => {
    const one = appStore.arr.$find.id.$eq(3).id;
    appStore.arr.$find.id.$eq(one).text.$set('changed');
    appStore.bool.$toggle();
  };
  const onClickPatch = () => {
    appStore.flatObj.$patch({ one: 'hee', two: 'ggg' });
  }
  const onClickPatch2 = () => {
    appStore.flatObj.$patch({ one: 'hee', two: 'xxx' })
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
        </>
      }
    />
  )
};



