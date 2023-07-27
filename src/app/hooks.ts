import React, { MutableRefObject } from "react";
import { Message } from "./constants";
import { RecursiveRecord, Store, createStore, getStore, libState } from "olik";

export const useHooks = () => {
	const hooks = useHooksInitializer();
	useMessageReceiver(hooks);
	useHistoryClipper(hooks);
	usePageReloadListener(hooks);
	return hooks;
}

const useHooksInitializer = () => {
	const [state, setState] = React.useState<RecursiveRecord | null>(null);
	const storeRef = React.useRef<Store<RecursiveRecord> | null>(null);
	initializeStore({ state, storeRef });
	const [query, setQuery] = React.useState('');
	const [selected, setSelected] = React.useState<{ before: unknown | null, after: unknown | null } | null>(null);
	const [items, setItems] = React.useState<{ type: string, typeFormatted: string, id: number, state: RecursiveRecord, last: boolean }[]>([]);
	const [selectedId, setSelectedId] = React.useState<number | null>(null);
	return {
		items,
		setItems,
		state,
		query,
		setQuery,
		setState,
		selected,
		setSelected,
		storeRef,
		selectedId,
		setSelectedId,
	};
}

const useMessageReceiver = (hooks: ReturnType<typeof useHooksInitializer>) => {
	const setStateRef = React.useRef(hooks.setState);
	const setItemsRef = React.useRef(hooks.setItems);
	React.useEffect(() => {
		const setState = setStateRef.current;
		const setItems = setItemsRef.current;
		const getInitialState = () => JSON.parse(document.getElementById('olik-state')!.innerHTML) as RecursiveRecord;
		const processEvent = ({ action: { state, type, last } }: Message) => {
			setState(state);
			const typeFormatted = type.replace(/\$[A-Za-z0-9]+/g, match => `<span class="action">${match}</span>`);
			setItems(items => {
				const newId = items.length ? items[items.length - 1].id + 1 : 0;
				return [...items, { type, typeFormatted, id: newId, state, last }];
			});
		}
		const messageListener = (e: MessageEvent<Message>) => {
			if (e.origin !== window.location.origin) { return; }
			if (e.data.source !== 'olik-devtools-extension') { return; }
			processEvent(e.data);
		}
		if (!chrome.runtime) {
			window.addEventListener('message', messageListener);
			setState(getInitialState());
		} else {
			chrome.runtime.onMessage
				.addListener((event: Message) => processEvent(event));
			chrome.tabs
				.query({ active: true })
				.then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: getInitialState }))
				.then(r => setState(r[0].result))
				.catch(console.error);
		}
		return () => window.removeEventListener('message', messageListener)
	}, []);
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
