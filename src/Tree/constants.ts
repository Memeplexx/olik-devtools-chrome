import { Store } from "olik";

export interface TreeProps {
  state: unknown,
  onClickNodeKey: (key: string) => void,
  contractedKeys: string[],
  actionType?: string,
  unchanged: string[],
  hideUnchanged?: boolean,
  store?: Store<Record<string, unknown>>,
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
