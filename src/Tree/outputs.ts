import { ChangeEvent, MouseEvent } from "react";
import { fixKey, is, silentlyApplyStateAction } from "../shared/functions";
import { RenderNodeArgs } from "./constants";
import { useInputs } from "./inputs";

export const useOutputs = (props: RenderNodeArgs, inputs: ReturnType<typeof useInputs>) => {
  return {
    onClickCopy: () => {
      navigator.clipboard.writeText(JSON.stringify(props.item, null, 2)).catch(console.error);
      inputs.setState({ showOptions: false });
    },
    onClickDelete: () => {
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$delete()`]);
      inputs.setState({ showOptions: false });
    },
    onClickAddToArray: () => {
      if (!is.array(props.item)) { throw new Error(); }
      const el = JSON.stringify(getSimplifiedObjectPayload(props.item[0]));
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$push(${el})`]);
      inputs.setState({ showOptions: false });
      const k = `[data-key="${props.keyConcat}.${props.item.length}"]`;
      setTimeout(() => setTimeout(() => setTimeout(() => document.querySelector<HTMLInputElement>(k)?.focus())));
    },
    onClickAddToObject: () => {
      inputs.setState({ showOptions: false });
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$setNew(${JSON.stringify({ '<key>': '<value>' })})`]);
      const k = `[data-key="${props.keyConcat}.<key>"]`;
      setTimeout(() => setTimeout(() => setTimeout(() => document.querySelector<HTMLInputElement>(k)!.focus())));
    },
    onClickEditKey: () => {
      inputs.setState({ showOptions: false });
      inputs.keyNodeRef.current!.focus();
    },
    handleNodeClick: (key: string) => (event: MouseEvent) => {
      event.stopPropagation();
      props.onClickNodeKey(key);
      inputs.setState({ showOptions: false })
    },
    handleValueClick: () => {
      inputs.setState(({ showArrayOptions: false }))
    },
    onMouseOverRootNode: () => {
      if (props.actionType) { return; }
      inputs.setState({ showOptions: true });
    },
    onMouseOutRootNode: () => {
      inputs.setState({ showOptions: false });
    },
    onMouseOverValueNode: () => {
      if (!props.isArrayElement) { return; }
      inputs.setState({ showArrayOptions: true });
    },
    onMouseOutValueNode: () => {
      if (!props.isArrayElement) { return; }
      inputs.setState({ showArrayOptions: false });
    },
    onHideOptions: () => {
      inputs.setState(({ showOptions: false }));
    },
    onKeyUpdate: (keyDraft: string) => {
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$setKey(${keyDraft})`]);
    },
    onKeyChange: (event: ChangeEvent<HTMLInputElement>) => {
      inputs.setState({ keyValue: event.target.value });
    },
    onValueChange: (event: ChangeEvent<HTMLInputElement>) => {
      inputs.setState({ valueValue: event.target.value });
    },
    onFocusObjectKey: () => {
      inputs.setState({ isEditingObjectKey: true });
    },
    onBlurObjectKey: () => {
      inputs.setState({ isEditingObjectKey: false });
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
