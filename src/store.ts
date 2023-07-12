import { createStore } from "olik";

export const appStore = createStore({
  state: {
    num: 0,
    obj: {
      one: {
        two: 'hello'
      }
    },
    arr: [
      { id: 1, text: 'one' },
      { id: 2, text: 'two' },
      { id: 3, text: 'three' },
    ],
    arrNum: [1, 2, 3],
  }
})