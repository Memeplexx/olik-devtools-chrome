import { useLocalState } from "./inputs";


export type ItemWrapper = {
  id: number,
  event: string[],
  items: Item[],
  visible: boolean,
  headerExpanded: boolean,
}

export type Item = {
  actionType: string,
  actionPayload: unknown,
  id: number,
  fullState: Record<string, unknown>,
  changed: string[],
  unchanged: string[],
  location?: string,
  contractedKeys: string[],
  time: string,
  date: Date,
}

export type State = ReturnType<typeof useLocalState>;

