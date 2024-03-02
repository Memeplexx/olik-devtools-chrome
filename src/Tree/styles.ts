import styled from "styled-components/macro";
import { Div } from "../html";


export const JsonWrapper = styled(Div)`
  overflow: auto;
  font-family: 'Source Code Pro', monospace;


  .value {
    padding-left: 20px;
    display: block;
  }
  .row {
    display: flex;
    gap: 2px;
  }
  .value {
    display: flex;
    flex-direction: column;
  }
  .row {
    filter: blur(0.5px);
    color: lightgray;
    transform: scale(1);
    transition: transform 0.5s;
    transform-origin: left;
  }
  .changed {
    filter: blur(0);
    transform: scale(2);
  }

  .string { color: green; }
  .number { color: darkorange; }
  .boolean { color: lightblue; }
  .null { color: magenta; }
  .key { color: red; }
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

export const OpenArray = styled.span.attrs({ children: '[' })`
`;

export const CloseArray = styled.span.attrs({ children: ']' })`
`;

export const Colon = styled.span.attrs({ children: ':' })`
`;

export const Key = styled.span`
`;

export const Value = styled.span`
  padding-left: 20px;
  display: block;
`;

export const ArrElement = styled.span<{ $added?: boolean, $removed?: boolean }>`
  ${p => p.$added && `
    color: green;
  `}
  ${p => p.$removed && `
    color: red;
  `}
`;

export const Row = styled.span`
  display: flex;
  gap: 2px;
`;

export const OpenObject = styled.span.attrs({ children: '{' })`
`;

export const CloseObject = styled.span.attrs({ children: '}' })`
`;

export const Comma = styled.span.attrs({ children: ',' })`
`;