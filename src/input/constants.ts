import { InputHTMLAttributes, RefObject } from "react";
import { PopupListProps } from "../popup-list/consts";


export const types = ['string', 'number', 'boolean', 'date', 'null'] as const;

export type ValueType = typeof types[keyof typeof types];

export type InputValue = string | number | boolean | Date | null;

export type CompactInputProps<V extends InputValue> = {
  ref?: RefObject<HTMLInputElement>,
  value: V,
  type: ValueType,
  onChange: (value: V) => void,
  onUpdate: (value: V) => void,
  onChangeType?: (type: ValueType) => void,
  showQuotes?: boolean,
  allowTypeSelectorPopup: boolean,
  additionalOptions?: PopupListProps['children'],
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'type' | 'onChange'>;
