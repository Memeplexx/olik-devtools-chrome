import { InputHTMLAttributes, RefObject } from "react";

export type CompactInputProps = {
  ref?: RefObject<HTMLInputElement>,
  onComplete: (value: string) => void,
  showQuotes?: boolean,
} & InputHTMLAttributes<HTMLInputElement>;
