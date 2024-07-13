import styled, { css } from "styled-components/macro";
import { ValueType } from "./constants";
import { input, span, textarea } from "../html";

type CommonProps = { $initialized: boolean, $valueType: ValueType, $animate: boolean, $isChanged: boolean };

const commonInputProps = css<CommonProps & { readOnly?: boolean }>`
  :focus {
    outline: 1px solid #add8e6;
  }
  :hover {
    background-color: rgba(255,255,255,0.1);
  }
  ${p => p.$isChanged ? css`background-color: rgba(255,255,255,0.2); border-radius: 2px;` : css``};
  ${p => p.$initialized ? css`opacity: 1` : css`opacity: 0`};
  ${p => p.readOnly && css`pointer-events: none;`}
  ${p => p.readOnly ? css`cursor: not-allowed` : p.$valueType === 'boolean' || p.$valueType === 'date' ? css`cursor: pointer` : css`cursor: text`};
`;

export const Input = styled(input)<CommonProps>`
  ${commonInputProps};
  text-align: center;
`;

export const TextArea = styled(textarea)<CommonProps & { $height: number, $width: number }>`
  ${commonInputProps};
  overflow: hidden;
  resize: none;
  ${p => css`height: ${p.$height}px`};
  ${p => css`width: calc(${p.$width}px - 6px)`};
`;

export const Quote = styled(span)<{ $type: 'start' | 'end' }>`
`;

export const Wrapper = styled(span)<{ $isTextArea: boolean }>`
  position: relative;
  ${p => p.$isTextArea ? css`display: flex;` : ''};
`;

export const TextMeasurerWrapper = styled(span)`
  position: absolute;
  border: 1px solid transparent;
  background-color: transparent;
  left: 0;
  bottom: 0;
  pointer-events: none;
  white-space: pre-wrap;
`;

export const TextMeasurer = styled(span)`
  visibility: hidden;
`;

export const TextAreaWrapper = styled(span)`
  position: relative;
  flex: 1;
  display: flex;
`;
