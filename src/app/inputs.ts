import { OlikAction, StateAction, Store, createStore, getStore, libState, readState, setNewStateAndNotifyListeners } from "olik";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTreeHTML } from "../shared/functions";
import { Item, ItemWrapper, Message } from "./constants";

export const useInputs = () => {

  const localState = useLocalState();

  instantiateState(localState);

  instantiateStore(localState);

  useMessageHandler(localState);

  const itemsForView = useMemo(() => {
    return (!localState.hideIneffectiveActions ? localState.items : localState.items.map(ii => ({ ...ii, items: ii.items.filter(i => !i.ineffective) })))
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
    storeRef: useRef<Store<Record<string, unknown>> | null>(null),
    treeRef: useRef<HTMLDivElement | null>(null),
    idRef: useRef(0),
    selectedId: null as number | null,
    selected: '',
    items: new Array<ItemWrapper>(),
    hideIneffectiveActions: false,
    query: '',
  });
  return { ...state, setState };
}

const instantiateState = (props: ReturnType<typeof useLocalState>) => {
  if (props.storeState) { return; }
  const initializeLocalState = (state: Record<string, unknown>) => props.setState(s => ({
    ...s,
    storeFullyInitialized: true,
    storeStateInitial: state,
    storeState: state,
    items: [{
      id: s.idRef.current++,
      event: ['🥚 createStore'],
      visible: true,
      items: [{
        type: 'init',
        typeFormatted: 'init',
        id: s.idRef.current++,
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

const instantiateStore = (props: ReturnType<typeof useLocalState>) => {
  if (props.storeRef.current || !props.storeState) { return; }
  if (!chrome.runtime) {
    props.storeRef.current = getStore<Record<string, unknown>>(); // get store from demo app
  } else {
    props.storeRef.current = createStore<Record<string, unknown>>(props.storeState);
  }
}

const useMessageHandler = (props: ReturnType<typeof useLocalState>) => {
  const { setState } = props;
  const processEvent = useCallback((incoming: Message) => setState(s => {
    const stateBefore = s.items[s.items.length - 1].items[s.items[s.items.length - 1].items.length - 1].state;
    if (chrome.runtime) {
      libState.disableDevtoolsDispatch = true;
      setNewStateAndNotifyListeners({ stateActions: incoming.stateActions });
      libState.disableDevtoolsDispatch = false;
    }
    const stateAfter = s.storeRef.current!.$state;
    const query = incoming.action.type;
    const stateActions = [...incoming.stateActions.slice(0, incoming.stateActions.length - 1), { name: '$state' }] as StateAction[];
    const stateBeforeSelected = readState({ state: stateBefore, stateActions, cursor: { index: 0 } });
    const stateAfterSelected = readState({ state: stateAfter, stateActions, cursor: { index: 0 } });
    const stateHasNotChanged = stateBeforeSelected === stateAfterSelected;
    const payloadString = getPayloadHTML({ type: incoming.action.type, payload: incoming.action.payloadOrig || incoming.action.payload, stateBefore: stateBeforeSelected, stateHasNotChanged });
    const typeFormatted = getTypeHTML({ type: query, payloadString, stateHasNotChanged });
    const currentEvent = getCleanStackTrace(incoming.trace);
    const previousEvent = !s.items.length ? '' : s.items[s.items.length - 1].event;
    const newItem = {
      type: incoming.action.type,
      typeFormatted,
      id: s.idRef.current++,
      state: stateAfter,
      last: true,
      payload: incoming.action.payload,
      ineffective: stateHasNotChanged,
    } satisfies Item;
    return {
      ...s,
      storeState: stateAfter,
      items: currentEvent.toString() === previousEvent.toString()
        ? [...s.items.slice(0, s.items.length - 1), { ...s.items[s.items.length - 1], items: [...s.items[s.items.length - 1].items, newItem], visible: true }]
        : [...s.items, { id: s.idRef.current++, event: currentEvent, items: [newItem], visible: true }],
      selected: getTreeHTML({
        before: stateBefore,
        after: stateAfter,
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

const getTypeHTML = (action: { type: string, payloadString?: string | null | undefined, stateHasNotChanged: boolean }) => {
  const payload = action.payloadString === null ? 'null' : action.payloadString === undefined ? '' : action.payloadString;
  if (action.stateHasNotChanged) {
    return `<span class="untouched">${action.type.substring(0, action.type.length - 1)}${payload})</span>`;
  }
  const typeFormatted = action.type.replace(/\$[A-Za-z0-9]+/g, match => `<span class="action">${match}</span>`);
  const typeBeforeClosingParenthesis = typeFormatted.substring(0, typeFormatted.length - 1);
  return `${typeBeforeClosingParenthesis}${payload})`;
}

const getPayloadHTML = (action: OlikAction & { stateBefore: unknown, stateHasNotChanged: boolean }) => {
  if (action.payload === undefined) {
    return undefined;
  }
  if (action.payload === null) {
    return null;
  }
  if (action.stateHasNotChanged) {
    return JSON.stringify(action.payload, null, 2);
  }
  const stringify = (payload: unknown) => typeof (payload) === 'object' ? JSON.stringify(payload) : typeof (payload) === 'string' ? `"${payload}"` : payload!.toString();
  const payloadStringified = stringify(action.payload);
  if (typeof (action.payload) === 'object' && !Array.isArray(action.payload)) {
    const stateBefore = action.stateBefore === undefined ? {} : action.stateBefore as Record<string, unknown>;
    const payload = action.payload as Record<string, unknown>;
    const keyValuePairsChanged = new Array<string>();
    const keyValuePairsUnchanged = new Array<string>();
    Object.keys(payload).forEach(key => {
      if (stateBefore[key] !== payload[key]) {
        keyValuePairsChanged.push(`&nbsp;&nbsp;<span class="touched">${key}: ${stringify(payload[key])}</span>`);
      } else {
        keyValuePairsUnchanged.push(`&nbsp;&nbsp;<span class="untouched">${key}: ${stringify(payload[key])}</span>`);
      }
    });
    return `{<br/>${[...keyValuePairsChanged, ...keyValuePairsUnchanged].join(',<br/>')}<br/>}`;
  } else {
    return `<span class="touched">${payloadStringified}</span>`;
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
  .map(s => s.replace('///', ''))
  .reverse();
