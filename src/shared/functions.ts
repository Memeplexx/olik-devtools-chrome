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
	possibleBrandedPrimitive: (val: unknown): val is PossiblyBrandedPrimitive => {
		return typeof (val) === 'string' || typeof (val) === 'number' || typeof (val) === 'boolean';
	}
}

export const defaultValue = Symbol('default');

export type DecisionResult<X, H> = X extends (string | number | boolean | symbol | Record<string, unknown>) ? X : H;

/**
 * A construct for expressing conditional logic with the following advantages over conventional approaches:
 * * Unlike 'if' and 'ternary' statements, this is more readable when there are a lot of conditions.
 * * Unlike 'switch' statements, this can use an expression as a condition.
 * * Unlike both 'if' and 'switch' (and much like ternary statements),
 * this returns an individual result and doesn't oblige us to define any local variables.
 *
 * @example
 *
 * cont result = decide([
 *   {
 *     when: () => // some expression returning a boolean,
 *     then: () => // some result,
 *   },
 *   {
 *     when: () => // some expression returning a boolean,
 *     then: () => // some result,
 *   }
 * ])
 */
export const decide = <X>(
  decisions: { when(): boolean | null | undefined; then(): X }[],
): DecisionResult<X, ReturnType<typeof decisions[0]['then']>> =>
  decisions.find(d => d.when())!.then() as DecisionResult<X, ReturnType<typeof decisions[0]['then']>>;

/**
 * A construct for expressing conditional logic with the following advantages over conventional approaches:
 * * Unlike 'if' and 'ternary' statements, this is more readable when there are a lot of conditions.
 * * Unlike both 'if' and 'switch' (and much like ternary statements),
 * this returns an individual result and doesn't oblige us to define any local variables.
 *
 * @example
 *
 * cont result = decideComparing(someValue, [
 *   {
 *     when: () => // something which may or may not equal someValue,
 *     then: () => // some result,
 *   },
 *   {
 *     when: () => // something which may or may not equal someValue,
 *     then: () => // some result,
 *   }
 * ])
 */
export const decideComparing = <C, X, T extends { when(): C | typeof defaultValue; then(): X }>(
  toCompare: C,
  decisions: T[],
): DecisionResult<X, ReturnType<T['then']>> =>
  decisions.find(d => d.when() === toCompare || d.when() === defaultValue)!.then() as DecisionResult<X, ReturnType<T['then']>>;

