import React from "react";
import { Message } from "./constants";

export const useHooks = () => {

	const [state, setState] = React.useState(null);

	const [query, setQuery] = React.useState('');

	const [items, setItems] = React.useState<{ type: string, id: number }[]>([]);

	React.useEffect(() => {
		const getInitialState = () => {
			return JSON.parse(document.getElementById('olik-state')!.innerHTML);
		}
		const processEvent = ({ action: { state, type } }: Message) => {
			setState(state);
			setItems(items => [...items, { type, id: Math.random() }]);
		}
		if (!chrome.runtime) {
			window.addEventListener('message', (e: MessageEvent<Message>) => {
				if (e.origin !== window.location.origin) { return; }
				if (e.data.source !== 'olik-devtools-extension') { return; }
				processEvent(e.data);
			});
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
				.then(r => setState(r[0].result!));
		}
	}, []);

	return {
		items,
		state,
		query,
		setQuery,
	}
}