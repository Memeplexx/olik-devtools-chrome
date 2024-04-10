import { useInputs, useLocalState } from "./inputs";
import { useOutputs } from "./outputs";



export type Item = {
  actionType: string,
  actionPayload: unknown,
  id: number,
  fullState: Record<string, unknown>,
  changed: string[],
  unchanged: string[],
  location?: string,
  contractedKeys: string[],
  time: string,
  date: Date,
  event: string[],
  groupIndex: number,
  visible: boolean,
}

export type State = ReturnType<typeof useLocalState>;

export type Inputs = ReturnType<typeof useInputs>;

export type Outputs = ReturnType<typeof useOutputs>;

