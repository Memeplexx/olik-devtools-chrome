import { useHooks } from "./hooks";

export const useEvents = (props: ReturnType<typeof useHooks>) => ({
  onEditorChange: (text: string) => {
    props.setQuery(text);
  },
  onMouseEnterItem: (id: number) => () => {
    const item = props.items.find(item => item.id === id)!;
    props.setQuery(item.type || '');
    props.setSelectedState(item.state);
  },
  onMouseLeaveItem: (/*id: number*/) => () => {
    props.setQuery('');
    props.setSelectedState(null);
  },
})