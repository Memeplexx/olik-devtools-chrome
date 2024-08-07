import { BasicRecord } from "olik";
import { useInputs, useLocalState } from "./inputs";
import { useOutputs } from "./outputs";



export type Item = {
  actionType: string,
  actionPayload: unknown,
  id: number,
  fullState: BasicRecord,
  changed: string[],
  unchanged: string[],
  location?: string,
  contractedKeys: string[],
  time: string,
  date: Date,
  tag: string,
  groupIndex: number,
  visible: boolean,
  hovered: boolean,
}

export const initialState = {
  error: !chrome.runtime ? '' : 'Waiting for store. Try refreshing the page.',
  selectedId: null as number | null,
  items: new Array<Item>(),
  hideUnchanged: false,
  displayInline: false,
  query: '',
  showOptions: false,
}

export type State = ReturnType<typeof useLocalState>;

export type Inputs = ReturnType<typeof useInputs>;

export type Outputs = ReturnType<typeof useOutputs>;

export type FragmentProps = { inputs: Inputs, outputs: Outputs };

