import { MouseEvent, useRef } from "react";
import { FaCopy } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { PopupOptions, PopupOption } from "./styles";
import { TreeProps } from "./constants";
import { fixKey, silentlyApplyStateAction } from "../shared/functions";


export const Options = ({ state, keyConcat, store }: {state: unknown, keyConcat: string, store: TreeProps['store']}) => {
  
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
        </>
      }
    />
  );
}