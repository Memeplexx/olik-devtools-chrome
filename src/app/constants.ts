import { OlikAction, StateAction } from "olik"

export type Message = {
  source: string,
  action: OlikAction,
  // state: Record<string, unknown>,
  stateActions: StateAction[],
  trace: string,
}

export type ItemWrapper = {
  id: number,
  event: string[],
  items: Item[],
}

export type Item = {
  type: string,
  typeFormatted: string,
  payload: unknown,
  id: number,
  state: Record<string, unknown>,
  last: boolean,
  ineffective: boolean,
  location?: string,
}

export const itemId = {
  val: 1
};

export const initialState = {
  incomingNum: 0,
  storeStateInitial: null as Record<string, unknown> | null,
  storeState: null as Record<string, unknown> | null,
  selectedId: null as number | null,
  selected: '',
  items: new Array<ItemWrapper>(),
  hideIneffectiveActions: false,
  query: '',
};
