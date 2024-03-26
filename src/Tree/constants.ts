import { ReactNode } from "react";
import { BasicStore } from "../shared/types";
import { useLocalState } from "./inputs";

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
    recurse: (arg: RecurseArgs) => ReactNode,
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
}

export type NodeType =
  | 'array'
  | 'object'
  | 'number'
  | 'string'
  | 'date'
  | 'boolean'
  | 'null'
  ;

export type State = ReturnType<typeof useLocalState>;
