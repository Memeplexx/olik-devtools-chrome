import { differenceInHours, differenceInMilliseconds, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { DevtoolsAction, StateAction, assertIsRecord, createStore, getStore, libState, newRecord, readState, setNewStateAndNotifyListeners } from "olik";
import { useEffect, useMemo, useRef } from "react";
import { is, isoDateRegexPattern, useRecord } from "../shared/functions";
import { BasicStore } from '../shared/types';
import { Item, State } from "./constants";

export const useInputs = () => {
  const localState = useLocalState();
  const derivedState = useDerivedState(localState);
  instantiateStore(localState);
  useMessageHandler(localState);
  useAutoScroller(localState);
  return {
    ...localState,
    ...derivedState,
  };
}

export const useLocalState = () => useRecord({
  error: '',
  selectedId: null as number | null,
  items: new Array<Item>(),
  contractedHeaders: new Array<number>(),
  hideUnchanged: false,
  displayInline: false,
  query: '',
  showOptions: false,
  storeRef: useRef<BasicStore | null>(null),
  treeRef: useRef<HTMLDivElement | null>(null),
  idRef: useRef(0),
});

const useDerivedState = (state: State) => ({
  itemsGrouped: useMemo(() => {
    return state.items
      .filter(i => i.visible)
      .groupBy(i => i.eventString)
      .map(items => ({ id: items[0].id, event: items[0].event, items }));
  }, [state.items]),
  ...useMemo(() => {
    return state.items.find(i => i.id === state.selectedId) ?? state.items.at(-1) ?? { changed: [], fullState: {} } as Partial<Item>;
  }, [state.items, state.selectedId]),
})

const instantiateStore = (state: State) => {
  if (state.storeRef.current)
    return;
  if (!chrome.runtime) {
    setTimeout(() => setTimeout(() => { // wait for store from demo app
      state.storeRef.current = getStore<Record<string, unknown>>(); 
      setTimeout(() => document.getElementById('olik-init')!.innerHTML = 'done');
    }))
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

const useAutoScroller = (state: State) => {
  useMemo(() => {
    const selectors = state.items.find(i => i.id === state.selectedId)?.changed ?? state.items.at(-1)?.changed ?? [];
    const element = selectors.find(e => document.querySelector(`[data-key-input="${e}"]`));
    element && document.querySelector(`[data-key-input="${element}"]`)?.scrollIntoView({ behavior: 'smooth' });
  }, [state.items, state.selectedId])
}

const useMessageHandler = (state: State) => {
  useEffect(() => {
    const msgListener = (event: MessageEvent<DevtoolsAction>) => messageListener(state, event);
    const chromeListener = (event: DevtoolsAction) => chromeMessageListener(state, event);
    window.addEventListener('message', msgListener);
    chrome.runtime?.onMessage.addListener(chromeListener);
    return () => {
      window.removeEventListener('message', msgListener);
      chrome.runtime?.onMessage.removeListener(chromeListener);
    }
  }, [state])
}

const messageListener = (state: State, event: MessageEvent<DevtoolsAction>) => {
  if (event.origin !== window.location.origin) return;
  if (event.data.source !== 'olik-devtools-extension') return;
  if (!event.data.actionType) return; // not sure why this happens
  if (!state.storeRef.current) return;
  processEvent(state, event.data);
}

const chromeMessageListener = (state: State, event: DevtoolsAction) => {
  const recurse = (val: unknown): unknown => {
    if (is.record(val))
      Object.keys(val).forEach(key => val[key] = recurse(val[key]))
    if (is.array(val))
      return val.map(recurse);
    if (is.string(val) && isoDateRegexPattern.test(val))
      return new Date(val);
    return val;
  }
  event.stateActions = event.stateActions.map(sa => ({ ...sa, arg: recurse(sa.arg) }));
  if (event.actionType === '$load()') {
    state.storeRef.current = null;
    return;
  } else {
    libState.disableDevtoolsDispatch = true;
    setNewStateAndNotifyListeners(event);
    libState.disableDevtoolsDispatch = false;
  }
  processEvent(state, event);
}

const readSelectedState = (state: Record<string, unknown>, { stateActions }: DevtoolsAction) => {
  const payload = stateActions.at(-1)!.arg;
  let stateActionsNew = new Array<StateAction>();
  const mergeMatchingIndex = stateActions.findIndex(s => s.name === '$mergeMatching');
  if (mergeMatchingIndex !== -1) {
    const withIndex = stateActions.findIndex(s => s.name === '$with');
    const matcherPath = stateActions.slice(mergeMatchingIndex + 1, withIndex);
    if (is.array<Record<string, unknown>>(payload)) {
      const payloadSelection = payload.map(p => matcherPath.reduce((prev, curr) => prev[curr.name] as Record<string, unknown>, p))
      stateActionsNew = [...stateActions.slice(0, mergeMatchingIndex), { name: '$filter' }, ...matcherPath, { name: '$in', arg: payloadSelection }];
    } else {
      const payloadSelection = matcherPath.reduce((prev, curr) => prev[curr.name] as Record<string, unknown>, payload as Record<string, unknown>);
      stateActionsNew = [...stateActions.slice(0, mergeMatchingIndex), { name: '$find' }, ...matcherPath, { name: '$eq', arg: payloadSelection }];
    }
  } else {
    stateActionsNew = stateActions.slice(0, stateActions.length - 1);
  }
  stateActionsNew.push({ name: '$state' });
  return readState({ state, stateActions: stateActionsNew, cursor: { index: 0 } });
}

const processEvent = (state: State, incoming: DevtoolsAction) => {
  state.set(s => {
    const previousItem = s.items.at(-1);
    const fullStateBefore = previousItem?.fullState ?? {};
    const fullStateAfter = s.storeRef.current!.$state;
    const selectedStateBefore = readSelectedState(fullStateBefore, incoming);
    const selectedStateAfter = readSelectedState(fullStateAfter, incoming);
    const date = new Date();
    const currentEvent = getCleanStackTrace(incoming.trace!);
    return {
      items: [
        ...s.items,
        {
          id: ++s.idRef.current,
          event: currentEvent,
          eventString: currentEvent.join('\n'),
          fullState: fullStateAfter,
          visible: true,
          contractedKeys: [],
          time: getTimeDiff(date, previousItem?.date ?? date),
          date,
          changed: incoming.stateActions.at(-1)!.name === '$delete' ? [] : getChangedKeys({ fullStateBefore, fullStateAfter }),
          unchanged: getUnchangedKeys({ selectedStateBefore, selectedStateAfter, incoming }),
          actionType: incoming.stateActions.map(sa => sa.name).join('.'),
          actionPayload: applyPayloadPaths(incoming),
        }
      ],
    };
  });
};

const getUnchangedKeys = ({ selectedStateBefore, selectedStateAfter, incoming }: { selectedStateBefore: unknown, selectedStateAfter: unknown, incoming: DevtoolsAction }) => {
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

const applyPayloadPaths = (incoming: DevtoolsAction) => {
  const payload = incoming.stateActions.at(-1)!.arg;
  const { payloadPaths } = incoming;
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
  const result = new Array<string>();
  const recurse = (before: unknown, after: unknown, keyCollector: string) => {
    if (is.record(before) && is.record(after))
      Object.keys(before).forEach(key => {
        if (before[key] !== after[key])
          result.push(`${keyCollector}.${key}`);
        recurse(before[key], after[key], `${keyCollector}.${key}`);
      });
    if (is.array(before) && is.array(after))
      before.forEach((_, i) => {
        if (before[i] !== after[i])
          result.push(`${keyCollector}.${i}`);
        recurse(before[i], after[i], `${keyCollector}.${i}`);
      });
    if (before !== after)
      result.push(keyCollector);
  }
  recurse(fullStateBefore, fullStateAfter, '');
  return result;
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
