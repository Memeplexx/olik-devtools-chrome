import { OlikAction, RecursiveRecord } from "olik"

export type Message = {
  source: string,
  actions: Array<OlikAction>,
  state: RecursiveRecord,
  stack: string,
}

export type Item = {
  type: string,
  typeFormatted: string,
  payload: unknown,
  id: number,
  state: RecursiveRecord,
  last: boolean,
  ineffective: boolean,
  location?: string,
}

export const itemId = {
  val: 1
};
