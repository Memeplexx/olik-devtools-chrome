import { ReactNode } from "react";
import { useLocalState } from "./inputs";

export interface TreeProps {
  state: unknown,
  onChangeState?: (actionType: string) => unknown,
  contractedKeys: string[],
  onClickNodeKey: (key: string) => void,
  actionType?: string,
  unchanged: string[],
  changed: string[],
  hideUnchanged?: boolean,
  displayInline?: boolean,
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
