import { InputHTMLAttributes, RefObject } from "react";

export type CompactInputProps = {
  ref?: RefObject<HTMLInputElement>,
  onUpdate: (value: string) => void,
  showQuotes?: boolean,
} & InputHTMLAttributes<HTMLInputElement>;
