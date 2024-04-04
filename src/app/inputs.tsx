import { differenceInHours, differenceInMilliseconds, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { StateAction, createStore, getStore, libState, readState, setNewStateAndNotifyListeners } from "olik";
import { useEffect, useRef } from "react";
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

export const useLocalState = () => useRecord({
  error: '',
  storeState: null as Record<string, unknown> | null,
  storeStateVersion: null as Record<string, unknown> | null,
  changed: new Array<string>(),
  selectedId: null as number | null,
  items: new Array<ItemWrapper>(),
  hideUnchanged: false,
  query: '',
  showOptions: false,
  storeRef: useRef<BasicStore | null>(null),
  treeRef: useRef<HTMLDivElement | null>(null),
  idRefOuter: useRef(0),
  idRefInner: useRef(0),
});

const instantiateStore = (state: State) => {
  if (state.storeRef.current) { return; }
  if (!chrome.runtime) {
    state.storeRef.current = getStore<Record<string, unknown>>(); // get store from demo app
    setTimeout(() => document.getElementById('olik-init')!.innerHTML = 'done');
  } else {
    libState.initialState = undefined;
    state.storeRef.current = createStore<Record<string, unknown>>({});
    const notifyAppOfInitialization = () => document.getElementById('olik-init')!.innerHTML = 'done';
    chrome.tabs
      .query({ active: true })
      .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: notifyAppOfInitialization }))
      .catch(console.error);
  }
}

const useMessageHandler = (state: State) => {
  useEffect(() => {
    const msgListener = (event: MessageEvent<Message>) => messageListener(state, event);
    const chromeListener = (event: Message) => chromeMessageListener(state, event);
    window.addEventListener('message', msgListener);
    chrome.runtime?.onMessage.addListener(chromeListener);
    return () => {
      window.removeEventListener('message', msgListener);
      chrome.runtime?.onMessage.removeListener(chromeListener);
    }
  }, [state])
}

const messageListener = (state: State, event: MessageEvent<Message>) => {
  if (event.origin !== window.location.origin) return;
  if (event.data.source !== 'olik-devtools-extension') return;
  processEvent(state, event.data);
}

const chromeMessageListener = (state: State, event: Message) => {
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
  processEvent(state, event);
}

const doReadState = (state: Record<string, unknown>, incoming: Message, payload: unknown) => {
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

const processEvent = (state: State, incoming: Message) => {
  state.set(s => {
    if (!incoming.action) { return s; }
    if (incoming.action.type === '$load()') {
      s.storeRef.current = null;
      return { storeFullyInitialized: false, items: [] };
    }
    if (chrome.runtime) {
      libState.disableDevtoolsDispatch = true;
      setNewStateAndNotifyListeners(incoming);
      libState.disableDevtoolsDispatch = false;
    }
    const date = new Date();
    const deconstructed = deconstructIncoming(state, incoming);
    const unchanged = updateUnchanged(deconstructed);
    const changed = updateChanged(deconstructed.fullStateBefore, state.storeRef.current!.$state);
    const jsxProps = {
      state: deconstructed.payload,
      unchanged,
      changed,
      actionType: deconstructed.actionType,
      contractedKeys: [],
      onClickNodeKey: onClickNodeKey(state, incoming, deconstructed.actionType, deconstructed.stateAfter, changed, unchanged),
    };
    const storeState = s.storeRef.current!.$state;
    const lastItem = s.items[s.items.length - 1] ?? { event: '' };
    const newItem = {
      id: ++s.idRefInner.current,
      jsx: Tree({ ...jsxProps, hideUnchanged: false }),
      jsxPruned: Tree({ ...jsxProps, hideUnchanged: true }),
      state: storeState,
      payload: incoming.action.payload,
      contractedKeys: [],
      time: getTimeDiff(date, s.items.flatMap(ss => ss.items).at(-1)?.date ?? date),
      date,
      changed,
    } satisfies Item;
    const currentEvent = getCleanStackTrace(incoming.trace);
    const scrollTo = jsxProps.changed[0];
    document.querySelector(`[data-key-input="${scrollTo}"]`)?.scrollIntoView({ behavior: 'smooth' });
    if (currentEvent.toString() === lastItem.event.toString()) {
      return {
        storeState,
        changed,
        items: [
          ...s.items.slice(0, s.items.length - 1),
          {
            ...lastItem,
            items: [...lastItem.items, newItem],
            visible: true,
          }
        ],
      };
    }
    return {
      storeState,
      changed,
      items: [
        ...s.items,
        {
          id: ++s.idRefOuter.current,
          event: currentEvent,
          items: [newItem],
          visible: true,
          headerExpanded: false,
        }
      ],
    };
  });
};

const updateUnchanged = (args: ReturnType<typeof deconstructIncoming>) => {
  const { stateBefore, stateAfter, func } = args;
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
  if (['$set', '$setUnique', '$setNew', '$patchDeep', '$patch', '$with', '$merge', '$toggle', '$add', '$subtract', '$push'].includes(func)) {
    updateUnchanged(stateBefore, stateAfter);
  } else if (['$clear'].includes(func) && is.array(stateBefore) && !stateBefore.length) {
    unchanged.push('');
  }
  return unchanged;
}

const updateChanged = (stateBefore: unknown, stateAfter: unknown) => {
  const changed = new Array<string>();
  const updateChanged = (stateBefore: unknown, stateAfter: unknown) => {
    const recurse = (before: unknown, after: unknown, keyCollector: string) => {
      if (is.record(after)) {
        if (JSON.stringify(after) !== JSON.stringify(before) && keyCollector !== '') {
          changed.push(keyCollector);
        }
        Object.keys(after).forEach(key => recurse(is.record(before) ? before[key] : {}, after[key], `${keyCollector}.${key}`));
      } else if (is.array(after)) {
        if (JSON.stringify(after) !== JSON.stringify(before)) {
          changed.push(keyCollector);
        }
        after.forEach((_, i) => recurse(is.array(before) ? before[i] : [], after[i], `${keyCollector}.${i}`));
      } else if (before !== after) {
        changed.push(keyCollector);
      }
    }
    recurse(stateBefore, stateAfter, '');
  }
  updateChanged(stateBefore, stateAfter);
  return changed;
}

const onClickNodeKey = (state: State, incoming: Message, actionType: string, stateAfter: unknown, changed: string[], unchanged: string[]) => (key: string) => {
  state.set(s => ({
    items: s.items.map(itemOuter => {
      if (itemOuter.id !== s.idRefOuter.current) { return itemOuter; }
      return {
        ...itemOuter,
        items: itemOuter.items.map(itemInner => {
          if (itemInner.id !== s.idRefInner.current) { return itemInner; }
          const contractedKeys = itemInner.contractedKeys.includes(key) ? itemInner.contractedKeys.filter(k => k !== key) : [...itemInner.contractedKeys, key];
          const commonProps = {
            actionType,
            state: stateAfter,
            contractedKeys,
            onClickNodeKey: onClickNodeKey(state, incoming, actionType, stateAfter, changed, unchanged),
            unchanged,
            changed,
          };
          return {
            ...itemInner,
            contractedKeys,
            jsx: Tree({ ...commonProps, hideUnchanged: false }),
            jsxPruned: Tree({ ...commonProps, hideUnchanged: true }),
          } satisfies Item
        })
      }
    })
  }));
}

const deconstructIncoming = (state: State, incoming: Message) => {
  const fullStateBefore = state.items.flatMap(s => s.items).at(-1)?.state ?? {};
  const payload = incoming.action.payloadOrig !== undefined ? incoming.action.payloadOrig : incoming.action.payload;
  const stateBefore = doReadState(fullStateBefore, incoming, payload);
  const stateAfter = doReadState(state.storeRef.current!.$state, incoming, payload);
  const segments = incoming.action.type.split('.');
  const func = segments.pop()!.slice(0, -2);
  const actionType = [...segments, func].join('.');
  return { fullStateBefore, stateBefore, stateAfter, payload, func, actionType };
}

const getTimeDiff = (from: Date, to: Date) => {
  const milliseconds = differenceInMilliseconds(from, to);
  if (milliseconds < 10 * 1000) return `${milliseconds} ms`;
  if (milliseconds < 60 * 1000) return `${differenceInSeconds(from, to)} s`;
  if (milliseconds < 60 * 60 * 1000) return `${differenceInMinutes(from, to)} m`;
  if (milliseconds < 24 * 60 * 60 * 1000) return `${differenceInHours(from, to)} h`;
  return to.toLocaleDateString();
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
