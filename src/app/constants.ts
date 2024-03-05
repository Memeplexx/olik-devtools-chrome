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
  jsxFormatted: JSX.Element,
  payload: unknown,
  id: number,
  state: Record<string, unknown>,
  last: boolean,
  ineffective: boolean,
  location?: string,
  contractedKeys: string[],
}
