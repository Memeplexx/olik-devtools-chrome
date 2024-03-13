import { PossiblyBrandedPrimitive } from "olik";
import React from "react";

export const usePropsWithoutFunctions = <P extends Record<string, unknown>>(props: P) => {
	return React.useRef(() => {
		return (Object.keys(props) as Array<keyof P>)
			.filter(key => typeof (props[key]) !== 'function')
			.reduce((prev, curr) => ({ ...prev, [curr]: props[curr] }), {} as {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				[key in keyof P as P[key] extends (...args: any[]) => unknown ? never : key]: P[key]
			});
	}).current;
}

export const useForwardedRef = <T>(forwardedRef: React.ForwardedRef<T>) => {
	const basicRef = React.useRef<T | null>(null);
	const targetRef = React.useRef<T | null>(null)
	const refs = React.useMemo(() => [basicRef, forwardedRef], [forwardedRef]);
	React.useEffect(() => {
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

export const is = {
	objectOrArray: (val: unknown): val is object => {
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
	undefined: (val: unknown): val is undefined => {
		return val === undefined;
	},
	null: (val: unknown): val is null => {
		return val === null;
	},
	date: (val: unknown): val is Date => {
		return val instanceof Date;
	},
	nonArrayObject: (val: unknown): val is Record<string, unknown> => {
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
	possibleBrandedPrimitive: (val: unknown): val is 'number' | 'string' | 'boolean' | 'date' | 'null' => {
		return typeof (val) === 'string' || typeof (val) === 'number' || typeof (val) === 'boolean' || val === null || val instanceof Date;
	}
}
