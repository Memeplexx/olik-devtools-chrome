import { RecursiveRecord, Store } from "olik";
import { MutableRefObject } from "react";

export interface TreeProps {
  state: RecursiveRecord | null,
  query: string,
  selectedState: RecursiveRecord | null,
  className?: string,
  storeRef: MutableRefObject<Store<RecursiveRecord> | null>,
}
