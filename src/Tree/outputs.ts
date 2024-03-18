import { MouseEvent } from "react";
import { fixKey, is, silentlyApplyStateAction } from "../shared/functions";
import { TreeProps } from "./constants";

export const useOutputs = (props: TreeProps) => {
  return {
    onClickCopy: (state: unknown) => (e: MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(JSON.stringify(state, null, 2)).catch(console.error);
    },
    onClickDelete: (keyConcat: string) => (e: MouseEvent) => {
      e.stopPropagation();
      silentlyApplyStateAction(props.store!, [...fixKey(keyConcat).split('.'), `$delete()`]);
    },
    onClickAdd: (state: unknown, keyConcat: string) => (e: MouseEvent) => {
      e.stopPropagation();
      if (!is.array(state)) { throw new Error('can only add to arrays'); }
      const recurse = (val: unknown): unknown => {
        if (is.record(val)) {
          const r = {} as Record<string, unknown>;
          Object.keys(val).forEach(key => r[key] = recurse(val[key]));
          return r;
        } else if (is.array(val)) {
          return val.map(recurse);
        } else if (is.number(val)) {
          return 0;
        } else if (is.string(val)) {
          return '';
        } else if (is.boolean(val)) {
          return false;
        } else if (is.date(val)) {
          return new Date();
        } else if (is.null(val)) {
          return null;
        } else {
          throw new Error('unhandled type');
        }
      }
      const simp = recurse(state[0]);
      const el = JSON.stringify(simp);
      silentlyApplyStateAction(props.store!, [...fixKey(keyConcat).split('.'), `$push(${el})`]);
    }
  };
}