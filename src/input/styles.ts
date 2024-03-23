import styled, { css } from "styled-components";
import { possible } from "../html";
import { ValueType } from "./constants";

export const Input = styled(possible.input)<{ $initialized: boolean, $valueType: ValueType, $animate: boolean }>`
  :focus {
    outline: 1px solid #add8e6;
  }
  :hover {
    background-color: rgba(255,255,255,0.1);
  }
  text-align: center;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ${p => p.$animate ? css`transition: 0.4s opacity` : ''};
  ${p => p.$initialized ? 'opacity: 1' : 'opacity: 0'};
  ${p => p.readOnly && `pointer-events: none;`}
  ${p => p.readOnly ? 'cursor: not-allowed' : p.$valueType === 'boolean' || p.$valueType === 'date' ? 'cursor: pointer' : 'cursor: text'};
`;

export const TextArea = styled(possible.textarea)<{ $initialized: boolean, $valueType: ValueType, $animate: boolean, $height: number }>`
  width: calc(100% - 8px);
  padding-left: 2px;
  :focus {
    outline: 1px solid #add8e6;
  }
  :hover {
    background-color: rgba(255,255,255,0.1);
  }
  ${p => p.$animate ? css`transition: 0.4s opacity` : ''};
  ${p => p.$initialized ? 'opacity: 1' : 'opacity: 0'};
  ${p => p.readOnly && `pointer-events: none;`}
  ${p => p.readOnly ? 'cursor: not-allowed' : 'cursor: text'};
  ${p => p.$height ? css`height: ${p.$height}px` : ''};
`;

export const Quote = styled(possible.span)<{ $type: 'start' | 'end' }>`
  margin-right: ${p => p.$type === 'start' ? '-2px' : '0'};
  margin-left: ${p => p.$type === 'end' ? '-2px' : '0'};
`;

export const Wrapper = styled(possible.span)<{ $isTextArea: boolean }>`
  position: relative;
  ${p => p.$isTextArea ? css`display: flex;` : ''};
`;