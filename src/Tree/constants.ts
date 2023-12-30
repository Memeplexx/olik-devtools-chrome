import { Store } from "olik";
import { MutableRefObject } from "react";

export interface TreeProps {
  state: Record<string, unknown> | null,
  selected: string,
  className?: string,
  storeRef: MutableRefObject<Store<Record<string, unknown>> | null>,
}
