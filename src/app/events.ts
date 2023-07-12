import { useHooks } from "./hooks";

export const useEvents = (props: ReturnType<typeof useHooks>) => ({
  onEditorChange: (text: string) => (
    props.setQuery(text)
  ),
  onMouseEnterItem: (id: number) => () => {
    props.setQuery(props.items.find(item => item.id === id)?.type || '')
  },
  onMouseLeaveItem: (/*id: number*/) => () => {
    props.setQuery('')
  },
})