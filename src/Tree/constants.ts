import { HTMLAttributes, RefObject } from "react";
import { BasicStore } from "../shared/types";

export interface TreeProps {
  state: unknown,
  stateDef?: unknown,
  onClickNodeKey: (key: string) => void,
  contractedKeys: string[],
  actionType?: string,
  unchanged: string[],
  hideUnchanged?: boolean,
  store?: BasicStore,
}

export type RenderNodeArgs
  = TreeProps
  & {
    recurse: (val: unknown, outerKey: string, ref: RefObject<RenderedNodeHandle>, focusValueNode: () => unknown ) => JSX.Element,
    keyConcat: string,
    index: number,
    item: unknown,
    isLast: boolean,
    isTopLevel: boolean,
    objectKey?: string,
    focusValueNode: () => void,
    isArrayElement?: boolean,
  }

export type RecurseArgs<S extends Record<string, unknown> | unknown> = {
  val: S,
  outerKey: string,
  ref: RefObject<RenderedNodeHandle>,
  focusValueNode: () => unknown,
}

export type OptionsProps = {
  onCopy: () => unknown,
  onDelete: () => unknown,
  onAddToArray: (value: unknown) => void,
  onAddToObject: () => unknown,
  onEditKey: () => unknown,
  state: unknown,
  ref?: RefObject<HTMLInputElement>,
} & HTMLAttributes<HTMLSpanElement>;

export type NodeType =
  | 'array'
  | 'object'
  | 'number'
  | 'string'
  | 'date'
  | 'boolean'
  | 'null'
  | 'undefined'
  | 'actionType'
  | 'colon'
  | 'comma'
  | 'parenthesis'
  | 'key';

export interface RenderedNodeHandle {
  focusChildKey: () => unknown;
  focusChildValue: () => unknown;
}
