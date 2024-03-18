import { ReactNode, useRef } from "react";
import { PopupOptions } from "./styles";


export const Options = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLSpanElement>(null);
  if (!ref.current) {
    setTimeout(() => {
      const el = ref.current!.parentNode as HTMLElement;
      el.style.position = 'relative';
      el.addEventListener('mouseover', () => ref.current!.style.display = 'flex');
      el.addEventListener('mouseout', () => ref.current!.style.display = 'none');
    })
  }
  const onClick = () => {
    ref.current!.style.display = 'none';
  }
  return (
    <PopupOptions
      ref={ref}
      onClick={onClick}
      children={children}
    />
  );
}