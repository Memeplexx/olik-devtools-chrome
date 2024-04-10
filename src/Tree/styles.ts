import styled, { css } from "styled-components/macro";
import { possible } from "../html";
import { CompactInput } from "../input";
import { StyleProps } from "./constants";



export const KeyNode = styled(possible.element(CompactInput))<StyleProps>`
  color: ${p => p.$nonValueColor};
`;

export const ValueNode = styled(possible.element(CompactInput))<StyleProps>`
  color: ${p => p.$color};
`;

export const Colon = styled(possible.span)<StyleProps>`
  padding-right: 4px;
  color: #7a7a7a;
`;

export const BraceNode = styled(possible.span)<StyleProps>`
  color: ${p => p.$color};
`;

export const Ellipses = styled(possible.span)<StyleProps>`
  color: ${p => p.$color};
`;

export const ParenthesisNode = styled(possible.span)<StyleProps>`
  color: ${p => p.$nonValueColor};
`;

export const ActionType = styled(possible.span) <StyleProps>`
  color: ${p => p.$nonValueColor};
`;

export const CommaNode = styled(possible.span) <StyleProps>`
  color: ${p => p.$color};
  &:after {
    content: ' ';
    display: ${p => p.$displayInline ? 'inline' : css`block`};
  }
`;

export const ParentNode = styled(possible.span) <StyleProps>`
  position: relative;
  cursor: pointer;
  &:hover {
    background-color: rgba(255,255,255,0.2);
  }
`;

export const ChildNode = styled(possible.span) <StyleProps>`
  position: relative;
  min-width: 0;
  color: ${p => p.$color};
  ${p => !p.$displayInline && p.$isArrayOrObject && css`padding-left: 16px`};
  ${p => !p.$displayInline && p.$isArrayOrObject && css`display: block`};
  ${p => p.$showTextArea && css`flex: 1`};
`;

export const Wrapper = styled(possible.span) <StyleProps>`
  ${p => p.$showTextArea && css`display: flex`};
`;
