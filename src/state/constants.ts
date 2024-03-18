import { BasicStore } from "../shared/types";

export interface StateProps {
  state: Record<string, unknown>,
  className?: string,
  query: string,
  store: BasicStore,
}
