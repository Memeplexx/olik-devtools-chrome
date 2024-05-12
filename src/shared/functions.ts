import { BasicRecord, deserialize } from "olik";
import { useEffect, useMemo, useRef, useState } from "react";
import { BasicStore, EventMap } from "./types";
import { is } from "./type-check";

export const useKnownPropsOnly = <T extends HTMLElement>(
	element: T,
	props: Record<string, unknown>
) => {
	return useMemo(() => {
		return Object.keys(props)
			.filter(key => key in element)
			.reduce<Record<string, unknown>>((acc, key) => {
				acc[key] = props[key];
				return acc;
			}, {});
	}, [props, element]);
}

export const usePropsWithDefaults = <P extends Record<string, unknown>, I extends P, D extends P>(incomingProps: I, defaultProps: D) => {

	// We need a ref of incomingProps so we can compare previous props to incoming props
	const inRef = useRef<P>(incomingProps);

	// We need a ref of result because we might want to return exactly the same object if props have not changed
	const outRef = useRef<P>({ ...defaultProps, incomingProps });

	// props object has changed so we can return a new object which is a spread of defaultProps and incomingProps
	if (inRef.current !== incomingProps) {
		inRef.current = incomingProps;
		outRef.current = { ...defaultProps, ...incomingProps };
		return outRef.current as I & D;
	}

	// one or more props have changed.
	Object.assign(outRef.current, incomingProps);
	return outRef.current as I & D;
}

export const useForwardedRef = <T>(forwardedRef: React.ForwardedRef<T>) => {
	const basicRef = useRef<T | null>(null);
	const targetRef = useRef<T | null>(null)
	const refs = useMemo(() => [basicRef, forwardedRef], [forwardedRef]);
	useEffect(() => {
		refs.forEach(ref => {
			if (!ref) return
			if (typeof ref === 'function') {
				ref(targetRef.current)
			} else {
				ref.current = targetRef.current
			}
		})
	}, [refs])
	return targetRef
}

export const tupleIncludes = <Element extends string, Array extends readonly [...Element[]]>(element: Element, tuple: Array) => tuple.some(f => element.includes(f));

export const isoDateRegexPattern = new RegExp(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);

export const silentlyApplyStateAction = (store: BasicStore, queryString: string) => {
	const splitString = (str: string) => {
		const segments = new Array<string>();
		let parenOpened = false;
		str.split('').forEach(char => {
			if (char === '.' && !parenOpened) 
				return segments.push('');
			if (char === '(') 
				parenOpened = true;
			if (char === ')')
				parenOpened = false;
			if (!segments.length) 
				segments.push('');
			segments[segments.length - 1] += char;
		});
		return segments;
	}
	const query = splitString(queryString).filter(e => e !== '').map(e => !isNaN(e as unknown as number) ? `$at(${e})` : e);
	if (!chrome.runtime) {
		query.forEach(key => {
			const arg = key.match(/\(([^)]*)\)/)?.[1];
			const containsParenthesis = arg !== null && arg !== undefined;
			if (containsParenthesis) {
				const functionName = key.split('(')[0];
				const typedArg = deserialize(arg);
				const functionToCall = store[functionName] as unknown as ((arg?: unknown) => unknown);
				store = functionToCall(typedArg) as BasicStore;
			} else {
				store = store[key] as unknown as BasicStore;
			}
		})
	} else {
		const updateDiv = (query: string[]) => document.getElementById('olik-action')!.innerHTML = JSON.stringify(query);
		chrome.tabs
			.query({ active: true })
			.then(result => chrome.scripting.executeScript({ target: { tabId: result[0].id! }, func: updateDiv, args: [query] }))
			.catch(console.error);
	}
}

export const useRecord = <R extends BasicRecord>(record: R) => {
	const [, setCount] = useState(0);
	const stateRef = useRef({
		...record,
		set: (arg: Partial<R> | ((r: R) => (Partial<R> | void) )) => {
			const newState = is.function<[R], Partial<R>>(arg) ? arg(stateRef) : arg;
			if (newState === undefined)
				return;
			const unChanged = (Object.keys(newState) as Array<keyof typeof newState>)
				.every(key => is.function(newState[key]) || stateRef[key] === newState[key]);
			if (unChanged)
				return;
			Object.assign(stateRef, newState);
			setCount(c => c + 1);
		}
	}).current;
	return stateRef;
}

export const useEventHandlerForDocument = <Type extends 'click' | 'keyup' | 'keydown'>(
	type: Type,
	handler: (event: EventMap<Type>) => void
) => {
	const listenerName = `onDocument${type.substring(0, 1).toUpperCase()}${type.substring(1)}`;
	Object.defineProperty(handler, 'name', { value: listenerName });
	const ref = useRef(handler)
	ref.current = handler;
	useEffect(() => {
		const listener = ((event: EventMap<Type>) => {
			if (ref.current)
				ref.current(event);
		}) as unknown as EventListener;
		Object.defineProperty(listener, 'name', { value: listenerName });
		document.addEventListener(type, listener);
		return () => document.removeEventListener(type, listener);
	}, [listenerName, type]);
}


export const usePropsForHTMLElement = <T extends HTMLElement>(element: T, props: Record<string, unknown>) => {
	return useMemo(() => {
		return Object.keys(props)
			.filter(k => (k in element) || k.startsWith('data-'))
			.reduce<Record<string, unknown>>((acc, key) => { acc[key] = props[key]; return acc; }, {});
	}, [props, element]);
}

export const useResizeObserver = (
	arg: {
		element: HTMLElement | null,
		onChange: (size: { width: number, height: number }) => void,
	}
) => {
	const callBackRef = useRef(arg.onChange);
	callBackRef.current = arg.onChange;
	useEffect(() => {
		if (!arg.element) return;
		const observer = new ResizeObserver(entries => callBackRef.current({
			width: entries[0].contentRect.width,
			height: entries[0].contentRect.height,
		}));
		observer.observe(arg.element);
		return () => observer?.disconnect();
	}, [arg.element]);
}

export const useAttributeObserver = <T extends HTMLElement>(
	arg: {
		element: T | null,
		attributes: Array<keyof T>,
		onChange: () => void,
	}
) => {
	const callBackRef = useRef(arg.onChange);
	callBackRef.current = arg.onChange;
	const attributeFilterRef = useRef(arg.attributes);
	attributeFilterRef.current = arg.attributes;
	useEffect(() => {
		if (!arg.element) return;
		const observer = new MutationObserver(callBackRef.current);
		observer.observe(arg.element, { attributes: true, attributeFilter: attributeFilterRef.current as string[] });
		return () => observer?.disconnect();
	}, [arg.element]);
}
