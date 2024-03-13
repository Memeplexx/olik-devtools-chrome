import styled, { css } from "styled-components/macro";
import { possible } from "../html";
import { decideComparing, defaultValue } from "../shared/functions";
import { NodeType } from "./constants";



const possibleProps = (props: { $clickable?: boolean, $unchanged?: boolean, $indent?: boolean, $block?: boolean, $type?: NodeType }) => css`
  ${decideComparing(props.$clickable, [
    {
      when: () => true,
      then: () => css`
        cursor: pointer;
        &:hover {
          background-color: rgba(255,255,255,0.2);
        }
      `
    },
    {
      when: () => defaultValue,
      then: () => css``
    },
  ])}  
  ${decideComparing(props.$unchanged, [
    {
      when: () => true,
      then: () => css`
        color: gray!important;
        * {
          color: gray!important;
        }
      `
    },
    {
      when: () => defaultValue,
      then: () => css``
    },
  ])}
  ${decideComparing(props.$indent, [
    {
      when: () => true,
      then: () => css`padding-left: 16px;`
    },
    {
      when: () => defaultValue,
      then: () => css``
    },
  ])}
  ${decideComparing(props.$block, [
    {
      when: () => true,
      then: () => css`display: block;`
    },
    {
      when: () => defaultValue,
      then: () => css``
    },
  ])}
  ${decideComparing(props.$type, [
    {
      when: () => 'array',
      then: () => css`color: red;`
    },
    {
      when: () => 'object',
      then: () => css`color: violet;`
    },
    {
      when: () => 'number',
      then: () => css`color: darkorange;`
    },
    {
      when: () => 'string',
      then: () => css`color: green;`
    },
    {
      when: () => 'date',
      then: () => css`color: deepskyblue;`
    },
    {
      when: () => 'boolean',
      then: () => css`color: lightblue;`
    },
    {
      when: () => 'actionType',
      then: () => css`color: #fff;`
    },
    {
      when: () => 'actionType',
      then: () => css`color: #fff;` 
    },
    {
      when: () => 'null',
      then: () => css`color: magenta;`
    },
    {
      when: () => 'comma',
      then: () => css`
        &:after {
          content: ' ';
          display: block;
        }
      `
    },
    {
      when: () => 'colon',
      then: () => css`
        color: #fff;
        padding-right: 4px;
      `
    },
    {
      when: () => 'key',
      then: () => css`color: #fff;`
    },
    {
      when: () => 'parenthesis',
      then: () => css`color: #fff;`
    },
    {
      when: () => defaultValue,
      then: () => css``
    }
  ])}
`;

export const Node = styled(possible.span)`
  ${possibleProps};
`;
