import { appStore } from '../store';
import { useHooks } from './hooks';
import { AddButton, Container } from './styles';


export const Demo = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const hooks = useHooks();
  return (
    <Container 
      {...props}
      inside={
        <>
          App
          <AddButton 
            onClick={() => appStore.num.$add(1)}
            inside={`Increment | ${hooks.num}`}
          />
        </>
      }
    />
  )
};



