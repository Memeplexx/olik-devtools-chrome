import { OlikAction, StateAction, Store, createStore, getStore, libState, readState, setNewStateAndNotifyListeners } from "olik";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { getTreeHTML } from "../shared/functions";
import { Message, initialState, itemId } from "./constants";
import { getCleanStackTrace } from "./functions";

export const useHooks = () => {
  const hooks = useHooksInitializer();
  useActionsReceiver(hooks);
  useResetOnPageReload(hooks);
  return hooks;
}

const useHooksInitializer = () => {
  const storeRef = useRef<Store<Record<string, unknown>> | null>(null);
  const treeRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState(initialState);
  initializeStore({
    state: state.storeState,
    storeRef,
    onInit: () => {
      setState(s => ({
        ...s,
        items: [{
          id: itemId.val++,
          event: ['🥚 createStore'],
          items: [{
            type: 'init',
            typeFormatted: 'init',
            id: itemId.val++,
            state: storeRef.current!.$state,
            last: true,
            payload: null,
            ineffective: false,
          }],
        }],
        storeState: storeRef.current!.$state,
        storeStateInitial: storeRef.current!.$state,
        selected: getTreeHTML({
          before: {},
          after: storeRef.current!.$state,
          depth: 1
        }),
      }));
    }
  });
  const itemsForView = useMemo(() => {
    return !state.hideIneffectiveActions ? state.items : state.items.map(ii => ({ ...ii, items: ii.items.filter(i => !i.ineffective) }));
  }, [state.items, state.hideIneffectiveActions]);
  return {
    storeRef,
    treeRef,
    itemsForView,
    ...state,
    setState,
  };
}



const useActionsReceiver = (hooks: ReturnType<typeof useHooksInitializer>) => {
  const getInitialState = () => {
    const el = document.getElementById('olik-state');
    if (!el) { return {}; }
    return JSON.parse(el.innerHTML) as Record<string, unknown>;
  }
  const setRef = useRef(hooks.setState);
  setRef.current = hooks.setState;
  const treeRefRef = useRef(hooks.treeRef.current);
  treeRefRef.current = hooks.treeRef.current;
  useEffect(() => {
    const set = setRef.current;
    const processEvent = (incoming: Message) => {
      set(s => {
        const stateBefore = s.items.length
          ? s.items[s.items.length - 1].items[s.items[s.items.length - 1].items.length - 1].state
          : getInitialState();
        if (chrome.runtime) {
          libState.disableDevtoolsDispatch = true;
          setNewStateAndNotifyListeners({ stateActions: incoming.stateActions });
          libState.disableDevtoolsDispatch = false;
        }
        const stateAfter = hooks.storeRef.current!.$state;
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
        };
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
      });
      setTimeout(() => {
        const firstTouchedElement = treeRefRef.current!.querySelector('.touched');
        if (firstTouchedElement) {
          firstTouchedElement.scrollIntoView(/*{ behavior: 'smooth' }*/);
        }
      });
    }



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
      const storeStateInitial = getInitialState();
      set(s => ({ ...s, storeState: storeStateInitial, storeStateInitial }));
    } else {
      chrome.runtime.onMessage
        .addListener(chromeMessageListener);
      chrome.tabs
        .query({ active: true })
        .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: getInitialState }))
        .then(r => set(s => ({ ...s, storeState: r[0].result, storeStateInitial: r[0].result })))
        .catch(console.error);
    }
    return () => {
      window.removeEventListener('message', messageListener);
      chrome.runtime?.onMessage.removeListener(chromeMessageListener);
    }
  }, [hooks.storeRef])
}

const initializeStore = (props: {
  state: Record<string, unknown> | null,
  storeRef: MutableRefObject<Store<unknown> | null>,
  onInit: () => void,
}) => {
  if (!props.state) { return; }
  if (!props.storeRef.current) {
    if (!chrome.runtime) {
      props.storeRef.current = getStore(); // get store from demo app
    } else {
      props.storeRef.current = createStore(props.state);
    }
    props.onInit();
  }
}

const useResetOnPageReload = (hooks: ReturnType<typeof useHooksInitializer>) => {
  const setRef = useRef(hooks.setState);
  useEffect(() => {
    console.log('effect');
    const set = setRef.current;
    if (!chrome.runtime) { return; }
    const listener = () => set(s => ({ ...s, items: [], selected: '' }));
    chrome.devtools.network.onNavigated.addListener(listener);
    return () => chrome.devtools.network.onNavigated.removeListener(listener);
  }, []);
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


