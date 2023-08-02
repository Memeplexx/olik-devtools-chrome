import React, { MutableRefObject } from "react";
import { Item, Message, itemId } from "./constants";
import { OlikAction, RecursiveRecord, Store, createStore, getStore, libState } from "olik";
import { doReadState } from "./functions";
import { getTreeHTML } from "../shared/functions";

export const useHooks = () => {
	const hooks = useHooksInitializer();
	useMessageReceiver(hooks);
	useHistoryClipper(hooks);
	usePageReloadListener(hooks);
	return hooks;
}

const useHooksInitializer = () => {
	const [storeState, setStoreState] = React.useState<RecursiveRecord | null>(null);
	const storeRef = React.useRef<Store<RecursiveRecord> | null>(null);
	initializeStore({ state: storeState, storeRef });
	const [query, setQuery] = React.useState('');
	const [selected, setSelected] = React.useState('');
	const [items, setItems] = React.useState<Item[]>([]);
	const [hideIneffectiveActions, setHideIneffectiveActions] = React.useState(false);
	const [selectedId, setSelectedId] = React.useState<number | null>(null);
	const itemsForView = React.useMemo(() => !hideIneffectiveActions ? items : items.filter(i => !i.ineffective), [items, hideIneffectiveActions]);
	return {
		items,
		setItems,
		storeState,
		query,
		setQuery,
		setStoreState,
		selected,
		setSelected,
		storeRef,
		selectedId,
		setSelectedId,
		hideIneffectiveActions,
		setHideIneffectiveActions,
		itemsForView,
	};
}

const useMessageReceiver = (hooks: ReturnType<typeof useHooksInitializer>) => {
	const setStateRef = React.useRef(hooks.setStoreState);
	const setItemsRef = React.useRef(hooks.setItems);
	const setQueryRef = React.useRef(hooks.setQuery);
	const setSelectedRef = React.useRef(hooks.setSelected);
	React.useEffect(() => {
		const getInitialState = () => {
			const el = document.getElementById('olik-state');
			if (!el) { return {}; }
			return JSON.parse(el.innerHTML) as RecursiveRecord;
		}
		const processEvent = ({ action: { state, type, payload, last } }: Message) => {
			setStateRef.current(state);
			const itemBefore = hooks.items.length ? hooks.items[hooks.items.length - 1] : { type: '', state: libState.initialState };
			const stateBefore = doReadState(type, itemBefore.state);
			const stateAfter = doReadState(type, state);
			const stateBeforeString = JSON.stringify(stateBefore);
			const stateAfterString = JSON.stringify(stateAfter);
			const stateHasNotChanged = stateBeforeString === stateAfterString;
			const payloadString = getPayloadHTML({ type, payload, stateBefore, stateHasNotChanged });
			const typeFormatted = getTypeHTML({ type, payloadString, stateHasNotChanged });
			const item = { type, typeFormatted, id: itemId.val++, state, last, ineffective: !typeFormatted.includes('<span class="touched">') };
			setItemsRef.current(i => [...i, item]);
			setQueryRef.current(type);
			const selected = getTreeHTML({ before: stateBefore, after: stateAfter, depth: 0 });
			setSelectedRef.current(selected);
		}
		const messageListener = (e: MessageEvent<Message>) => {
			if (e.origin !== window.location.origin) { return; }
			if (e.data.source !== 'olik-devtools-extension') { return; }
			processEvent(e.data);
		}
		const chromeMessageListener = (event: Message) => processEvent(event);
		if (!chrome.runtime) {
			window.addEventListener('message', messageListener);
			setStateRef.current(getInitialState());
		} else {
			chrome.runtime.onMessage
				.addListener(chromeMessageListener);
			chrome.tabs
				.query({ active: true })
				.then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: getInitialState }))
				.then(r => setStateRef.current(r[0].result))
				.catch(console.error);
		}
		return () => {
			window.removeEventListener('message', messageListener);
			chrome.runtime?.onMessage.removeListener(chromeMessageListener);
		}
	}, [hooks.items]);
}

const initializeStore = (props: { state: RecursiveRecord | null, storeRef: MutableRefObject<Store<RecursiveRecord> | null> }) => {
	if (!props.state) { return; }
	if (!props.storeRef.current) {
		if (!chrome.runtime) {
			props.storeRef.current = getStore(); // get store from demo app
		} else {
			props.storeRef.current = createStore<RecursiveRecord>({ state: props.state });
		}
	}
	if (chrome.runtime) {
		props.storeRef.current.$set(props.state);
	}
}

const useHistoryClipper = (hooks: ReturnType<typeof useHooksInitializer>) => {
	const setSelectedIdRef = React.useRef(hooks.setSelectedId);
	const setItemsRef = React.useRef(hooks.setItems);
	React.useEffect(() => {
		if (!hooks.storeRef.current) { return; }
		const setSelectedId = setSelectedIdRef.current;
		const setItems = setItemsRef.current;
		const subscription = hooks.storeRef.current.$onChange(() => {
			if (libState.disableDevtoolsDispatch) { return; }
			if (!hooks.selectedId) { return; }
			setSelectedId(null);
			const index = hooks.items.findIndex(e => e.id === hooks.selectedId);
			setItems(items => items.slice(0, index + 1));
		});
		return () => subscription.unsubscribe();
	}, [hooks.items, hooks.selectedId, hooks.storeRef]);
}

const usePageReloadListener = (hooks: ReturnType<typeof useHooksInitializer>) => {
	const setItemsRef = React.useRef(hooks.setItems);
	const setQueryRef = React.useRef(hooks.setQuery);
	const setSelectedRef = React.useRef(hooks.setSelected);
	const setSelectedIdRef = React.useRef(hooks.setSelectedId);
	React.useEffect(() => {
		if (!chrome.runtime) { return; }
		const listener: Parameters<typeof chrome.tabs.onUpdated.addListener>[0] = (tabId) => {
			chrome.tabs
				.query({ active: true })
				.then(tabs => {
					if (tabs[0].id === tabId) {
						setItemsRef.current([]);
						setQueryRef.current('');
						setSelectedRef.current('');
						setSelectedIdRef.current(null);
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
		return JSON.stringify(action.payload);
	}
	const payloadStringified = JSON.stringify(action.payload);
	if (typeof (action.payload) === 'object' && !Array.isArray(action.payload)) {
		const stateBefore = action.stateBefore === undefined ? {} :  action.stateBefore as Record<string, unknown>;
		const payload = action.payload as Record<string, unknown>;
		const keyValuePairsChanged = new Array<string>();
		const keyValuePairsUnchanged = new Array<string>();
		Object.keys(action.payload).forEach(key => {
			if (stateBefore[key] !== payload[key]) {
				keyValuePairsChanged.push(`<span class="touched">${key}: ${JSON.stringify(payload[key])}</span>`);
			} else {
				keyValuePairsUnchanged.push(`<span class="untouched">${key}: ${JSON.stringify(payload[key])}</span>`);
			}
		});
		return `{ ${[...keyValuePairsChanged, ...keyValuePairsUnchanged].join(', ')} }`;
	} else {
		return `<span class="touched">${payloadStringified}</span>`;
	}
}


