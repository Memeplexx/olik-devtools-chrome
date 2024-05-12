import { Primitive, ValueOf, updateFunctions, updatePropMap } from "olik";

export const is = {
  date: (arg: unknown): arg is Date => arg instanceof Date,
  number: (arg: unknown): arg is number => typeof (arg) === 'number',
  string: (arg: unknown): arg is string => typeof (arg) === 'string',
  boolean: (arg: unknown): arg is boolean => typeof (arg) === 'boolean',
  primitive: (arg: unknown): arg is Primitive => is.number(arg) || is.string(arg) || is.boolean(arg),
  function: <A extends Array<unknown>, R>(val: unknown): val is (...a: A) => R => typeof (val) === 'function',
  record: <T>(arg: unknown): arg is { [key: string]: T } => typeof arg === 'object' && !is.null(arg) && !is.array(arg) && !is.date(arg),
  array: <T>(arg: unknown): arg is Array<T> => Array.isArray(arg),
  null: (arg: unknown): arg is null => arg === null,
  undefined: (arg: unknown): arg is undefined => arg === undefined,
  anyUpdateFunction: (arg: unknown): arg is ValueOf<typeof updateFunctions> => !!updatePropMap[arg as keyof typeof updatePropMap],
	htmlElement: (val: unknown): val is HTMLElement => val instanceof HTMLElement,
	ref: <T>(val: unknown): val is React.RefObject<T> => is.record(val) && 'current' in val,
  scalar: (val: unknown): val is 'number' | 'string' | 'boolean' | 'date' | 'null' | 'undefined' => is.string(val) || is.number(val) || is.boolean(val) || is.null(val) || is.undefined(val) || is.date(val),
}

export function assertIsArray <T>(arg: unknown): asserts arg is T[] {
  if (!is.array(arg)) throw new Error();
}

export function assertIsRecord <T>(arg: unknown): asserts arg is Record<string, T> {
  if (!is.record(arg)) throw new Error();
}

export function assertIsUpdateFunction (arg: unknown): asserts arg is ValueOf<typeof updateFunctions> {
  if (!is.anyUpdateFunction(arg)) throw new Error();
}
