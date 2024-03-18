import { fixKey, silentlyApplyStateAction } from "../shared/functions";
import { TreeProps } from "./constants";

export const useOutputs = (props: TreeProps) => {
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
    onClickAddToObject: (keyConcat: string) => (newKey: string, val: unknown) => {
      const el = JSON.stringify({ [newKey]: val });
      silentlyApplyStateAction(props.store!, [...fixKey(keyConcat).split('.'), `$setNew(${el})`]);
    }
  };
}
