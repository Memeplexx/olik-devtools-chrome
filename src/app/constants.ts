import { OlikAction, StateAction, Store } from "olik"
import { Dispatch, MutableRefObject, SetStateAction } from "react";

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

export const initialState = {
  error: '',
  storeFullyInitialized: false,
  incomingNum: 0,
  storeStateInitial: null as Record<string, unknown> | null,
  storeState: null as Record<string, unknown> | null,
  storeRef: null as MutableRefObject<Store<Record<string, unknown>> | null> | null,
  treeRef: null as MutableRefObject<HTMLDivElement | null> | null,
  idRef: null as MutableRefObject<number> | null,
  selectedId: null as number | null,
  selected: '',
  items: new Array<ItemWrapper>(),
  hideIneffectiveActions: false,
  query: '',
};

export type LocalState = { state: typeof initialState, setState: Dispatch<SetStateAction<typeof initialState>> };
