
export interface TreeProps {
  state: unknown,
  onClickNodeKey: (key: string) => void,
  contractedKeys: string[],
  actionType?: string,
  unchanged: string[],
  hideUnchanged?: boolean,
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
