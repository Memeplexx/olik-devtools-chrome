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

export const initialState = {
  error: !chrome.runtime ? '' : 'Waiting for store. Try refreshing the page.',
  selectedId: null as number | null,
  items: new Array<Item>(),
  hideUnchanged: false,
  displayInline: false,
  hideHeaders: false,
  query: '',
  showOptions: false,
}

export type State = ReturnType<typeof useLocalState>;

export type Inputs = ReturnType<typeof useInputs>;

export type Outputs = ReturnType<typeof useOutputs>;

export type FragmentProps = { inputs: Inputs, outputs: Outputs };

