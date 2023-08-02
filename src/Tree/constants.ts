import { RecursiveRecord, Store } from "olik";
import { MutableRefObject } from "react";

export interface TreeProps {
  state: RecursiveRecord | null,
  query: string,
  selected: string,
  className?: string,
  storeRef: MutableRefObject<Store<RecursiveRecord> | null>,
}
