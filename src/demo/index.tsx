import { appStore } from '../store';
import { useHooks } from './hooks';
import { AddButton, Container, NestedButton, PatchButton, ToggleButton } from './styles';


export const Demo = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const hooks = useHooks();
  const onClickNested = () => {
    const one = appStore.arr.$find.id.$eq(3).id;
    appStore.arr.$find.id.$eq(one).text.$set('changed');
  };
  return (
    <Container
      {...props}
      children={
        <>
          <AddButton
            onClick={() => appStore.num.$add(1)}
            children={`Increment | ${hooks.num}`}
          />
          <PatchButton
            onClick={() => appStore.flatObj.$patch({ one: 'hee', two: 'ggg' })}
            children='patch'
          />
          <PatchButton
            onClick={() => appStore.flatObj.$patch({ one: 'hee', two: 'xxx' })}
            children='patch2'
          />
          <ToggleButton
            onClick={() => appStore.bool.$toggle()}
            children='toggle'
          />
          <ToggleButton
            onClick={() => appStore.modal.$set(appStore.modal.$state ? null : 'confirmDeleteGroup')}
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



