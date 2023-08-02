import React, { MutableRefObject } from "react";
import { Item, Message, itemId } from "./constants";
import { RecursiveRecord, Store, createStore, getStore, libState } from "olik";
import { doReadState } from "./functions";

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
	const [selected, setSelected] = React.useState<{ before: unknown | null, after: unknown | null } | null>(null);
	const [items, setItems] = React.useState<Item[]>([]);
	const [showHiddenArgs, setShowHiddenArgs] = React.useState(false);
	const [selectedId, setSelectedId] = React.useState<number | null>(null);
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
		showHiddenArgs,
		setShowHiddenArgs,
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
		const processEvent = ({ action: { state, type, last } }: Message) => {
			setStateRef.current(state);
			const itemBefore = hooks.items.length ? hooks.items[hooks.items.length - 1] : { type: '', state: libState.initialState };
			const typeFormatted = type.replace(/\$[A-Za-z0-9]+/g, match => `<span class="action">${match}</span>`);
			const item = { type, typeFormatted, id: itemId.val++, state, last };
			setItemsRef.current(i => [...i, item]);
			setQueryRef.current(type);
			setSelectedRef.current({
				before: doReadState(item.type, itemBefore.state),
				after: doReadState(item.type, item.state),
			});
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
						setSelectedRef.current(null);
						setSelectedIdRef.current(null);
					}
				}).catch(console.error);
		};
		chrome.tabs.onUpdated.addListener(listener);
		return () => chrome.tabs.onUpdated.removeListener(listener);
	}, []);
}
