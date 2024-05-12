import { BasicRecord, Store } from 'olik';
import { MouseEvent } from 'react';

export type BasicStore = Store<BasicRecord>;

export type Keys =
	| 'Backspace'
	| 'Tab'
	| 'Enter'
	| 'Shift'
	| 'Control'
	| 'Alt'
	| 'CapsLock'
	| 'Escape'
	| 'Space'
	| 'PageUp'
	| 'PageDown'
	| 'End'
	| 'Home'
	| 'ArrowLeft'
	| 'ArrowUp'
	| 'ArrowRight'
	| 'ArrowDown'
	| 'Insert'
	| 'Delete';

export interface TypedKeyboardEvent<T extends HTMLElement> extends React.KeyboardEvent<T> {
	key: Keys,
	target: T,
}
export type EventMap<T> = T extends 'click' ? MouseEvent<HTMLElement> & { target: HTMLElement } : T extends 'keyup' | 'keydown' ? TypedKeyboardEvent<HTMLElement> : never;
