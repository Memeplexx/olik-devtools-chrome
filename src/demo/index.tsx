import { transact } from 'olik';
import { appStore } from '../store';
import { useHooks } from './hooks';
import { AddButton, Container, TransactButton } from './styles';


export const Demo = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const hooks = useHooks();
  return (
    <Container 
      {...props}
      children={
        <>
          App
          <AddButton 
            onClick={() => appStore.num.$add(1)}
            children={`Increment | ${hooks.num}`}
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



