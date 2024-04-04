import { differenceInHours, differenceInMilliseconds, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { StateAction, assertIsRecord, createStore, getStore, libState, newRecord, readState, setNewStateAndNotifyListeners } from "olik";
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
  removed: new Array<string>(),
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
  event.stateActions = event.stateActions.map(sa => ({ ...sa, arg: recurse(sa.arg) }));
  processEvent(state, event);
}

const readSelectedState = (state: Record<string, unknown>, incoming: Message) => {
  const payload = incoming.stateActions.at(-1)!.arg;
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
    const mostRecentItem = state.items.at(-1)?.items.at(-1);
    const fullStateBefore = mostRecentItem?.state ?? {};
    const fullStateAfter = state.storeRef.current!.$state;
    const selectedStateBefore = readSelectedState(fullStateBefore, incoming);
    const selectedStateAfter = readSelectedState(fullStateAfter, incoming);
    const segments = incoming.action.type.split('.');
    const func = segments.pop()!.slice(0, -2);
    const actionType = [...segments, func].join('.');
    const date = new Date();
    const time = getTimeDiff(date, mostRecentItem?.date ?? date)
    const unchanged = getUnchangedKeys({ selectedStateBefore, selectedStateAfter, incoming });
    const changed = getChangedKeys({ fullStateBefore, fullStateAfter });
    const removed = getRemovedKeys({ fullStateBefore, fullStateAfter });
    const jsxProps = {
      state: applyPayloadPaths(incoming),
      unchanged,
      changed,
      removed,
      actionType,
      contractedKeys: [],
      onClickNodeKey: onClickNodeKey({ state, actionType, selectedStateAfter, changed, unchanged, removed }),
    };
    const newItem = {
      id: ++s.idRefInner.current,
      jsx: Tree({ ...jsxProps, hideUnchanged: false }),
      jsxPruned: Tree({ ...jsxProps, hideUnchanged: true }),
      state: fullStateAfter,
      payload: incoming.stateActions.at(-1)!.arg,
      contractedKeys: [],
      time,
      date,
      changed,
      removed,
    } satisfies Item;
    const currentEvent = getCleanStackTrace(incoming.trace);
    document.querySelector(`[data-key-input="${changed[0]}"]`)?.scrollIntoView({ behavior: 'smooth' });
    const lastItem = s.items.at(-1)! ?? { event: [] };
    if (currentEvent.toString() === lastItem.event.toString()) {
      return {
        storeState: fullStateAfter,
        changed,
        removed,
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
      storeState: removed.length ? fullStateBefore : fullStateAfter,
      changed,
      removed,
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

const getUnchangedKeys = ({ selectedStateBefore, selectedStateAfter, incoming }: { selectedStateBefore: unknown, selectedStateAfter: unknown, incoming: Message }) => {
  const func = incoming.stateActions.at(-1)!.name;
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
    updateUnchanged(selectedStateBefore, selectedStateAfter);
  } else if (['$clear'].includes(func) && is.array(selectedStateBefore) && !selectedStateBefore.length) {
    unchanged.push('');
  }
  return unchanged;
}

const applyPayloadPaths = (incoming: Message) => {
  const payload = incoming.stateActions.at(-1)!.arg;
  const { payloadPaths } = incoming.action;
  if (!payloadPaths) return payload;
  assertIsRecord(payloadPaths);
  let payloadCopy = JSON.parse(JSON.stringify(payload)) as unknown;
  Object.keys(payloadPaths).forEach(path => {
    const segments = path.split('.');
    const recurse = (value: unknown, depth: number): unknown => {
      if (is.record(value))
        return Object.keys(value).reduce((prev, curr) => {
          prev[curr] = curr === segments[depth] ? recurse(value[curr], depth + 1) : value[curr];
          return prev;
        }, newRecord());
      if (is.array(value))
        return value.map((e, i) => {
          return i.toString() === segments[depth] ? recurse(value[i], depth + 1) : e;
        });
      return payloadPaths[path] as unknown;
    }
    payloadCopy = recurse(payloadCopy, 0);
  });
  return payloadCopy;
}

const getChangedKeys = ({ fullStateBefore, fullStateAfter }: { fullStateBefore: unknown, fullStateAfter: unknown }) => {
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
  updateChanged(fullStateBefore, fullStateAfter);
  return changed;
}

const getRemovedKeys = ({ fullStateBefore, fullStateAfter }: { fullStateBefore: unknown, fullStateAfter: unknown }) => {
  const removed = new Array<string>();
  const updateDeleted = (stateBefore: unknown, stateAfter: unknown) => {
    const recurse = (before: unknown, after: unknown, keyCollector: string) => {
      if (is.record(before)) {
        Object.keys(before).forEach(key => {
          const afterVal = (after as Record<string, unknown>)?.[key];
          if (afterVal === undefined) {
            removed.push(`${keyCollector}.${key}`);
          }
          recurse(before[key], afterVal, `${keyCollector}.${key}`);
        });
      } else if (is.array(before)) {
        before.forEach((_, i) => {
          const afterVal = (after as Record<string, unknown>)?.[i];
          const key = i.toString();
          if (afterVal === undefined) {
            removed.push(`${keyCollector}.${key}`);
          }
          recurse(before[i], afterVal, `${keyCollector}.${i}`);
        });
      } if (after !== undefined && before === undefined) {
        removed.push(keyCollector);
      }
    }
    recurse(stateBefore, stateAfter, '');
  }
  updateDeleted(fullStateBefore, fullStateAfter);
  return removed;
}

const onClickNodeKey = (args: { state: State, actionType: string, selectedStateAfter: unknown, changed: string[], removed: string[], unchanged: string[] }) => {
  const { state, actionType, selectedStateAfter, changed, unchanged, removed } = args;
  return (key: string) => {
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
              state: selectedStateAfter,
              contractedKeys,
              onClickNodeKey: onClickNodeKey(args),
              unchanged,
              changed,
              removed,
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
  };
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
