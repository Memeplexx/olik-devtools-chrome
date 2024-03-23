import styled, { css } from "styled-components/macro";
import { possible } from "../html";
import { NodeType } from "./constants";
import { CompactInput } from "../input";



const typeMap = {
  array: 'red',
  object: 'violet',
  number: 'darkorange',
  string: 'green',
  date: 'deepskyblue',
  boolean: 'lightblue',
  null: 'magenta',
} satisfies Record<NodeType, string>;

export const CommonStyles = css<{ $type?: NodeType, $unchanged?: boolean }>`
  color: ${p => typeMap[p.$type!] ?? '#fff'};
  ${p => p.$unchanged && css`
    color: gray!important;
    * {
      color: gray!important;
    }
  `}
`;

export const KeyNode = styled(possible.element(CompactInput))`
  ${CommonStyles};
`;

export const ValueNode = styled(possible.element(CompactInput))`
  ${CommonStyles};
`;

export const Colon = styled(possible.span)`
  padding-right: 4px;
  ${CommonStyles};
`;

export const BraceNode = styled(possible.span)`
  ${CommonStyles};
`;

export const Ellipses = styled(possible.span)`
  ${CommonStyles};
`;

export const ParenthesisNode = styled(possible.span)`
  ${CommonStyles};
`;

export const ActionType = styled(possible.span)`
  ${CommonStyles};
`;

export const CommaNode = styled(possible.span)`
  ${CommonStyles};
  &:after {
    content: ' ';
    display: block;
  }
`;

export const ParentNode = styled(possible.span)`
  ${CommonStyles};
  position: relative;
  cursor: pointer;
  &:hover {
    background-color: rgba(255,255,255,0.2);
  }
`;

export const ChildNode = styled(possible.span)<{ $type?: NodeType, $unchanged?: boolean, $wrappingTextArea?: boolean }>`
  ${CommonStyles};
  position: relative;
  ${p => p.$wrappingTextArea ? css`flex: 1;` : ''}
  ${p => (p.$type === 'array' || p.$type === 'object') && css`
    padding-left: 16px;
    display: block;
  `}
`;

export const Wrapper = styled(possible.span)<{ $wrappingTextArea?: boolean }>`
  ${p => p.$wrappingTextArea ? css`display: flex;` : ''}
`;
