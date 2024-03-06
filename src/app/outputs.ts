import { libState } from "olik";
import { focusId } from "./shared";
import { getTreeHTML } from "../shared/functions";
import { useInputs } from "./inputs";


export const useOutputs = (props: ReturnType<typeof useInputs>) => ({
  onMouseEnterItem: (id: number) => () => {
    if (props.selectedId) { return; }
    focusId(props, id);
    setTimeout(() => {
      const firstTouchedElement = props.treeRef.current!.querySelector('.touched');
      if (firstTouchedElement) {
        firstTouchedElement.scrollIntoView(/*{ behavior: 'smooth' }*/);
      }
    });
  },
  onClickShowHiddenArgs: () => {
    props.setState(s => ({ ...s, hideIneffectiveActions: !props.hideIneffectiveActions }));
  },
  onMouseLeaveItem: () => {
    if (!props.selectedId) {
      const itemsFlattened = props.items.flatMap(i => i.items);
      const id = itemsFlattened[itemsFlattened.length - 1].id;
      const itemIndex = itemsFlattened.findIndex(item => item.id === id);
      const stateBefore = itemsFlattened.slice(0, itemIndex).reverse().find(i => !!i.last)?.state || props.storeStateInitial;
      const stateAfter = itemsFlattened[itemIndex].state;
      const selected = getTreeHTML({
        before: stateBefore,
        after: stateAfter,
        depth: 1
      });
      props.setState(s => ({ ...s, selected }));
    }
  },
  onClickItem: (selectedId: number) => () => {
    const itemsFlattened = props.items.flatMap(i => i.items);
    if (props.selectedId === selectedId) {
      props.setState(s => ({ ...s, selectedId: null }));
      silentlyUpdateAppStoreState(props, itemsFlattened[itemsFlattened.length - 1].state);
    } else {
      props.setState(s => ({ ...s, selectedId, storeStateVersion: itemsFlattened.find(i => i.id === selectedId)!.state }));
      focusId(props, selectedId);
      silentlyUpdateAppStoreState(props, itemsFlattened.find(i => i.id === selectedId)!.state);
    }
  },
  onClickClear: () => {
    props.setState(s => ({ ...s, items: s.items.map(i => ({ ...i, visible: false } ) ) }));
  },
  onQueryChanged: (query: string) => {
    props.setState(s => ({ ...s, query }));
  },
})

const silentlyUpdateAppStoreState = (props: ReturnType<typeof useInputs>, state: Record<string, unknown>) => {
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