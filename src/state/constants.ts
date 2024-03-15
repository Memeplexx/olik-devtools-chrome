import { Store } from "olik";

export interface StateProps {
  state: Record<string, unknown>,
  className?: string,
  query: string,
  store: Store<Record<string, unknown>>,
}

