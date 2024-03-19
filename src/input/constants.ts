import { InputHTMLAttributes, RefObject } from "react";

export type CompactInputProps = {
  value: string,
  onChange?: (arg: string) => void,
  ref?: RefObject<HTMLInputElement>,
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>;
