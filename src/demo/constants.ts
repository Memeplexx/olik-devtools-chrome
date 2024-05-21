export const initialState = {
  modal: null as 'confirmDeleteGroup' | 'confirmDeleteTag' | 'synonymOptions' | 'groupOptions' | null,
  bool: false,
  lll: 0,
  thing: {},
  flatObj: {
    one: 'hello hello hello hello hello hello hello hello',
    two: 'world',
    three: 'another',
  },
  // num: 0,
  obj: {
    one: {
      two: 'hello',
      three: false,
      four: 4
    },
    two: {
      five: 'thing',
      three: [
        [1, 2, 3]
      ]
    }
  },
  arr: [
    { id: 1, text: 'one' },
    { id: 2, text: 'two' },
    { id: 3, text: 'three' },
  ],
  arrNum: [1, 2, 3],
  arrNested: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ],
  dat: new Date(),
  thingy: 'ddd',
};

export type AppState = typeof initialState;