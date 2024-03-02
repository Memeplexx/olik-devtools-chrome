import styled from "styled-components/macro";
import { Div, Span } from "../html";


export const JsonWrapper = styled(Div)`
  overflow: auto;
  font-family: 'Source Code Pro', monospace;
`;

export const String = styled.span`
  color: green;
`;

export const Number = styled.span`
  color: darkorange;
`;

export const Boolean = styled.span`
  color: lightblue;
`;

export const Null = styled.span.attrs({ children: 'null' })`
  color: magenta;
`;

export const Dat = styled.span`
  color: beige;
`;

export const Arr = styled.span`
`;

export const Obj = styled.span`
`;

export const OpenArray = styled.span.attrs({ children: '[' })<{ $readonly?: boolean }>`
  ${p => p.$readonly ? '' : `cursor: pointer;`};
  &:hover {
    background-color: rgba(255,255,255,0.2);
  }
`;

export const CloseArray = styled.span.attrs({ children: ']' })`
`;

export const Colon = styled(Span).attrs({ children: ':' })`
  padding-right: 4px;
`;

export const Key = styled(Span)`
`;

export const EmptyObject = styled.span.attrs({ children: '{...}' })``;

export const EmptyArray = styled.span.attrs({ children: '[...]' })``;

export const Value = styled.span`
  padding-left: 16px;
  display: block;
`;

export const ArrElement = styled.span<{ $added?: boolean, $removed?: boolean }>`
  display: block;
  ${p => p.$added && `
    color: green;
  `}
  ${p => p.$removed && `
    color: red;
  `}
`;

export const Row = styled(Span)<{ $readonly?: boolean }>`
  display: flex;
  ${p => p.$readonly ? '' : `
    cursor: pointer;
    &:hover > * {
      background-color: rgba(255,255,255,0.2);
    }
  `};
`;

export const OpenObject = styled.span.attrs({ children: '{' })<{ $readonly?: boolean }>`
  ${p => p.$readonly ? '' : `
    cursor: pointer;
    &:hover > * {
      background-color: rgba(255,255,255,0.2);
    }
  `};
`;

export const CloseObject = styled.span.attrs({ children: '}' })`
`;

export const Comma = styled.span.attrs({ children: ',' })`
`;

export const RowContracted = styled(Row)`
  cursor: pointer;
  &:hover > * {
    background-color: rgba(255,255,255,0.2);
  }
`;