import { BasicRecord } from "olik";
import { BasicStore } from "../shared/types";
import { useLocalState } from "./inputs";

export interface Props {
  state: BasicRecord,
  changed: string[],
  className?: string,
  query: string,
  store: BasicStore,
}

export type State = ReturnType<typeof useLocalState>;
