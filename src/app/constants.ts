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