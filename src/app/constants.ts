export type Message = {
  source: string,
  action: {
    type: string,
    state: any
  }
}