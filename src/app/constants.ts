import { OlikAction, StateAction } from "olik"
import { useLocalState } from "./inputs";

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

export type State = ReturnType<typeof useLocalState>;
