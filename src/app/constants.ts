import { RecursiveRecord } from "olik"

export type Message = {
  source: string,
  action: {
    type: string,
    state: RecursiveRecord,
    last: boolean,
    selectedState: RecursiveRecord,
  }
}

export type Item = {
  type: string,
  typeFormatted: string,
  id: number,
  state: RecursiveRecord,
  last: boolean
}

export const itemId = {
  val: 0
};
