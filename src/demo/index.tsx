import { appStore } from '../store';
import { useHooks } from './hooks';



export const Demo = (props: any) => {
  const hooks = useHooks();
  return (
    <div {...props}>
      App
      <button onClick={() => appStore.num.$add(1)}>Increment | {hooks.num}</button>
    </div>
  )
};



