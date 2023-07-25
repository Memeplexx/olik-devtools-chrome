import React from "react";
import { Message } from "./constants";
import { RecursiveRecord } from "olik";

export const useHooks = () => {

	const [state, setState] = React.useState<RecursiveRecord | null>(null);

	const [query, setQuery] = React.useState('');

	const [selectedState, setSelectedState] = React.useState<RecursiveRecord | null>(null);

	const [items, setItems] = React.useState<{ type: string, typeFormatted: string, id: number, state: RecursiveRecord }[]>([]);

	React.useEffect(() => {
		const getInitialState = () => {
			return JSON.parse(document.getElementById('olik-state')!.innerHTML) as RecursiveRecord;
		}
		const processEvent = ({ action: { state, type, selectedState } }: Message) => {
			setState(state);
			const typeFormatted = type
				.replace(/\$[A-Za-z0-9]+/g, match => `<span class="action">${match}</span>`);
			setItems(items => [...items, { type, typeFormatted, id: Math.random(), state: selectedState }]);
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
				.query({
					active: true
				})
				.then(result => chrome.scripting.executeScript({
					target: { tabId: result[0].id! },
					func: getInitialState,
				}))
				.then(r => setState(r[0].result))
				.catch(console.error);
		}
		return () => {
			window.removeEventListener('message', messageListener);
		}
	}, []);

	return {
		items,
		state,
		query,
		setQuery,
		setState,
		selectedState,
		setSelectedState
	}
}
