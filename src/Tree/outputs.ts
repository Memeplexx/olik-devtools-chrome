import { ChangeEvent, MouseEvent } from "react";
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
      const parentKey = props.keyConcat.split('.').slice(0, -1).join('.');
      [...props.stateIdToPathMap.keys()].filter(k => new RegExp(`^${parentKey}\\.[0-9]+$`).test(k)).forEach(k => props.stateIdToPathMap.set(k, Math.random().toString()));
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$delete()`]);
      inputs.setState(s => ({ ...s, showOptions: false }));
    },
    onClickAddToArray: () => {
      if (!is.array(props.item)) { throw new Error(); }
      const el = JSON.stringify(getSimplifiedObjectPayload(props.item[0]));
      updateObjectPayloadKeys(props);
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$push(${el})`]);
      inputs.setState(s => ({ ...s, showOptions: false }));
      const k = `[data-key="${props.keyConcat}.${props.item.length}"]`;
      setTimeout(() => setTimeout(() => setTimeout(() => document.querySelector<HTMLInputElement>(k)?.focus())));
    },
    onClickAddToObject: () => {
      inputs.setState(s => ({ ...s, addingNewObject: true, showOptions: false }));
      props.stateIdToPathMap.set(`${props.keyConcat}.<key>`, Math.random().toString());
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$setNew(${JSON.stringify({ '<key>': '<value>' })})`]);
      const k = `[data-key="${props.keyConcat}.<key>"]`;
      setTimeout(() => setTimeout(() => setTimeout(() => document.querySelector<HTMLInputElement>(k)!.focus())));
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
    onKeyComplete: (keyDraft: string) => {
      const parentKey = props.keyConcat.split('.').slice(0, -1).join('.');
      props.stateIdToPathMap.set(`${parentKey}.${keyDraft}`, props.stateIdToPathMap.get(props.keyConcat)!);
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$setKey(${keyDraft})`]);
    },
    onKeyChange: (event: ChangeEvent<HTMLInputElement>) => {
      inputs.setState(s => ({ ...s, keyValue: event.target.value }));
    },
    onValueChange: (event: ChangeEvent<HTMLInputElement>) => {
      inputs.setState(s => ({ ...s, valueValue: event.target.value }));
    },
    onFocusObjectKey: () => {
      inputs.setState(s => ({ ...s, editObjectKey: true }));
    },
    onClickDeleteArrayElement: () => {
      const parentKey = props.keyConcat.split('.').slice(0, -1).join('.');
      [...props.stateIdToPathMap.keys()].filter(k => new RegExp(`^${parentKey}\\.[0-9]+$`).test(k)).forEach(k => props.stateIdToPathMap.set(k, Math.random().toString()));
      silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$delete()`]);
    }
  };
}

const updateObjectPayloadKeys = (props: { stateIdToPathMap: Map<string, string>, keyConcat: string, item: unknown }) => {
  if (!is.array(props.item)) { throw new Error(); } // should never happen
  props.stateIdToPathMap.set(`${props.keyConcat}.${props.item.length}`, Math.random().toString());
  const recurse = (a: unknown, outerKey: string) => {
    if (is.array(a)) {
      a.forEach((e, i) => {
        const key = `${outerKey}.${i}`;
        props.stateIdToPathMap.set(key, Math.random().toString());
        recurse(e, key);
      });
    } else if (is.record(a)) {
      Object.keys(a).forEach(k => {
        const key = `${outerKey}.${k}`;
        props.stateIdToPathMap.set(key, Math.random().toString());
        recurse(a[k], key);
      });
    }
  }
  recurse(props.item[0], `${props.keyConcat}.${props.item.length}`);
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
