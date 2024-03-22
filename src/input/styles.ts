import styled from "styled-components";
import { possible } from "../html";
import { ValueType } from "./constants";

export const Input = styled.input<{ $initialized: boolean, $valueType: ValueType }>`
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
  display: ${p => p.$initialized ? 'inline' : 'none'};
  ${p => p.readOnly && `pointer-events: none;`}
  cursor: ${p => p.readOnly ? 'not-allowed' : p.$valueType === 'boolean' || p.$valueType === 'date' ? 'pointer' : 'text'};
`;

export const Quote = styled(possible.span)`
`;

export const Wrapper = styled(possible.span)`
  position: relative;
`;