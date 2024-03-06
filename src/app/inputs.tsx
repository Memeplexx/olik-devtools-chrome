import { StateAction, Store, createStore, getStore, libState, readState, setNewStateAndNotifyListeners } from "olik";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTreeHTML, is } from "../shared/functions";
import { getStateAsJsx } from "../tree/tree-maker";
import { Item, ItemWrapper, Message } from "./constants";

export const useInputs = () => {

  const localState = useLocalState();

  instantiateState(localState);

  instantiateStore(localState);

  useMessageHandler(localState);

  const itemsForView = useMemo(() => {
    return (localState.items
      .map(ii => ({ ...ii, items: ii.items.filter(i => !localState.hideIneffectiveActions || !i.ineffective) })))
      .filter(i => i.visible)
  }, [localState.items, localState.hideIneffectiveActions]);

  return {
    ...localState,
    itemsForView,
  };
}

const useLocalState = () => {
  const [state, setState] = useState({
    error: '',
    storeFullyInitialized: false,
    incomingNum: 0,
    storeStateInitial: null as Record<string, unknown> | null,
    storeState: null as Record<string, unknown> | null,
    storeStateVersion: null as Record<string, unknown> | null,
    storeRef: useRef<Store<Record<string, unknown>> | null>(null),
    treeRef: useRef<HTMLDivElement | null>(null),
    idRefOuter: useRef(0),
    idRefInner: useRef(0),
    selectedId: null as number | null,
    selected: '',
    items: new Array<ItemWrapper>(),
    hideIneffectiveActions: false,
    query: '',
  });
  return { ...state, setState };
}

const instantiateState = (arg: ReturnType<typeof useLocalState>) => {
  if (arg.storeState) { return; }
  const initializeLocalState = (state: Record<string, unknown>) => arg.setState(s => ({
    ...s,
    storeFullyInitialized: true,
    storeStateInitial: state,
    storeState: state,
    items: [{
      id: ++s.idRefOuter.current,
      event: ['🥚 createStore'],
      visible: true,
      items: [{
        contractedKeys: [],
        id: ++s.idRefInner.current,
        jsxFormatted: getTypeJsx({
          type: '$setNew()',
          payload: state,
          stateBefore: null,
          stateAfter: state,
          setState: arg.setState,
          idOuter: s.idRefOuter.current,
          idInner: s.idRefInner.current,
        }),
        state,
        last: true,
        payload: null,
        ineffective: false,
      }],
    }],
  }))
  const readInitialState = () => {
    const el = document.getElementById('olik-state');
    if (!el) {
      arg.setState(s => ({ ...s, error: 'No store found' }));
      return {};
    }
    return JSON.parse(el.innerHTML) as Record<string, unknown>;
  }
  if (!chrome.runtime) {
    setTimeout(() => {
      initializeLocalState(readInitialState());
    });
  } else {
    chrome.tabs
      .query({ active: true })
      .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: readInitialState }))
      .then(r => initializeLocalState(r[0].result))
      .catch(console.error);
  }
}

const instantiateStore = (arg: ReturnType<typeof useLocalState>) => {
  if (arg.storeRef.current || !arg.storeState) { return; }
  if (!chrome.runtime) {
    arg.storeRef.current = getStore<Record<string, unknown>>(); // get store from demo app
  } else {
    arg.storeRef.current = createStore<Record<string, unknown>>(arg.storeState);
  }
}

const useMessageHandler = (props: ReturnType<typeof useLocalState>) => {
  const { setState } = props;
  const processEvent = useCallback((incoming: Message) => setState(s => {
    const fullStateBefore = s.items[s.items.length - 1].items[s.items[s.items.length - 1].items.length - 1].state;
    if (chrome.runtime) {
      libState.disableDevtoolsDispatch = true;
      setNewStateAndNotifyListeners({ stateActions: incoming.stateActions });
      libState.disableDevtoolsDispatch = false;
    }
    const fullStateAfter = s.storeRef.current!.$state;
    const payload = incoming.action.payloadOrig || incoming.action.payload
    const doReadState = (state: Record<string, unknown>) => {
      let stateActions = new Array<StateAction>();
      const mergeMatchingIndex = incoming.stateActions.findIndex(s => s.name === '$mergeMatching');
      if (mergeMatchingIndex !== -1) {
        const withIndex = incoming.stateActions.findIndex(s => s.name === '$with');
        const matcherPath = incoming.stateActions.slice(mergeMatchingIndex + 1, withIndex);
        if (is.array(payload)) {
          const payloadArray = payload as Array<Record<string, unknown>>;
          const payloadSelection = payloadArray.map(p => matcherPath.reduce((prev, curr) => prev[curr.name] as Record<string, unknown>, p))
          stateActions = [...incoming.stateActions.slice(0, mergeMatchingIndex), { name: '$filter' }, ...matcherPath, { name: '$in', arg: payloadSelection }];
        } else {
          const payloadSelection = matcherPath.reduce((prev, curr) => prev[curr.name] as Record<string, unknown>, payload as Record<string, unknown>);
          stateActions = [...incoming.stateActions.slice(0, mergeMatchingIndex), { name: '$find' }, ...matcherPath, { name: '$eq', arg: payloadSelection }];
        }
      } else {
        stateActions = incoming.stateActions.slice(0, incoming.stateActions.length - 1);
      }
      stateActions.push({ name: '$state' });
      return readState({ state, stateActions, cursor: { index: 0 } });
    }
    const stateBefore = doReadState(fullStateBefore);
    const stateAfter = doReadState(fullStateAfter);
    const stateHasNotChanged = stateBefore === stateAfter;
    const currentEvent = getCleanStackTrace(incoming.trace);
    const previousEvent = !s.items.length ? '' : s.items[s.items.length - 1].event;
    const getNewItem = () => ({
      id: ++s.idRefInner.current,
      jsxFormatted: getTypeJsx({
        type: incoming.action.type,
        payload,
        stateBefore,
        stateAfter,
        setState,
        idOuter: s.idRefOuter.current,
        idInner: s.idRefInner.current
      }),
      state: fullStateAfter,
      last: true,
      payload: incoming.action.payload,
      ineffective: stateHasNotChanged,
      contractedKeys: [],
    } satisfies Item);
    return {
      ...s,
      storeState: fullStateAfter,
      items: currentEvent.toString() === previousEvent.toString()
        ? [
          ...s.items.slice(0, s.items.length - 1),
          {
            ...s.items[s.items.length - 1],
            items: [...s.items[s.items.length - 1].items, getNewItem()],
            visible: true,
          }
        ] : [
          ...s.items,
          {
            id: ++s.idRefOuter.current,
            event: currentEvent,
            items: [getNewItem()],
            visible: true
          }
        ],
      selected: getTreeHTML({
        before: fullStateBefore,
        after: fullStateAfter,
        depth: 1
      }),
    };
  }), [setState]);

  useEffect(() => {
    if (!props.storeFullyInitialized) { return; }
    const messageListener = (e: MessageEvent<Message>) => {
      if (e.origin !== window.location.origin) { return; }
      if (e.data.source !== 'olik-devtools-extension') { return; }
      processEvent(e.data);
    }
    const chromeMessageListener = (event: Message) => {
      processEvent(event);
    }
    if (!chrome.runtime) {
      window.addEventListener('message', messageListener);
    } else {
      chrome.runtime.onMessage
        .addListener(chromeMessageListener);
    }
    return () => {
      window.removeEventListener('message', messageListener);
      chrome.runtime?.onMessage.removeListener(chromeMessageListener);
    }
  }, [processEvent, props.storeFullyInitialized])
}

const getTypeJsx = (arg: { type: string, payload: unknown, stateBefore: unknown, stateAfter: unknown, setState: ReturnType<typeof useLocalState>['setState'], idOuter: number, idInner: number }) => {
  // export const updateFunctionsConst = ['$set', '$setUnique', '$patch', '$patchDeep', '$delete', '$setNew', '$add', '$subtract', '$clear', '$push', '$with', '$toggle', '$merge', '$deDuplicate'] as const;
  const segments = arg.type.split('.');
  const func = segments.pop()!.slice(0, -2);
  const actionType = [...segments, func].join('.')
  const highlights = new Array<string>();
  const updateHighlights = (stateBefore: unknown, stateAfter: unknown) => {
    const recurse = (before: unknown, after: unknown, keyCollector: string) => {
      if (is.nonArrayObject(after)) {
        Object.keys(after).forEach(key => recurse(is.nonArrayObject(before) ? before[key] : {}, after[key], `${keyCollector}.${key}`));
      } else if (is.array(after)) {
        after.forEach((_, i) => recurse(is.array(before) ? before[i] : [], after[i], `${keyCollector}.${i}`));
      } else if (before !== after) {
        highlights.push(keyCollector);
      }
    }
    recurse(stateBefore, stateAfter, '');
  }
  if (['$set', '$setUnique', '$setNew', '$patchDeep', '$patch', '$with', '$merge'].includes(func)) {
    updateHighlights(arg.stateBefore, arg.stateAfter);
  } else if (['$add', '$subtract', '$toggle', '$delete'].includes(func)) {
    highlights.push('');
  } else if (['$clear'].includes(func) && is.array(arg.stateBefore)) {
    highlights.push(...(arg.stateBefore.length ? [''] : []));
  } else if (['$push'].includes(func)) {
    updateHighlights(arg.stateBefore, arg.payload);
  }

  const onClickNodeKey = (key: string) => {
    arg.setState(s => ({
      ...s,
      items: s.items.map(itemOuter => {
        if (itemOuter.id !== arg.idOuter) { return itemOuter; }
        return {
          ...itemOuter,
          items: itemOuter.items.map(itemInner => {
            if (itemInner.id !== arg.idInner) { return itemInner; }
            const contractedKeys = itemInner.contractedKeys.includes(key) ? itemInner.contractedKeys.filter(k => k !== key) : [...itemInner.contractedKeys, key];
            return {
              ...itemInner,
              contractedKeys,
              jsxFormatted: getStateAsJsx({
                actionType,
                state: arg.stateAfter,
                contractedKeys,
                onClickNodeKey,
                highlights
              }),
            }
          })
        }
      })
    }));
  }
  return getStateAsJsx({
    actionType,
    state: arg.payload,
    contractedKeys: [],
    highlights,
    onClickNodeKey,
  });
}

const getCleanStackTrace = (stack: string) => stack
  .trim()
  .substring('Error'.length)
  .trim()
  .split('\n')
  .filter(s => !s.includes('node_modules'))
  .map(s => s.trim().substring('at '.length).trim())
  .map(s => {
    const [fn, filePath] = s.split(' (');
    let url: string;
    const fun = fn.substring(fn.indexOf('.') + 1);
    try {
      url = new URL(filePath.replace('(app-pages-browser)/', '').substring(1, filePath.length - 2)).pathname;
    } catch (e) {
      return { fn: fun, filePath: '' };
    }
    return { fn: fun, filePath: url };
  })
  .filter(s => s.filePath !== '')
  .map(s => ({ ...s, filePath: s.filePath.includes(':') ? s.filePath.substring(0, s.filePath.indexOf(':')) : s.filePath }))
  .map(s => ({ ...s, filePath: s.filePath.replace(/\.[^/.]+$/, "") }))
  .map(s => `${s.filePath}.${s.fn}`)
  .map(s => s.replace('///', '').replace('//', '🥚 '))
  .reverse();
