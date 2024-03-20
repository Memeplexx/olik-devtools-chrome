import { deserialize } from "olik";
import { useEffect, useMemo, useRef } from "react";
import { BasicStore } from "./types";

export const usePropsWithoutFunctions = <P extends Record<string, unknown>>(props: P) => {
	return useRef(() => {
		return (Object.keys(props) as Array<keyof P>)
			.filter(key => typeof (props[key]) !== 'function')
			.reduce((prev, curr) => ({ ...prev, [curr]: props[curr] }), {} as {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				[key in keyof P as P[key] extends (...args: any[]) => unknown ? never : key]: P[key]
			});
	}).current;
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

export const isoDateRegexPattern = new RegExp(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);

export const is = {
	recordOrArray: (val: unknown): val is object => {
		return typeof (val) === 'object' && val !== null && !(val instanceof Date);
	},
	number: (val: unknown): val is number => {
		return typeof (val) === 'number';
	},
	boolean: (val: unknown): val is boolean => {
		return typeof (val) === 'boolean';
	},
	string: (val: unknown): val is string => {
		return typeof (val) === 'string';
	},
	primitive: (val: unknown): val is string | number | boolean => {
		return typeof (val) === 'string' || typeof (val) === 'number' || typeof (val) === 'boolean';
	},
	undefined: (val: unknown): val is undefined => {
		return val === undefined;
	},
	null: (val: unknown): val is null => {
		return val === null;
	},
	date: (val: unknown): val is Date => {
		return val instanceof Date;
	},
	record: (val: unknown): val is Record<string, unknown> => {
		return typeof (val) === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date);
	},
	array: <T>(val: unknown): val is Array<T> => {
		return Array.isArray(val);
	},
	function: <R, A extends Array<unknown>>(val: unknown): val is (...a: A) => R => {
		return typeof (val) === 'function';
	},
	nullOrUndefined: (val: unknown): val is null | undefined => {
		return val === null || val === undefined;
	},
	scalar: (val: unknown): val is 'number' | 'string' | 'boolean' | 'date' | 'null' | 'undefined' => {
		return typeof (val) === 'string' || typeof (val) === 'number' || typeof (val) === 'boolean' || val === null || val === undefined || val instanceof Date;
	},
	htmlElement: (val: unknown): val is HTMLElement => {
		return val instanceof HTMLElement;
	},
}

export const dateToISOLikeButLocal = (date: Date) => {
	const offsetMs = date.getTimezoneOffset() * 60 * 1000;
	const msLocal = date.getTime() - offsetMs;
	const dateLocal = new Date(msLocal);
	const iso = dateLocal.toISOString();
	const isoLocal = iso.slice(0, 19);
	return isoLocal;
}

export const silentlyApplyStateAction = (store: BasicStore, query: string[]) => {
	if (!chrome.runtime) {
		query.filter(e => !!e).forEach(key => {
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

export const fixKey = (key: string) => {
	return key.split('.').filter(e => !!e).map(e => !isNaN(e as unknown as number) ? `$at(${e})` : e).join('.');
}

export const decisionMap = function <K, V>(map: readonly (readonly [K, V])[]): V {
	return [
		...new Map(map).entries()
	].find(([k]) => (typeof k === 'function' ? k() : k))![1];
}

export const getStateIdToPathMap = (state: unknown) => {
  const map = new Map<string, string>();
	map.set('', Math.random().toString());
  const recurse = (val: unknown, outerKey: string) => {
    if (is.array(val)) {
      val.forEach((item, index) => {
				map.set(`${outerKey}.${index}`, Math.random().toString());
        recurse(item, `${outerKey}.${index}`);
      });
    } else if (is.record(val)) {
      Object.keys(val).forEach(key => {
				map.set(key === '' ? outerKey : `${outerKey}.${key}`, Math.random().toString());
        recurse(val[key], key === '' ? outerKey : `${outerKey}.${key}`);
      });
    }
  };
  recurse(state, '');
  return map;
}
