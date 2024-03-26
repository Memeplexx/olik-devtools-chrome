import { BasicStore } from "../shared/types";

export interface Props {
  state: Record<string, unknown>,
  className?: string,
  query: string,
  store: BasicStore,
}
