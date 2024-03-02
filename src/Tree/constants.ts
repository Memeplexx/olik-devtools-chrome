import { Store } from "olik";
import { MutableRefObject } from "react";

export interface TreeProps {
  state: Record<string, unknown>,
  className?: string,
  query: string,
  storeRef: MutableRefObject<Store<Record<string, unknown>> | null>,
}

