import { Demo } from '.';
import StoreProvider from './store-utils';


export const DemoWrapper = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <StoreProvider
      children={<Demo {...props} />}
    />
  )
};



