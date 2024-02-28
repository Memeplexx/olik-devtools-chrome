import React, { MutableRefObject } from "react";
import { ItemWrapper, Message, itemId } from "./constants";
import { OlikAction, Store, createStore, getStore } from "olik";
import { doReadState } from "./functions";
import { getTreeHTML, useRecord } from "../shared/functions";

export const useHooks = () => {
  const hooks = useHooksInitializer();
  useActionsReceiver(hooks);
  useResetOnPageReload(hooks);
  return hooks;
}

const useHooksInitializer = () => {
  const storeRef = React.useRef<Store<Record<string, unknown>> | null>(null);
  const treeRef = React.useRef<HTMLPreElement | null>(null);
  const state = useRecord({
    incomingNum: 0,
    storeStateInitial: null as Record<string, unknown> | null,
    storeState: null as Record<string, unknown> | null,
    selectedId: null as number | null,
    selected: '',
    items: new Array<ItemWrapper>(),
    hideIneffectiveActions: false,
  });
  initializeStore({ state: state.storeState, storeRef });
  const itemsForView = React.useMemo(() => {
    return !state.hideIneffectiveActions ? state.items : state.items.map(ii => ({ ...ii, items: ii.items.filter(i => !i.ineffective) }));
  }, [state.items, state.hideIneffectiveActions]);
  return {
    storeRef,
    treeRef,
    itemsForView,
    ...state,
  };
}

const extractFunctionNamesFromStack = (stack: string) => {
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

const useActionsReceiver = (hooks: ReturnType<typeof useHooksInitializer>) => {
  const getInitialState = () => {
    const el = document.getElementById('olik-state');
    if (!el) { return {}; }
    return JSON.parse(el.innerHTML) as Record<string, unknown>;
  }
  const setRef = React.useRef(hooks.set);
  setRef.current = hooks.set;
  const treeRefRef = React.useRef(hooks.treeRef.current);
  treeRefRef.current = hooks.treeRef.current;
  const storeStateInitial = React.useRef(hooks.storeStateInitial);
  React.useEffect(() => {
    const set = setRef.current;
    const processEvent = (incoming: Message) => {

      const stateBefore = hooks.items.length ? hooks.items[hooks.items.length - 1].items[hooks.items[hooks.items.length - 1].items.length - 1].state : {};
      const stateAfter = incoming.state;
      const query = incoming.action.type;
      const stateBeforeSelected = doReadState(incoming.action.typeOrig ?? incoming.action.type, stateBefore);
      const stateAfterSelected = doReadState(incoming.action.typeOrig ?? incoming.action.type, stateAfter);
      const stateAfterString = JSON.stringify(stateAfterSelected);
      const stateBeforeString = JSON.stringify(stateBeforeSelected);
      const stateHasNotChanged = stateBeforeString === stateAfterString;
      const payloadString = getPayloadHTML({ type: incoming.action.type, payload: incoming.action.payloadOrig || incoming.action.payload, stateBefore: stateBeforeSelected, stateHasNotChanged });
      const typeFormatted = getTypeHTML({ type: query, payloadString, stateHasNotChanged });

      set(s => {
        const currentEvent = extractFunctionNamesFromStack(incoming.trace);
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
          storeState: incoming.state,
          items: currentEvent.toString() === previousEvent.toString()
            ? [...s.items.slice(0, s.items.length - 1), { ...s.items[s.items.length - 1], items: [...s.items[s.items.length - 1].items, newItem] }]
            : [...s.items, { id: itemId.val++, event: currentEvent, items: [newItem] }]
        };
      });

      const selected = getTreeHTML({
        before: hooks.items.length ? hooks.items[hooks.items.length - 1].items[hooks.items[hooks.items.length - 1].items.length - 1].state : storeStateInitial,
        after: stateAfter,
        depth: 1
      });
      set({ selected });

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
      set({ storeState: storeStateInitial, storeStateInitial });
    } else {
      chrome.runtime.onMessage
        .addListener(chromeMessageListener);
      chrome.tabs
        .query({ active: true })
        .then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: getInitialState }))
        .then(r => set({ storeState: r[0].result, storeStateInitial: r[0].result }))
        .catch(console.error);
    }
    return () => {
      window.removeEventListener('message', messageListener);
      chrome.runtime?.onMessage.removeListener(chromeMessageListener);
    }
  }, [hooks.items])
}

const initializeStore = (props: { state: Record<string, unknown> | null, storeRef: MutableRefObject<Store<Record<string, unknown>> | null> }) => {
  if (!props.state) { return; }
  if (!props.storeRef.current) {
    if (!chrome.runtime) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      props.storeRef.current = getStore() as any; // get store from demo app
    } else {
      props.storeRef.current = createStore<Record<string, unknown>>({ state: props.state });
    }
  }
  if (chrome.runtime) {
    props.storeRef.current!.$set(props.state);
  }
}

const useResetOnPageReload = (hooks: ReturnType<typeof useHooksInitializer>) => {
  const setRef = React.useRef(hooks.set);
  React.useEffect(() => {
    const set = setRef.current;
    if (!chrome.runtime) { return; }
    const listener: Parameters<typeof chrome.tabs.onUpdated.addListener>[0] = (tabId) => {
      chrome.tabs
        .query({ active: true })
        .then(tabs => {
          if (tabs[0].id === tabId) {
            set({ items: [], selected: '' });
          }
        }).catch(console.error);
    };
    chrome.tabs.onUpdated.addListener(listener);
    return () => chrome.tabs.onUpdated.removeListener(listener);
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
  const stringify = (payload: unknown) => typeof (payload) === 'object' ? JSON.stringify(payload) : typeof(payload) === 'string' ? `"${payload}"` : payload!.toString();
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


