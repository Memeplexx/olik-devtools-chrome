import { StoreInternal } from "olik/dist/type-internal";
import { useHooks } from "./hooks";

export const useEvents = (props: ReturnType<typeof useHooks>) => ({
  onEditorChange: (text: string) => {
    props.setQuery(text);
  },
  onMouseEnterItem: (id: number) => () => {
    const item = props.items.find(item => item.id === id)!;
    props.setQuery(item.type || '');
    props.setSelectedState(item.state);

    const internals = (props.storeRef.current as unknown as StoreInternal).$internals;
    internals.disableDevtoolsDispatch = true;
    props.storeRef.current!.$set(item.globalState);
    internals.disableDevtoolsDispatch = false;
  },
  onMouseLeaveItem: () => {
    props.setQuery('');
    props.setSelectedState(null);
  },
})