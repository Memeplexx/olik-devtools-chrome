import { MouseEvent } from "react";
import { fixKey, is, silentlyApplyStateAction } from "../shared/functions";
import { RenderNodeArgs } from "./constants";
import { useInputs } from "./inputs";

export const useOutputs = (props: RenderNodeArgs, inputs: ReturnType<typeof useInputs>) => {
  return {
    onClickCopy: () => {
      navigator.clipboard.writeText(JSON.stringify(props.item, null, 2)).catch(console.error);
      inputs.setState(s => ({ ...s, showOptions: false }));
    },
    onClickDelete: () => {
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$delete()`]);
      inputs.setState(s => ({ ...s, showOptions: false }));
    },
    onClickAddToArray: () => {
      if (!is.array(props.item)) { throw new Error(); }
      const el = JSON.stringify(getSimplifiedObjectPayload(props.item[0]));
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$push(${el})`]);
      inputs.setState(s => ({ ...s, showOptions: false }));
    },
    onClickAddToObject: () => {
      inputs.setState(s => ({ ...s, addingNewObject: true, showOptions: false }));
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$setNew(${JSON.stringify({ '<key>': '<value>' })})`]);
      // setTimeout(() => setTimeout(() => inputs.childNodeRef.current!.focusChildKey()));
    },
    onClickEditKey: () => {
      inputs.setState(s => ({ ...s, editObjectKey: true, showOptions: false }));
      inputs.keyNodeRef.current!.focus();
      inputs.keyNodeRef.current!.select();
    },
    handleNodeClick: (key: string) => (event: MouseEvent) => {
      event.stopPropagation();
      props.onClickNodeKey(key);
      inputs.setState(s => ({ ...s, showOptions: false }))
    },
    handleValueClick: () => {
      inputs.setState(s => ({ ...s, showArrayOptions: false }))
    },
    onMouseOverRootNode: () => {
      inputs.setState(s => ({ ...s, showOptions: true }));
    },
    onMouseOutRootNode: () => {
      inputs.setState(s => ({ ...s, showOptions: false }));
    },
    onMouseOverValueNode: () => {
      if (!props.isArrayElement) { return; }
      inputs.setState(s => ({ ...s, showArrayOptions: true }));
    },
    onMouseOutValueNode: () => {
      if (!props.isArrayElement) { return; }
      inputs.setState(s => ({ ...s, showArrayOptions: false }));
    },
    onHideOptions: () => {
      inputs.setState(s => ({ ...s, showOptions: false }));
    },
    onKeyChange: (keyDraft: string) => {
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$setKey(${keyDraft})`]);
      // setTimeout(() => setTimeout(() => props.focusValueNode()));

      inputs.valNodeRef.current!.focus();
      inputs.valNodeRef.current!.select();
    },
    onFocusValueNode: () => {
      // inputs.childNodeRef.current?.focusChildValue();
    },
    onClickDeleteArrayElement: () => {
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$delete()`]);
    }
  };
}

const getSimplifiedObjectPayload = (state: unknown) => {
  const recurse = (val: unknown): unknown => {
    if (is.record(val)) {
      const r = {} as Record<string, unknown>;
      Object.keys(val).forEach(key => r[key] = recurse(val[key]));
      return r;
    } else if (is.array(val)) {
      return val.map(recurse);
    } else if (is.number(val)) {
      return 0;
    } else if (is.boolean(val)) {
      return false;
    } else if (is.date(val)) {
      return new Date();
    } else if (is.string(val)) {
      return '';
    } else if (is.null(val)) {
      return null;
    } else {
      throw new Error('unhandled type');
    }
  }
  return recurse(state);
}
