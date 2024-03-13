import styled, { css } from "styled-components/macro";
import { possible } from "../html";
import { NodeType } from "./constants";




export const Node = styled(possible.span) <{ $clickable?: boolean, $unchanged?: boolean, $indent?: boolean, $block?: boolean, $type?: NodeType }>`
  ${p => p.$type === 'array' && css`color: red;`}
  ${p => p.$type === 'object' && css`color: violet;`}
  ${p => p.$type === 'number' && css`color: darkorange;`}
  ${p => p.$type === 'string' && css`color: green;`}
  ${p => p.$type === 'date' && css`color: deepskyblue;`}
  ${p => p.$type === 'boolean' && css`color: lightblue;`}
  ${p => p.$type === 'actionType' && css`color: #fff;`}
  ${p => p.$type === 'null' && css`color: magenta;`}
  ${p => p.$type === 'key' && css`color: #fff;`}
  ${p => p.$type === 'parenthesis' && css`color: #fff;`}
  ${p => p.$indent && css`padding-left: 16px;`}
  ${p => p.$block && css`display: block;`}
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
  ${p => p.$type === 'comma' && css`
    &:after {
      content: ' ';
      display: block;
    }
  `}
  ${p => p.$type === 'colon' && css`
    color: #fff;
    padding-right: 4px;
  `}
`;
