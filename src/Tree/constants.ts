import { InputHTMLAttributes, RefObject } from "react";
import { BasicStore } from "../shared/types";
import { useOutputs } from "./outputs";

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
    recurse: (val: unknown, outerKey: string) => JSX.Element,
    keyConcat: string,
    index: number,
    item: unknown,
    isLast: boolean,
    isTopLevel: boolean,
    key?: string,
    outputs: ReturnType<typeof useOutputs>,
  }

export type DatePickerProps = {
  value: Date,
  onChange: (date: Date) => void,
};

export type Type = 'number' | 'text';

export type CompactInputProps = {
  value: string,
  onChange?: (arg: string) => void,
  type?: Type,
  ref?: RefObject<HTMLInputElement>,
  minWidth?: number,
  revertOnBlur?: boolean,
} & InputHTMLAttributes<HTMLInputElement>

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
