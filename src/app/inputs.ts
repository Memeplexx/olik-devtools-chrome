import { differenceInHours, differenceInMilliseconds, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { BasicRecord, DevtoolsAction, StateAction, createStore, isoDateRegexp, libState, readState, setNewStateAndNotifyListeners, tupleIncludes } from "olik";
import { useEffect, useMemo, useRef } from "react";
import { useRecord, useStorageSynchronizer } from "../shared/functions";
import { assertIsUpdateFunction, is } from '../shared/type-check';
import { BasicStore } from '../shared/types';
import { Item, State, initialState } from "./constants";
import ErrorStackParser from 'error-stack-parser';

export const useInputs = () => {
  const localState = useLocalState();
  const derivedState = useDerivedState(localState);
  useMessageHandler(localState);
  useAutoScroller(localState);
  useRefreshOnPageRefresh(localState);
  useStorageSynchronizer(localState, 'hideUnchanged');
  useStorageSynchronizer(localState, 'displayInline');
  return {
    ...localState,
    ...derivedState,
  };
}

export const useLocalState = () => useRecord({
  ...initialState,
  storeRef: useRef<BasicStore | null>(null),
  treeRef: useRef<HTMLDivElement | null>(null),
  idRef: useRef(0),
  whitelist: new Array<string>(),
});

const useDerivedState = (state: State) => ({
  itemsGrouped: useMemo(() => {
    return state.items
      .filter(i => i.visible)
      .filter(i => i.actionType.startsWith(state.query))
      .groupBy(i => i.groupIndex)
      .map(items => ({ id: items[0].id, tag: items[0].tag, items }));
  }, [state.items, state.query]),
  ...useMemo(() => {
    return state.items.find(i => i.id === state.selectedId) ?? state.items.at(-1) ?? { changed: [], fullState: {} } as Partial<Item>;
  }, [state.items, state.selectedId]),
})

const useAutoScroller = (state: State) => {
  useMemo(() => {
    const selectors = state.items.find(i => i.id === state.selectedId)?.changed ?? state.items.at(-1)?.changed ?? [];
    const element = selectors.find(e => document.querySelector(`[data-key-input="${e}"]`));
    element && document.querySelector(`[data-key-input="${element}"]`)?.scrollIntoView();
  }, [state.items, state.selectedId])
}

const useRefreshOnPageRefresh = (state: State) => {
  useEffect(() => {
    if (!chrome.runtime)
      return;
    const eventHandler: Parameters<typeof chrome.webNavigation.onCommitted.addListener>[0] = details => {
      if (details.transitionType === 'reload')
        state.set(initialState);
    };
    chrome.webNavigation.onCommitted.addListener(eventHandler);
    return () => chrome.webNavigation.onCommitted.removeListener(eventHandler);
  })
}

const useMessageHandler = (state: State) => {
  useEffect(() => {
    if (chrome.runtime) {
      const chromeListener = (event: DevtoolsAction) => chromeMessageListener(state, event);
      chrome.runtime.onMessage.addListener(chromeListener);
      return () => chrome.runtime.onMessage.removeListener(chromeListener);
    } else {
      const demoAppListener = (event: MessageEvent<DevtoolsAction>) => demoAppMessageListener(state, event);
      window.addEventListener('message', demoAppListener);
      return () => window.removeEventListener('message', demoAppListener);
    }
  }, [state])
}

const demoAppMessageListener = (state: State, event: MessageEvent<DevtoolsAction>) => {
  if (event.origin !== window.location.origin)
    return;
  if (event.data.source !== 'olik-devtools-extension')
    return;
  if (event.data.actionType === '$load()') {
    state.storeRef.current = libState.store as unknown as BasicStore;
    document.getElementById('olik-init')!.innerHTML = 'done';
    state.set({ error: '', whitelist: event.data.stateActions.map(s => s.name) });
  } else {
    processEvent(state, event.data);
  }
}

const chromeMessageListener = (state: State, event: DevtoolsAction) => {
  if (event.actionType === '$load()') {
    state.storeRef.current = createStore<BasicRecord>({});
    chrome.tabs
      .query({ active: true })
      .then(result => chrome.scripting.executeScript({
        target: { tabId: result[0].id! },
        func: () => document.getElementById('olik-init')!.innerHTML = 'done'
      }))
      .catch(console.error);
    state.set({ error: '', whitelist: event.stateActions.map(s => s.name) });
  } else {
    const convertAnyDateStringsToDates = (val: unknown): unknown => {
      if (is.record<unknown>(val))
        Object.keys(val).forEach(key => val[key] = convertAnyDateStringsToDates(val[key]))
      if (is.array(val))
        return val.map(convertAnyDateStringsToDates);
      if (is.string(val) && isoDateRegexp.test(val))
        return new Date(val);
      return val;
    }
    if (event.actionType !== '$addToWhitelist()') {
      event.stateActions = event.stateActions.map(sa => ({ ...sa, arg: convertAnyDateStringsToDates(sa.arg) }));
      libState.disableDevtoolsDispatch = true;
      setNewStateAndNotifyListeners(event.stateActions);
      libState.disableDevtoolsDispatch = false;
    }
    processEvent(state, event);
  }
}

const readSelectedState = (state: BasicRecord, { stateActions }: DevtoolsAction) => {
  const payload = stateActions.at(-1)!.arg;
  let stateActionsNew = new Array<StateAction>();
  const mergeMatchingIndex = stateActions.findIndex(s => s.name === '$mergeMatching');
  if (mergeMatchingIndex !== -1) {
    const withIndex = stateActions.findIndex(s => s.name === '$with');
    const matcherPath = stateActions.slice(mergeMatchingIndex + 1, withIndex);
    if (is.array<BasicRecord>(payload)) {
      const payloadSelection = payload.map(p => matcherPath.reduce((prev, curr) => prev[curr.name] as BasicRecord, p))
      stateActionsNew = [...stateActions.slice(0, mergeMatchingIndex), { name: '$filter' }, ...matcherPath, { name: '$in', arg: payloadSelection }];
    } else {
      const payloadSelection = matcherPath.reduce((prev, curr) => prev[curr.name] as BasicRecord, payload as BasicRecord);
      stateActionsNew = [...stateActions.slice(0, mergeMatchingIndex), { name: '$find' }, ...matcherPath, { name: '$eq', arg: payloadSelection }];
    }
  } else {
    stateActionsNew = stateActions.slice(0, stateActions.length - 1);
  }
  stateActionsNew.push({ name: '$state' });
  return readState(state, stateActionsNew);
}

const stripPayloadWithWhitelist = (event: DevtoolsAction, whitelist: string[]) => {
  const payload = event.stateActions.at(-1)!.arg;
  const actionTypePath = event.actionType.substring(0, event.actionType.lastIndexOf('.'));
  if (is.primitive(payload) || is.date(payload) || is.null(payload) || is.undefined(payload) || is.array(payload))
    return { show: !whitelist.some(whitelist => actionTypePath.startsWith(whitelist)), payload };
  const recurse = (state: unknown): unknown => {
    if (is.record(state)) {
      return Object.keys(state).reduce((prev, curr) => {
        if (!whitelist.some(whitelist => `${actionTypePath}.${curr}`.startsWith(whitelist))) {
          const result = recurse(state[curr]);
          if (result !== undefined)
            prev[curr] = result;
        }
        return prev;
      }, {} as Record<string, unknown>);
    } else if (!whitelist.some(whitelist => actionTypePath.startsWith(whitelist))) {
      return state;
    }
  }
  const newPayload = recurse(payload);
  return { show: !Object.keys(payload as BasicRecord).length || !!Object.keys(newPayload as BasicRecord).length, payload: newPayload };
}

const processEvent = (state: State, event: DevtoolsAction) => {
  if (event.actionType === '$addToWhitelist()')
    return state.set(s => ({ whitelist: [...new Set([...s.whitelist, ...event.stateActions.map(s => s.name)])] }));
  const error = new Error();
  Object.defineProperty(error, 'stack', { value: event.trace });
  const traceItems = ErrorStackParser.parse(error).filter(e => !e.source?.includes('/node_modules/'));
  console.log(traceItems)

  state.set(s => {
    const date = new Date();
    const previousItem = s.items.at(-1) ?? { fullState: {}, tag: '', groupIndex: 0, date };
    const fullStateBefore = previousItem?.fullState ?? {};
    const fullStateAfter = s.storeRef.current!.$state;
    const selectedStateBefore = readSelectedState(fullStateBefore, event);
    const selectedStateAfter = readSelectedState(fullStateAfter, event);
    const currentEvent = ErrorStackParser.parse(error).filter(e => !e.source?.includes('/node_modules/')).map(e => e.functionName!);
    const { show, payload } = stripPayloadWithWhitelist(event, s.whitelist);
    const actionType = event.actionType.substring(0, event.actionType.length - 2);
    const tag = currentEvent.at(0)!;
    return {
      items: [
        ...s.items,
        {
          id: ++s.idRef.current,
          event: currentEvent,
          tag,
          groupIndex: tag === previousItem.tag ? previousItem.groupIndex : previousItem.groupIndex + 1,
          fullState: fullStateAfter,
          visible: show,
          contractedKeys: [],
          time: getTimeDiff(date, previousItem?.date ?? date),
          date,
          changed: event.stateActions.at(-1)!.name === '$delete' ? [] : getChangedKeys({ fullStateBefore, fullStateAfter }),
          unchanged: getUnchangedKeys({ selectedStateBefore, selectedStateAfter, incoming: event }),
          actionType,
          actionPayload: payload,
          hovered: false,
        }
      ],
    };
  });
};

const getUnchangedKeys = ({ selectedStateBefore, selectedStateAfter, incoming }: { selectedStateBefore: unknown, selectedStateAfter: unknown, incoming: DevtoolsAction }) => {
  const func = incoming.stateActions.at(-1)!.name;
  assertIsUpdateFunction(func);
  const unchanged = new Array<string>();
  const updateUnchanged = (stateBefore: unknown, stateAfter: unknown) => {
    const recurse = (before: unknown, after: unknown, keyCollector: string) => {
      if (is.record(after)) {
        if (JSON.stringify(after) === JSON.stringify(before))
          unchanged.push(keyCollector);
        Object.keys(after).forEach(key => recurse(is.record(before) ? before[key] : {}, after[key], `${keyCollector}.${key}`));
      } else if (is.array(after)) {
        if (JSON.stringify(after) === JSON.stringify(before))
          unchanged.push(keyCollector);
        after.forEach((_, i) => recurse(is.array(before) ? before[i] : [], after[i], `${keyCollector}.${i}`));
      } else if (before === after) {
        unchanged.push(keyCollector);
      }
    }
    recurse(stateBefore, stateAfter, '');
  }
  if (tupleIncludes(func, ['$set', '$setNew', '$patchDeep', '$patch', '$with', '$merge', '$toggle', '$add', '$subtract', '$push']))
    updateUnchanged(selectedStateBefore, selectedStateAfter);
  else if (tupleIncludes(func, ['$clear']) && is.array(selectedStateBefore) && !selectedStateBefore.length)
    unchanged.push('');
  return unchanged;
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
  if (milliseconds < 10 * 1000)
    return `${milliseconds} ms`;
  if (milliseconds < 60 * 1000)
    return `${differenceInSeconds(from, to)} s`;
  if (milliseconds < 60 * 60 * 1000)
    return `${differenceInMinutes(from, to)} m`;
  if (milliseconds < 24 * 60 * 60 * 1000)
    return `${differenceInHours(from, to)} h`;
  return to.toLocaleDateString();
}
