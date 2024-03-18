import styled, { css } from "styled-components/macro";
import { possible } from "../html";
import { NodeType } from "./constants";




export const Node = styled(possible.span) <{ $clickable?: boolean, $unchanged?: boolean, $indent?: boolean, $block?: boolean, $type?: NodeType }>`
  ${p => p.$type === 'array' && css`
    color: red;
  `}
  ${p => p.$type === 'object' && css`
    color: violet;
  `}
  ${p => p.$type === 'number' && css`
    color: darkorange;
  `}
  ${p => p.$type === 'string' && css`
    color: green;
  `}
  ${p => p.$type === 'date' && css`
    color: deepskyblue;
  `}
  ${p => p.$type === 'boolean' && css`
    color: lightblue;
  `}
  ${p => p.$type === 'actionType' && css`
    color: #fff;
  `}
  ${p => p.$type === 'null' && css`
    color: magenta;
  `}
  ${p => p.$type === 'key' && css`
    color: #fff;
  `}
  ${p => p.$type === 'parenthesis' && css`
    color: #fff;
  `}
  ${p => p.$type === 'colon' && css`
    color: #fff;
    padding-right: 4px;
  `}
  ${p => p.$type === 'comma' && css`
    color: #fff;
    &:after {
      content: ' ';
      display: block;
    }
  `}
  ${p => p.$indent && css`
    padding-left: 16px;
  `}
  ${p => p.$block && css`
    display: block;
  `}
  ${p => p.$clickable && css`
    cursor: pointer;
    &:hover {
      background-color: rgba(255,255,255,0.2);
    }
  `}
  ${p => p.$unchanged && css`
    color: gray!important;
    * {
      color: gray!important;
    }
  `}
`;

export const BooleanNode = styled.span`
  cursor: pointer;
  :hover {
    background-color: rgba(255,255,255,0.1);
  }
`;

export const Input = styled.input`
  margin-right: ${p => p.type === 'text' ? '0px' : '-26px'};
  :focus {
    outline: 1px solid #add8e6;
  }
  :hover {
    background-color: rgba(255,255,255,0.1);
  }
`;

export const Quote = styled(possible.span)<{ $pushLeft?: boolean }>`
  ${p => p.$pushLeft ? 'margin-left: -4px;' : ''}
`;

export const DatePickerContainer = styled.span`
  :hover {
    background-color: rgba(255,255,255,0.1);
  }
`;

export const PopupOptions = styled.span`
  position: absolute;
  display: none;
  left: calc(100%);
  top: 0;
  background-color: #FFF;
  color: #000;
  z-index: 1;
  flex-direction: column;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
`;

export const PopupOption = styled.span`
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  display: flex;
  gap: 8px;
  :hover {
    background-color: rgba(0,0,0,0.1);
  }
`