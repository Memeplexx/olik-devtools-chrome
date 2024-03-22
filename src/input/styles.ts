import styled, { css } from "styled-components";
import { possible } from "../html";
import { ValueType } from "./constants";

export const Input = styled.input<{ $initialized: boolean, $valueType: ValueType, $animate: boolean }>`
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
  opacity: ${p => p.$initialized ? '' : '0'};
  ${p => p.readOnly && `pointer-events: none;`}
  cursor: ${p => p.readOnly ? 'not-allowed' : p.$valueType === 'boolean' || p.$valueType === 'date' ? 'pointer' : 'text'};
`;

export const Quote = styled(possible.span)<{ $type: 'start' | 'end' }>`
  margin-right: ${p => p.$type === 'start' ? '-2px' : '0'};
  margin-left: ${p => p.$type === 'end' ? '-2px' : '0'};
`;

export const Wrapper = styled(possible.span)`
  position: relative;
`;