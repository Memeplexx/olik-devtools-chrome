import { OlikAction } from "olik"

export type Message = {
  source: string,
  action: OlikAction,
  state: Record<string, unknown>,
  stack: string,
}

export type Item = {
  type: string,
  typeFormatted: string,
  payload: unknown,
  id: number,
  state: Record<string, unknown>,
  last: boolean,
  ineffective: boolean,
  location?: string,
}

export const itemId = {
  val: 1
};
