import { MouseEvent } from "react";
import { InputValue, ValueType } from "../input/constants";
import { fixKey, is, silentlyApplyStateAction, useEventHandlerForDocument } from "../shared/functions";
import { RenderNodeArgs } from "./constants";
import { useInputs } from "./inputs";

export const useOutputs = (props: RenderNodeArgs, inputs: ReturnType<typeof useInputs>) => {
  return {
    onClickCopy: () => {
      navigator.clipboard.writeText(JSON.stringify(props.item, null, 2)).catch(console.error);
      inputs.setState({ showOptions: false, showArrayOptions: false });
    },
    onClickDelete: () => {
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$delete()`]);
      inputs.setState({ showOptions: false });
    },
    onClickAddToArray: () => {
      if (!is.array(props.item)) throw new Error();
      const el = JSON.stringify(getSimplifiedObjectPayload(props.item[0]));
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$push(${el})`]);
      tryFocusInput(`[data-key="${props.keyConcat}.${props.item.length}"]`);
    },
    onClickAddToObject: () => {
      const keys = Object.keys(props.item as Record<string, unknown>);
      const recurse = (tryKey: string, count: number): string => !keys.includes(tryKey) ? tryKey : recurse(`<key-${count++}>`, count);
      const key = recurse('<key>', 0);
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$setNew(${JSON.stringify({ [key]: '<value>' })})`]);
      tryFocusInput(`[data-key="${props.keyConcat}.${key}"]`);
    },
    onClickEditKey: () => {
      inputs.setState({ showOptions: false });
      inputs.keyNodeRef.current!.focus();
    },
    onClickParentNode: (key: string) => (event: MouseEvent) => {
      event.stopPropagation();
      props.onClickNodeKey(key);
      inputs.setState({ showOptions: false })
    },
    onClickValueNode: () => {
      inputs.setState(({ showArrayOptions: false }))
    },
    onMouseOverRootNode: () => {
      if (props.actionType) return;
      inputs.setState({ showOptions: true });
    },
    onMouseOutRootNode: () => {
      inputs.setState({ showOptions: false });
    },
    onMouseOverValueNode: () => {
      if (!props.isArrayElement) return;
      inputs.setState({ showArrayOptions: true });
    },
    onMouseOutValueNode: () => {
      if (!props.isArrayElement) return;
      inputs.setState({ showArrayOptions: false });
    },
    onHideOptions: () => {
      inputs.setState(({ showOptions: false }));
    },
    onChangeKey: (key: InputValue) => {
      inputs.setState({ key: key as string });
    },
    onChangeValue: (value: InputValue) => {
      inputs.setState({ value });
    },
    onChangeCommitValue: (value: InputValue) => {
      const argAsString = (v => {
        if (is.null(v)) return 'null';
        if (is.number(v)) return v;
        if (is.boolean(v)) return v.toString();
        if (is.date(v)) return v.toISOString();
        if (is.string(v)) return `"${v.toString()}"`;
        return v;
      })(value)
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$set(${argAsString})`]);
    },
    onChangeInputElement: (isShowingTextArea: boolean) => {
      inputs.setState({ isShowingTextArea });
    },
    onChangeValueType: (type: ValueType) => {
      inputs.setState({ type });
    },
    onFocusObjectKey: () => {
      inputs.setState({ isEditingObjectKey: true });
    },
    onBlurObjectKey: () => {
      inputs.setState({ isEditingObjectKey: false });
    },
    onChangeCommitObjectKey: (value: InputValue) => {
      inputs.setState({ isEditingObjectKey: false });
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$setKey(${value!.toString()})`]);
    },
    onClickDeleteArrayElement: () => {
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$delete()`]);
      inputs.setState({ showArrayOptions: false });
    },
    onDocumentKeyup: useEventHandlerForDocument('keyup', event => {
      if (event.key === 'Escape') {
        inputs.setState({ showOptions: false, showArrayOptions: false });
      }
    }),
  };
}

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
