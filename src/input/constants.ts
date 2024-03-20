import { InputHTMLAttributes, RefObject } from "react";

export type CompactInputProps = {
  ref?: RefObject<HTMLInputElement>,
  onComplete: (value: string) => void,
} & InputHTMLAttributes<HTMLInputElement>;
