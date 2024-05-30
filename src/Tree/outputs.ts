import { MouseEvent } from "react";
import { InputValue, ValueType } from "../input/constants";
import { clipboardWrite, useEventHandlerForDocument } from "../shared/functions";
import { RenderNodeArgs, State } from "./constants";
import { assertIsArray, assertIsRecord, is } from "../shared/type-check";

export const useOutputs = (props: RenderNodeArgs, state: State) => ({
  onClickCopy: async () => {
    await clipboardWrite(JSON.stringify(props.item, null, 2));
    state.set({ showOptions: false, showArrayOptions: false });
  },
  onClickDelete: () => {
    props.onChangeState!(`${props.keyConcat}.$delete()`);
    state.set({ showOptions: false });
  },
  onClickAddToArray: () => {
    assertIsArray(props.item);
    const el = JSON.stringify(getSimplifiedObjectPayload(props.item[0]));
    props.onChangeState!(`${props.keyConcat}.$push(${el})`);
    tryFocusInput(`[data-key-input="${props.keyConcat}.${props.item.length}"]`);
  },
  onClickAddToObject: () => {
    assertIsRecord(props.item);
    const keys = Object.keys(props.item);
    const recurse = (tryKey: string, count: number): string => !keys.includes(tryKey) ? tryKey : recurse(`<key-${count++}>`, count);
    const key = recurse('<key>', 0);
    props.onChangeState!(`${props.keyConcat}.$setNew(${JSON.stringify({ [key]: '<value>' })})`);
    tryFocusInput(`[data-key-input="${props.keyConcat}.${key}"]`);
  },
  onClickEditKey: () => {
    state.set({ showOptions: false });
    state.keyNodeRef.current!.focus();
  },
  onClickParentNode: (key: string) => (event: MouseEvent) => {
    event.stopPropagation();
    props.onClickNodeKey(key);
    state.set({ showOptions: false })
  },
  onClickValueNode: () => {
    state.set(({ showArrayOptions: false }))
  },
  onMouseOverRootNode: () => {
    if (props.actionType) return;
    state.set({ showOptions: true });
  },
  onMouseOutRootNode: () => {
    state.set({ showOptions: false });
  },
  onMouseOverValueNode: () => {
    if (!props.isArrayElement) return;
    state.set({ showArrayOptions: true });
  },
  onMouseOutValueNode: () => {
    if (!props.isArrayElement) return;
    state.set({ showArrayOptions: false });
  },
  onHideOptions: () => {
    state.set(({ showOptions: false }));
  },
  onChangeKey: (key: InputValue) => {
    state.set({ key: key as string });
  },
  onChangeValue: (value: InputValue) => {
    state.set({ value });
  },
  onChangeCommitValue: (value: InputValue) => {
    const argAsString = (() => {
      if (is.null(value)) return 'null';
      if (is.number(value)) return value;
      if (is.boolean(value)) return value.toString();
      if (is.date(value)) return value.toISOString();
      if (is.string(value)) return `"${value.toString()}"`;
      return value;
    })()
    props.onChangeState!(`${props.query ? props.query + '.' : ''}${props.keyConcat}.$set(${argAsString})`);
  },
  onChangeInputElement: (isShowingTextArea: boolean) => {
    state.set({ isShowingTextArea });
  }, 
  onChangeValueType: (type: ValueType) => {
    state.set({ type });
  },
  onFocusObjectKey: () => {
    state.set({ isEditingObjectKey: true });
  },
  onBlurObjectKey: () => {
    state.set({ isEditingObjectKey: false });
  },
  onChangeCommitObjectKey: (value: InputValue) => {
    state.set({ isEditingObjectKey: false });
    props.onChangeState!(`${props.keyConcat}.$setKey(${value!.toString()})`);
  },
  onClickRemoveFromArray: () => {
    props.onChangeState!(`${props.keyConcat}.$delete()`);
    state.set({ showArrayOptions: false });
  },
  onDocumentKeyup: useEventHandlerForDocument('keyup', event => {
    if (event.key === 'Escape') {
      state.set({ showOptions: false, showArrayOptions: false });
    }
  }),
});

const getSimplifiedObjectPayload = (state: unknown) => {
  const recurse = (val: unknown): unknown => {
    if (is.record(val)) return Object.keys(val).reduce((acc, key) => ({ ...acc, [key]: recurse(val[key]) }), {});
    if (is.array(val)) return val.map(recurse);
    if (is.number(val)) return 0;
    if (is.boolean(val)) return false;
    if (is.date(val)) return new Date();
    if (is.string(val)) return '';
    if (is.null(val)) return null;
    throw new Error('unhandled type');
  }
  return recurse(state);
}

const tryFocusInput = (selector: string) => {
  setTimeout(() => setTimeout(() => setTimeout(() => {
    const el = document.querySelector<HTMLInputElement>(selector);
    el?.focus();
    el?.select();
  })));
}
