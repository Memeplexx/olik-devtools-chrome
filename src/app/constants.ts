import { OlikAction, RecursiveRecord } from "olik"

export type Message = {
  source: string,
  action: {
    state: RecursiveRecord,
    last: boolean,
    selectedState: RecursiveRecord,
  } & OlikAction
}

export type Item = {
  type: string,
  typeFormatted: string,
  id: number,
  state: RecursiveRecord,
  last: boolean,
  ineffective: boolean,
}

export const itemId = {
  val: 0
};
