import { RecursiveRecord } from "olik"

export type Message = {
  source: string,
  action: {
    type: string,
    state: RecursiveRecord,
    selectedState: RecursiveRecord,
  }
}