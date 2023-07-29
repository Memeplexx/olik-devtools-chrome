import { doReadState } from "./functions";
import { useHooks } from "./hooks";
import { RecursiveRecord, libState } from "olik";

export const useEvents = (props: ReturnType<typeof useHooks>) => ({
  onEditorChange: (text: string) => {
    props.setQuery(text);
  },
  onMouseEnterItem: (id: number) => () => {
    const itemIndex = props.items.findIndex(item => item.id === id);
    const item = props.items[itemIndex];
    props.setQuery(item.type);
    const itemBefore = itemIndex === 0
      ? { type: '', state: libState.initialState }
      : props.items.slice(0, itemIndex).reverse().find(item => item.last)!
    props.setSelected({
      before: doReadState(item.type, itemBefore.state),
      after: doReadState(item.type, item.state),
    });
    silentlyUpdateStoreState(props, item.state);
  },
  onMouseLeaveItem: () => {
    if (props.selectedId) {
      const item = props.items.find(item => item.id === props.selectedId)!;
      props.setQuery(item.type);
      props.setSelected(null);
      silentlyUpdateStoreState(props, item.state);
    } else {
      props.setQuery('');
      props.setSelected(null);
      silentlyUpdateStoreState(props, props.items[props.items.length - 1].state);
    }
  },
  onClickItem: (id: number) => () => {
    props.setSelectedId(id === props.selectedId ? null : id);
  }
})

const silentlyUpdateStoreState = (props: ReturnType<typeof useHooks>, state: RecursiveRecord) => {
  if (!chrome.runtime) {
    libState.disableDevtoolsDispatch = true;
    props.storeRef.current!.$set(state);
    libState.disableDevtoolsDispatch = false;
  } else {
    const updateStateDiv = (state: string) => document.getElementById('olik-state')!.innerHTML = state;
    chrome.tabs
      .query({ active: true })
      .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: updateStateDiv, args: [JSON.stringify(state)] }))
      .catch(console.error);
  }
}