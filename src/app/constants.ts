import { OlikAction, StateAction } from "olik"

export type Message = {
  source: string,
  action: OlikAction,
  stateActions: StateAction[],
  trace: string,
}

export type ItemWrapper = {
  id: number,
  event: string[],
  items: Item[],
  visible: boolean,
}

export type Item = {
  jsx: JSX.Element,
  jsxPruned: JSX.Element,
  payload: unknown,
  id: number,
  state: Record<string, unknown>,
  location?: string,
  contractedKeys: string[],
  time: string,
  date: Date,
}
