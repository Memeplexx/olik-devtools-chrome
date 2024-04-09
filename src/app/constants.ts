import { useLocalState } from "./inputs";



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
  event: string[],
  eventString: string,
  visible: boolean,
}

export type State = ReturnType<typeof useLocalState>;

