import { Store } from "olik";

export interface TreeProps {
  state: unknown,
  stateDef?: unknown,
  onClickNodeKey: (key: string) => void,
  contractedKeys: string[],
  actionType?: string,
  unchanged: string[],
  hideUnchanged?: boolean,
  store?: Store<Record<string, unknown>>,
}

export type RenderNodeArgs
  = TreeProps
  & {
    recurse: (val: unknown, outerKey: string) => JSX.Element,
    keyConcat: string,
    index: number,
    item: unknown,
    isLast: boolean,
    isTopLevel: boolean,
    key?: string,
  }

export type DatePickerProps = {
  value: Date,
  onChange: (date: Date) => void,
};

export type Type = 'number' | 'text';

export type CompactInputProps<V extends number | string> = {
  value: V,
  onChange: (arg: V) => void,
  type: Type,
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
