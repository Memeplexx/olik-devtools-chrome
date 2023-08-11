import React, { MutableRefObject } from "react";
import { Item, Message, itemId } from "./constants";
import { OlikAction, RecursiveRecord, Store, createStore, getStore } from "olik";
import { doReadState } from "./functions";
import { getTreeHTML, useRecord } from "../shared/functions";

export const useHooks = () => {
	const hooks = useHooksInitializer();
	useActionsReceiver(hooks);
	useResetOnPageReload(hooks);
	return hooks;
}

const useHooksInitializer = () => {
	const storeRef = React.useRef<Store<RecursiveRecord> | null>(null);
	const treeRef = React.useRef<HTMLPreElement | null>(null);
	const state = useRecord({
		incomingNum: 0,
		storeStateInitial: null as RecursiveRecord | null,
		storeState: null as RecursiveRecord | null,
		selectedId: null as number | null,
		selected: '',
		items: new Array<Item>(),
		hideIneffectiveActions: false,
	});
	initializeStore({ state: state.storeState, storeRef });
	const itemsForView = React.useMemo(() => {
		return !state.hideIneffectiveActions ? state.items : state.items.filter(i => !i.ineffective);
	}, [state.items, state.hideIneffectiveActions]);
	return {
		storeRef,
		treeRef,
		itemsForView,
		...state,
	};
}

const useActionsReceiver = (hooks: ReturnType<typeof useHooksInitializer>) => {
	const getInitialState = () => {
		const el = document.getElementById('olik-state');
		if (!el) { return {}; }
		return JSON.parse(el.innerHTML) as RecursiveRecord;
	}
	const setRef = React.useRef(hooks.set);
	setRef.current = hooks.set;
	const treeRefRef = React.useRef(hooks.treeRef.current);
	treeRefRef.current = hooks.treeRef.current;
	const storeStateInitial = React.useRef(hooks.storeStateInitial);
	React.useEffect(() => {
		const set = setRef.current;
		const treeRef = treeRefRef.current;
		const processEvent = (incoming: Message) => {
			console.log({incoming})
			set(s => ({
				storeState: incoming.state,
				items: [
					...s.items,
					...incoming.actions.map((action, i) => {
						const { type, payload } = action;
						const stateBefore = hooks.items.length ? hooks.items[hooks.items.length - 1].state : {};
						const stateAfter = incoming.state;
						const query = action.type;
						const stateBeforeSelected = doReadState(query, stateBefore);
						const stateAfterSelected = doReadState(query, stateAfter);
						const stateBeforeString = JSON.stringify(stateBeforeSelected);
						const stateAfterString = JSON.stringify(stateAfterSelected);
						const stateHasNotChanged = stateBeforeString === stateAfterString;
						const payloadString = getPayloadHTML({ type, payload, stateBefore: stateBeforeSelected, stateHasNotChanged });
						const typeFormatted = getTypeHTML({ type, payloadString, stateHasNotChanged });
						return {
							type,
							typeFormatted,
							id: itemId.val++,
							state: stateAfter,
							last: incoming.actions.length - 1 === i,
							payload,
							ineffective: !typeFormatted.includes('<span class="touched">'),
						};
					}),
				]
			}));

			const stateBefore = hooks.items.length ? hooks.items[hooks.items.length - 1].state : storeStateInitial;
			const stateAfter = incoming.state;
			const selected = getTreeHTML({
				before: stateBefore,
				after: stateAfter,
				depth: 1
			});
			set({ selected });

			setTimeout(() => {
				const firstTouchedElement = treeRef!.querySelector('.touched');
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
		return JSON.stringify(action.payload);
	}
	const payloadStringified = JSON.stringify(action.payload);
	if (typeof (action.payload) === 'object' && !Array.isArray(action.payload)) {
		const stateBefore = action.stateBefore === undefined ? {} : action.stateBefore as Record<string, unknown>;
		const payload = action.payload as Record<string, unknown>;
		const keyValuePairsChanged = new Array<string>();
		const keyValuePairsUnchanged = new Array<string>();
		Object.keys(payload).forEach(key => {
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


