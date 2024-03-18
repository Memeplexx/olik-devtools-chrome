import { MouseEvent, useRef } from "react";
import { FaCopy } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { PopupOptions, PopupOption } from "./styles";


export const Options = ({ state }: {state: unknown}) => {
  
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
          />
        </>
      }
    />
  );
}