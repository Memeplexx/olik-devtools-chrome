
export interface TreeProps {
  state: unknown,
  onClickNodeKey: (key: string) => void,
  contractedKeys: string[],
  actionType?: string,
  unchanged: string[],
  hideUnchanged?: boolean,
}

