import { RefObject } from "react";
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
  stateIdToPathMap: Map<string, string>,
}

export type RenderNodeArgs
  = TreeProps
  & {
    recurse: (arg: RecurseArgs) => JSX.Element,
    keyConcat: string,
    index: number,
    item: unknown,
    isLast: boolean,
    isTopLevel: boolean,
    objectKey?: string,
    isArrayElement?: boolean,
  }

export type RecurseArgs = {
  val: unknown,
  outerKey: string,
  childNodeRef: RefObject<RenderedNodeHandle>,
}

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
