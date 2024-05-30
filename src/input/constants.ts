import { HTMLAttributes } from "react";
import { PopupListProps } from "../popup-list/consts";
import { useDerivedState, useInputs, useLocalState } from "./inputs";


export const types = ['string', 'number', 'boolean', 'date', 'null', ''] as const;

export type ValueType = typeof types[keyof typeof types];

export type InputValue = string | number | boolean | Date | null;

export type TextInputElement = HTMLInputElement | HTMLTextAreaElement;

export type Props<V extends InputValue>
  = {
    value: V,
    onChange: (value: V) => void,
    onChangeCommit: (value: V) => void,
    valueType: ValueType,
    onChangeValueType?: (type: ValueType) => void,
    allowQuotesToBeShown?: boolean,
    allowTypeSelectorPopup?: boolean,
    allowTextArea?: boolean,
    additionalOptions?: PopupListProps['children'],
    readOnly?: boolean,
    onChangeInputElement?: (isTextArea: boolean) => void,
    isChanged: boolean,
    onHidePopup: () => void,
  }
  & Omit<HTMLAttributes<TextInputElement>, 'onChange' | 'value'>;

export type State = ReturnType<typeof useLocalState>;

export type Derived = ReturnType<typeof useDerivedState>;

export type Inputs = ReturnType<typeof useInputs>;
