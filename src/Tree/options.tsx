import { MouseEvent, useRef } from "react";
import { FaCopy } from 'react-icons/fa';
import { MdAdd, MdDelete } from 'react-icons/md';
import { PopupOptions, PopupOption } from "./styles";
import { TreeProps } from "./constants";
import { fixKey, is, silentlyApplyStateAction } from "../shared/functions";


export const Options = ({ state, keyConcat, store }: { state: unknown, keyConcat: string, store: TreeProps['store'] }) => {

  const ref = useRef<HTMLSpanElement>(null);
  if (!ref.current) {
    setTimeout(() => {
      const el = ref.current!.parentNode as HTMLElement;
      el.style.position = 'relative';
      el.addEventListener('mouseover', () => ref.current!.style.display = 'flex');
      el.addEventListener('mouseout', () => ref.current!.style.display = 'none');
    })
  }
  const onClickCopy = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(state, null, 2)).catch(console.error);
    ref.current!.style.display = 'none';
  }
  const onClickDelete = (e: MouseEvent) => {
    e.stopPropagation();
    silentlyApplyStateAction(store!, [...fixKey(keyConcat).split('.'), `$delete()`]);
    ref.current!.style.display = 'none';
  }
  const onClickAdd = (e: MouseEvent) => {
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
    silentlyApplyStateAction(store!, [...fixKey(keyConcat).split('.'), `$push(${el})`]);
    ref.current!.style.display = 'none';
  }
  return (
    <PopupOptions
      ref={ref}
      children={
        <>
          <PopupOption
            children={
              <>
                <FaCopy />
                copy
              </>
            }
            onClick={onClickCopy}
          />
          <PopupOption
            children={
              <>
                <MdDelete />
                delete
              </>
            }
            onClick={onClickDelete}
          />
          <PopupOption
            showIf={is.array(state)}
            children={
              <>
                <MdAdd />
                add
              </>
            }
            onClick={onClickAdd}
          />
        </>
      }
    />
  );
}