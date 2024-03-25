import styled, { css } from "styled-components/macro";
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
  ${p => p.$initialized ? css`opacity: 1` : css`opacity: 0`};
  ${p => p.readOnly && css`pointer-events: none;`}
  ${p => p.readOnly ? css`cursor: not-allowed` : p.$valueType === 'boolean' || p.$valueType === 'date' ? css`cursor: pointer` : css`cursor: text`};
`;

export const TextArea = styled(possible.textarea)<{ $initialized: boolean, $valueType: ValueType, $animate: boolean, $height: number, $width: number }>`
  overflow: hidden;
  resize: none;
  :focus {
    outline: 1px solid #add8e6;
  }
  :hover {
    background-color: rgba(255,255,255,0.1);
  }
  ${p => p.$animate ? css`transition: 0.4s opacity` : ''};
  ${p => p.$initialized ? css`opacity: 1` : css`opacity: 0`};
  ${p => p.readOnly && css`pointer-events: none;`}
  ${p => p.readOnly ? css`cursor: not-allowed` : css`cursor: text`};
  ${p => css`height: ${p.$height}px`};
  ${p => css`width: calc(${p.$width}px - 6px)`};
`;

export const Quote = styled(possible.span)<{ $type: 'start' | 'end' }>`
`;

export const Wrapper = styled(possible.span)<{ $isTextArea: boolean }>`
  position: relative;
  ${p => p.$isTextArea ? css`display: flex;` : ''};
`;

export const TextMeasurerWrapper = styled(possible.span)`
  position: absolute;
  border: 1px solid transparent;
  background-color: transparent;
  left: 0;
  bottom: 0;
  pointer-events: none;
  white-space: pre-wrap;
`;

export const TextMeasurer = styled(possible.span)`
  visibility: hidden;
`;

export const TextAreaWrapper = styled(possible.span)`
  position: relative;
  flex: 1;
  display: flex;
`;
