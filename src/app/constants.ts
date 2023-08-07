import { OlikAction, RecursiveRecord } from "olik"

export type Message = {
  source: string,
  actions: Array<OlikAction>,
  state: RecursiveRecord,
}

export type Item = {
  type: string,
  typeFormatted: string,
  payload: unknown,
  id: number,
  state: RecursiveRecord,
  last: boolean,
  ineffective: boolean,
}

export const itemId = {
  val: 0
};
