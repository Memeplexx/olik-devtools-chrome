import { getTreeHTML } from "../shared/functions";
import { doReadState } from "./functions";
import { useHooks } from "./hooks";
import { libState } from "olik";

export const useEvents = (props: ReturnType<typeof useHooks>) => ({
  onEditorChange: (text: string) => {
    props.set({ query: text });
  },
  onMouseEnterItem: (id: number) => () => {
    const itemIndex = props.items.findIndex(item => item.id === id);
    const stateBefore = itemIndex > 0 ? props.items[itemIndex - 1].state : libState.initialState;
    const stateAfter = props.items[itemIndex].state;
    const query = props.query.substring('store.'.length);
    const selected = getTreeHTML({
      before: doReadState(query, stateBefore),
      after: doReadState(query, stateAfter),
      depth: 1
    });
    props.set({ selected });
  },
  onClickShowHiddenArgs: () => {
    props.set({ hideIneffectiveActions: !props.hideIneffectiveActions });
  },
  onMouseLeaveItem: () => {
    props.set({ selected: '' });
  },
  onClickItem: (id: number) => () => {
    const item = props.items.find(item => item.id === id)!;
    const segments = item.type.split('.');
    segments.pop();
    props.set({ query: segments.join('.') });
  },
  onClickClear: () => {
    props.set({ items: [] });
  }
})

// const silentlyUpdateAppStoreState = (props: ReturnType<typeof useHooks>, state: RecursiveRecord) => {
//   if (!chrome.runtime) {
//     libState.disableDevtoolsDispatch = true;
//     props.storeRef.current!.$set(state);
//     libState.disableDevtoolsDispatch = false;
//   } else {
//     const updateStateDiv = (state: string) => document.getElementById('olik-state')!.innerHTML = state;
//     chrome.tabs
//       .query({ active: true })
//       .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: updateStateDiv, args: [JSON.stringify(state)] }))
//       .catch(console.error);
//   }
// }