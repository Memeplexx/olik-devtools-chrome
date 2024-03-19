import { MouseEvent } from "react";
import { fixKey, silentlyApplyStateAction } from "../shared/functions";
import { RenderNodeArgs } from "./constants";
import { useInputs } from "./inputs";

export const useOutputs = (props: RenderNodeArgs, inputs: ReturnType<typeof useInputs>) => {
  return {
    onClickCopy: (state: unknown) => () => {
      navigator.clipboard.writeText(JSON.stringify(state, null, 2)).catch(console.error);
    },
    onClickDelete: (keyConcat: string) => () => {
      silentlyApplyStateAction(props.store!, [...fixKey(keyConcat).split('.'), `$delete()`]);
    },
    onClickAddToArray: (keyConcat: string) => (val: unknown) => {
      const el = JSON.stringify(val);
      silentlyApplyStateAction(props.store!, [...fixKey(keyConcat).split('.'), `$push(${el})`]);
    },
    onClickAddToObject: (keyConcat: string) => () => {
      inputs.setState(s => ({ ...s, addingNewObject: true }));
      silentlyApplyStateAction(props.store!, [...fixKey(keyConcat).split('.'), `$setNew(${JSON.stringify({ '<key>': '<value>' })})`]);
      setTimeout(() => setTimeout(() => inputs.childNodeRef.current!.focusChildKey()));
    },
    onClickEditKey: () => {
      inputs.setState(s => ({ ...s, editObjectKey: true }));
      inputs.keyNodeRef.current!.focus();
      inputs.keyNodeRef.current!.select();
    },
    handleNodeClick: (key: string) => (event: MouseEvent) => {
      event.stopPropagation();
      props.onClickNodeKey(key);
    },
    onMouseOverRootNode: () => {
      inputs.setState(s => ({ ...s, showOptions: true }));
    },
    onMouseOutRootNode: () => {
      inputs.setState(s => ({ ...s, showOptions: false }));
    },
    onHideOptions: () => {
      inputs.setState(s => ({ ...s, showOptions: false }));
    },
    onKeyChange: (keyDraft: string) => {
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$setKey(${keyDraft})`]);
      setTimeout(() => setTimeout(() => props.focusValueNode() ));
    },
    onFocusValueNode: () => {
      inputs.childNodeRef.current?.focusChildValue();
    }
  };
}
