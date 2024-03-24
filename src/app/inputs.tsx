import { differenceInHours, differenceInMilliseconds, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { StateAction, createStore, getStore, libState, readState, setNewStateAndNotifyListeners } from "olik";
import { useCallback, useEffect, useRef } from "react";
import { is, isoDateRegexPattern, useRecord } from "../shared/functions";
import { BasicStore } from '../shared/types';
import { Tree } from "../tree";
import { Item, ItemWrapper, Message, State } from "./constants";

export const useInputs = () => {
  const localState = useLocalState();
  instantiateStore(localState);
  useMessageHandler(localState);
  return localState;
}

export const useLocalState = () => {
  const record = useRecord({
    error: '',
    storeFullyInitialized: false,
    storeStateInitial: null as Record<string, unknown> | null,
    storeState: null as Record<string, unknown> | null,
    storeStateVersion: null as Record<string, unknown> | null,
    selectedId: null as number | null,
    items: new Array<ItemWrapper>(),
    hideUnchanged: false,
    query: '',
  });
  return {
    ...record,
    storeRef: useRef<BasicStore | null>(null),
    treeRef: useRef<HTMLDivElement | null>(null),
    idRefOuter: useRef(0),
    idRefInner: useRef(0),
  };
}

const instantiateStore = (arg: State) => {
  if (arg.storeRef.current) { return; }
  if (!chrome.runtime) {
    arg.storeRef.current = getStore<Record<string, unknown>>(); // get store from demo app
    setTimeout(() => {
      arg.setState({ storeFullyInitialized: true });
      document.getElementById('olik-init')!.innerHTML = 'done';
    });
  } else {
    libState.initialState = undefined;
    arg.storeRef.current = createStore<Record<string, unknown>>({});
    arg.setState({ storeFullyInitialized: true });
    const notifyAppOfInitialization = () => document.getElementById('olik-init')!.innerHTML = 'done';
    chrome.tabs
      .query({ active: true })
      .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: notifyAppOfInitialization }))
      .catch(console.error);
  }
}

const useMessageHandler = (props: State) => {
  const { setState } = props;
  const processEvent = useCallback((incoming: Message) => setState(s => {
    if (!incoming.action) { return s; }
    if (incoming.action.type === '$load()') {
      props.storeRef.current = null;
      return { storeFullyInitialized: false, items: [] };
    }
    const itemsFlattened = s.items.flatMap(ss => ss.items);
    const fullStateBefore = !itemsFlattened.length ? {} : itemsFlattened[itemsFlattened.length - 1].state;
    const date = new Date();
    const time = !itemsFlattened.length ? '0ms' : getTimeDiff(date, itemsFlattened[itemsFlattened.length - 1].date);
    if (chrome.runtime) {
      libState.disableDevtoolsDispatch = true;
      setNewStateAndNotifyListeners({ stateActions: incoming.stateActions });
      libState.disableDevtoolsDispatch = false;
    }
    const fullStateAfter = props.storeRef.current!.$state;
    const payload = incoming.action.payloadOrig !== undefined ? incoming.action.payloadOrig : incoming.action.payload;
    const doReadState = (state: Record<string, unknown>) => {
      let stateActions = new Array<StateAction>();
      const mergeMatchingIndex = incoming.stateActions.findIndex(s => s.name === '$mergeMatching');
      if (mergeMatchingIndex !== -1) {
        const withIndex = incoming.stateActions.findIndex(s => s.name === '$with');
        const matcherPath = incoming.stateActions.slice(mergeMatchingIndex + 1, withIndex);
        if (is.array<Record<string, unknown>>(payload)) {
          const payloadSelection = payload.map(p => matcherPath.reduce((prev, curr) => prev[curr.name] as Record<string, unknown>, p))
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
    const currentEvent = getCleanStackTrace(incoming.trace);
    const previousEvent = !s.items.length ? '' : s.items[s.items.length - 1].event;
    const getNewItem = () => ({
      id: ++props.idRefInner.current,
      jsx: getTypeJsx({
        type: incoming.action.type,
        payload,
        stateBefore,
        stateAfter,
        setState,
        idOuter: props.idRefOuter.current,
        idInner: props.idRefInner.current,
        hideUnchanged: false,
      }),
      jsxPruned: getTypeJsx({
        type: incoming.action.type,
        payload,
        stateBefore,
        stateAfter,
        setState,
        idOuter: props.idRefOuter.current,
        idInner: props.idRefInner.current,
        hideUnchanged: true,
      }),
      state: fullStateAfter,
      payload: incoming.action.payload,
      contractedKeys: [],
      time,
      date,
    } satisfies Item);
    return {
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
            id: ++props.idRefOuter.current,
            event: currentEvent,
            items: [getNewItem()],
            visible: true,
            headerExpanded: false,
          }
        ],
    };
  }), [props.idRefInner, props.idRefOuter, props.storeRef, setState]);

  useEffect(() => {
    if (!props.storeFullyInitialized) { return; }
    const messageListener = (e: MessageEvent<Message>) => {
      if (e.origin !== window.location.origin) { return; }
      if (e.data.source !== 'olik-devtools-extension') { return; }
      processEvent(e.data);
    }
    const chromeMessageListener = (event: Message) => {
      const recurse = (val: unknown): unknown => {
        if (is.record(val)) {
          Object.keys(val).forEach(key => val[key] = recurse(val[key]))
        } else if (is.array(val)) {
          return val.map(recurse);
        } else if (is.string(val) && isoDateRegexPattern.test(val)) {
          return new Date(val);
        }
        return val;
      }
      event.action.payload = recurse(event.action.payload);
      event.action.payloadOrig = recurse(event.action.payloadOrig);
      event.stateActions = event.stateActions.map(sa => ({ ...sa, arg: recurse(sa.arg) }));
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

const getTypeJsx = (arg: {
  type: string,
  payload: unknown,
  stateBefore: unknown,
  stateAfter: unknown,
  setState: ReturnType<typeof useLocalState>['setState'],
  idOuter: number,
  idInner: number,
  hideUnchanged: boolean,
}) => {
  // export const updateFunctionsConst = ['$set', '$setUnique', '$patch', '$patchDeep', '$delete', '$setNew', '$add', '$subtract', '$clear', '$push', '$with', '$toggle', '$merge', '$deDuplicate'] as const;
  const segments = arg.type.split('.');
  const func = segments.pop()!.slice(0, -2);
  const actionType = [...segments, func].join('.')
  const unchanged = new Array<string>();
  const updateUnchanged = (stateBefore: unknown, stateAfter: unknown) => {
    const recurse = (before: unknown, after: unknown, keyCollector: string) => {
      if (is.record(after)) {
        if (JSON.stringify(after) === JSON.stringify(before)) {
          unchanged.push(keyCollector);
        }
        Object.keys(after).forEach(key => recurse(is.record(before) ? before[key] : {}, after[key], `${keyCollector}.${key}`));
      } else if (is.array(after)) {
        if (JSON.stringify(after) === JSON.stringify(before)) {
          unchanged.push(keyCollector);
        }
        after.forEach((_, i) => recurse(is.array(before) ? before[i] : [], after[i], `${keyCollector}.${i}`));
      } else if (before === after) {
        unchanged.push(keyCollector);
      }
    }
    recurse(stateBefore, stateAfter, '');
  }
  if (['$set', '$setUnique', '$setNew', '$patchDeep', '$patch', '$with', '$merge'].includes(func)) {
    updateUnchanged(arg.stateBefore, arg.stateAfter);
  } else if (['$clear'].includes(func) && is.array(arg.stateBefore) && !arg.stateBefore.length) {
    unchanged.push('');
  }

  const onClickNodeKey = (key: string) => arg.setState(s => ({
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
            jsx: Tree({
              actionType,
              state: arg.stateAfter,
              contractedKeys,
              onClickNodeKey,
              unchanged,
              hideUnchanged: false,
            }),
            jsxPruned: Tree({
              actionType,
              state: arg.stateAfter,
              contractedKeys,
              onClickNodeKey,
              unchanged,
              hideUnchanged: true,
            }),
          } satisfies Item
        })
      }
    })
  }));
  return Tree({
    actionType,
    state: arg.payload,
    contractedKeys: [],
    unchanged,
    onClickNodeKey,
    hideUnchanged: arg.hideUnchanged,
  });
}

const getTimeDiff = (from: Date, to: Date) => {
  const milliseconds = differenceInMilliseconds(from, to);
  if (milliseconds < 10 * 1000) {
    return `${milliseconds} ms`;
  } else if (milliseconds < 60 * 1000) {
    return `${differenceInSeconds(from, to)} s`;
  } else if (milliseconds < 60 * 60 * 1000) {
    return `${differenceInMinutes(from, to)} m`;
  } else if (milliseconds < 24 * 60 * 60 * 1000) {
    return `${differenceInHours(from, to)} h`;
  } else {
    return to.toLocaleDateString();
  }
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
  .map(s => s.replace('///', '').replace('//', ' '))
  .reverse();
