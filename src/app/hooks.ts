import React, { MutableRefObject } from "react";
import { Item, Message, itemId } from "./constants";
import { OlikAction, RecursiveRecord, Store, createStore, getStore } from "olik";
import { doReadState, scrollTree, updateSetSelection } from "./functions";
import { useDiffAction, useOnInit, useRecord } from "../shared/functions";

export const useHooks = () => {
	const hooks = useHooksInitializer();
	useOnInit(() => receiveActions(hooks));
	useOnInit(() => resetOnPageReload(hooks));
	useDiffAction(hooks.incomingNum, () => updateListItems(hooks));
	useDiffAction(hooks.incomingNum, () => updateSetSelection(hooks));
	useDiffAction(hooks.incomingNum, () => scrollTree(hooks));
	return hooks;
}

const useHooksInitializer = () => {
	const storeRef = React.useRef<Store<RecursiveRecord> | null>(null);
	const treeRef = React.useRef<HTMLPreElement | null>(null);
	const incomingRef = React.useRef({ actions: Array<OlikAction>(), state: null as RecursiveRecord | null });
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
		incomingRef,
		itemsForView,
		...state,
	};
}

const receiveActions = (hooks: ReturnType<typeof useHooksInitializer>) => {
	const getInitialState = () => {
		const el = document.getElementById('olik-state');
		if (!el) { return {}; }
		return JSON.parse(el.innerHTML) as RecursiveRecord;
	}
	const processEvent = (incoming: Message) => {
		hooks.incomingRef.current.actions.push(...incoming.actions);
		hooks.incomingRef.current.state = incoming.state;
		hooks.set({ incomingNum: hooks.incomingNum + 1 })
		console.log(hooks.incomingNum)
	}
	const messageListener = (e: MessageEvent<Message>) => {
		if (e.origin !== window.location.origin) { return; }
		if (e.data.source !== 'olik-devtools-extension') { return; }
		processEvent(e.data);
	}
	const chromeMessageListener = (event: Message) => processEvent(event);
	if (!chrome.runtime) {
		window.addEventListener('message', messageListener);
		const storeStateInitial = getInitialState();
		hooks.set({ storeState: storeStateInitial, storeStateInitial });
	} else {
		chrome.runtime.onMessage
			.addListener(chromeMessageListener);
		chrome.tabs
			.query({ active: true })
			.then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: getInitialState }))
			.then(r => hooks.set({ storeState: r[0].result, storeStateInitial: r[0].result }))
			.catch(console.error);
	}
	return () => {
		window.removeEventListener('message', messageListener);
		chrome.runtime?.onMessage.removeListener(chromeMessageListener);
	}
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

const resetOnPageReload = (hooks: ReturnType<typeof useHooksInitializer>) => {
	if (!chrome.runtime) { return; }
	const listener: Parameters<typeof chrome.tabs.onUpdated.addListener>[0] = (tabId) => {
		chrome.tabs
			.query({ active: true })
			.then(tabs => {
				if (tabs[0].id === tabId) {
					hooks.set({ items: [], selected: '' });
				}
			}).catch(console.error);
	};
	chrome.tabs.onUpdated.addListener(listener);
	return () => chrome.tabs.onUpdated.removeListener(listener);
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

const updateListItems = (hooks: ReturnType<typeof useHooksInitializer>) => {
	// hooks.set(s => ({
	// 	storeState: hooks.incomingState,
	// 	items: [
	// 		...s.items,
	// 		...hooks.incomingActions.map((action, i) => {
	// 			const { type, payload } = action;
	// 			const stateBefore = hooks.items.length ? hooks.items[hooks.items.length - 1].state : {};
	// 			const stateAfter = hooks.incomingState!;
	// 			const query = action.type;
	// 			const stateBeforeSelected = doReadState(query, stateBefore);
	// 			const stateAfterSelected = doReadState(query, stateAfter);
	// 			const stateBeforeString = JSON.stringify(stateBeforeSelected);
	// 			const stateAfterString = JSON.stringify(stateAfterSelected);
	// 			const stateHasNotChanged = stateBeforeString === stateAfterString;
	// 			const payloadString = getPayloadHTML({ type, payload, stateBefore: stateBeforeSelected, stateHasNotChanged });
	// 			const typeFormatted = getTypeHTML({ type, payloadString, stateHasNotChanged });
	// 			return {
	// 				type,
	// 				typeFormatted,
	// 				id: itemId.val++,
	// 				state: stateAfter,
	// 				last: hooks.incomingActions.length - 1 === i,
	// 				payload,
	// 				ineffective: !typeFormatted.includes('<span class="touched">'),
	// 			};
	// 		})]
	// }));
	// hooks.set(() => ({ incomingActions: [] }));
	const incomingActions = [...hooks.incomingRef.current.actions];
	hooks.set(s => ({
		storeState: hooks.incomingRef.current.state,
		items: [
			...s.items,
			...incomingActions.map((action, i) => {
				const { type, payload } = action;
				const stateBefore = hooks.items.length ? hooks.items[hooks.items.length - 1].state : {};
				const stateAfter = hooks.incomingRef.current.state!;
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
					last: incomingActions.length - 1 === i,
					payload,
					ineffective: !typeFormatted.includes('<span class="touched">'),
				};
			}),
		]
	}));
	hooks.incomingRef.current.actions.length = 0;

	setTimeout(() => {
		document.getElementById('data-panel-id-itemsWrapper')!.scrollTop = 999999;
		hooks.treeRef.current!.scrollTop = 999999;
	})
}


