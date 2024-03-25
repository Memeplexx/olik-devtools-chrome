import { OlikAction, StateAction } from "olik"
import { useLocalState } from "./inputs";
import { ReactNode } from "react";

export type Message = {
  source: string,
  action: OlikAction,
  stateActions: StateAction[],
  trace: string,
  payloadTypeObject: Record<string, unknown>,
}

export type ItemWrapper = {
  id: number,
  event: string[],
  items: Item[],
  visible: boolean,
  headerExpanded: boolean,
}

export type Item = {
  jsx: ReactNode,
  jsxPruned: ReactNode,
  payload: unknown,
  id: number,
  state: Record<string, unknown>,
  location?: string,
  contractedKeys: string[],
  time: string,
  date: Date,
}

export type State = ReturnType<typeof useLocalState>;
