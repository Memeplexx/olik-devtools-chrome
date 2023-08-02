import { transact } from 'olik';
import { appStore } from '../store';
import { useHooks } from './hooks';
import { AddButton, Container, PatchButton, ToggleButton, TransactButton } from './styles';


export const Demo = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const hooks = useHooks();
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
          <TransactButton
            children='transact'
            onClick={() => transact(
              () => appStore.num.$add(1),
              () => appStore.arrNum.$push(1),
              () => appStore.obj.one.two.$set('sss'),
            )}
          />
        </>
      }
    />
  )
};



