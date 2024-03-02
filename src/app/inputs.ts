import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Item, LocalState, Message, initialState, itemId } from "./constants";
import { OlikAction, StateAction, Store, createStore, getStore, libState, readState, setNewStateAndNotifyListeners } from "olik";
import { getTreeHTML } from "../shared/functions";

export const useInputs = () => {

  const [state, setState] = useState<typeof initialState>({
    ...initialState,
    storeRef: useRef(null),
    treeRef: useRef(null),
  });

  instantiateStore({ state, setState });

  instantiateState({ state, setState });

  useMessageHandler({ state, setState });

  const itemsForView = useMemo(() => {
    return !state.hideIneffectiveActions ? state.items : state.items.map(ii => ({ ...ii, items: ii.items.filter(i => !i.ineffective) }));
  }, [state.items, state.hideIneffectiveActions]);

  return {
    ...state,
    setState,
    itemsForView,
  };
}

const instantiateState = (props: LocalState) => {
  if (props.state.storeState) { return; }
  const initializeLocalState = (state: Record<string, unknown>) => props.setState(s => ({
    ...s,
    storeFullyInitialized: true,
    storeStateInitial: state,
    storeState: state,
    items: [{
      id: itemId.val++,
      event: ['🥚 createStore'],
      items: [{
        type: 'init',
        typeFormatted: 'init',
        id: itemId.val++,
        state,
        last: true,
        payload: null,
        ineffective: false,
      }],
    }],
  }))
  const readInitialState = (): Record<string, unknown> => {
    const el = document.getElementById('olik-state');
    if (!el) {
      props.setState(s => ({ ...s, error: 'Olik store not found' }));
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

const instantiateStore = (props: LocalState) => {
  if (props.state.storeRef!.current) { return; }
  if (!chrome.runtime) {
    props.state.storeRef!.current = getStore() as Store<Record<string, unknown>>; // get store from demo app
  } else {
    props.state.storeRef!.current = createStore<Record<string, unknown>>(props.state);
  }
}

const useMessageHandler = (props: LocalState) => {
  const { setState } = props;
  const processEvent = useCallback((incoming: Message) => setState(s => {
    const stateBefore = s.items[s.items.length - 1].items[s.items[s.items.length - 1].items.length - 1].state;
    if (chrome.runtime) {
      libState.disableDevtoolsDispatch = true;
      setNewStateAndNotifyListeners({ stateActions: incoming.stateActions });
      libState.disableDevtoolsDispatch = false;
    }
    const stateAfter = s.storeRef!.current!.$state;
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
      id: itemId.val++,
      state: stateAfter,
      last: true,
      payload: incoming.action.payload,
      ineffective: !incoming.action.type.includes('<span class="touched">'),
    } satisfies Item;
    return {
      ...s,
      storeState: stateAfter,
      items: currentEvent.toString() === previousEvent.toString()
        ? [...s.items.slice(0, s.items.length - 1), { ...s.items[s.items.length - 1], items: [...s.items[s.items.length - 1].items, newItem] }]
        : [...s.items, { id: itemId.val++, event: currentEvent, items: [newItem] }],
      selected: getTreeHTML({
        before: stateBefore,
        after: stateAfter,
        depth: 1
      }),
    };
  }), [setState]);

  useEffect(() => {
    if (!props.state.storeFullyInitialized) { return; }
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
  }, [processEvent, props.state.storeFullyInitialized])
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

const getCleanStackTrace = (stack: string) => {
  return stack
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
}