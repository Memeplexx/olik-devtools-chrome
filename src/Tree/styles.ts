import styled from "styled-components/macro";
import { possible } from "../html";


export const Str = styled(possible.span)`
  color: green;
`;

export const Num = styled(possible.span)`
  color: darkorange;
`;

export const Boo = styled(possible.span)`
  color: lightblue;
`;

export const Nul = styled(possible.span)`
  color: magenta;
`;

export const Und = styled(possible.span)`
`;

export const Dat = styled(possible.span)`
  color: beige;
`;

export const Arr = styled(possible.span)`
`;

export const Obj = styled(possible.span)`
  display: flex;
  flex-direction: column;
  align-items: start;
`;

const unchangedOverride = (p: { $unchanged?: boolean, $hideUnchanged?: boolean }) => `
  ${p.$hideUnchanged && p.$unchanged ? `
    display: none;
  ` : p.$unchanged ? `
    color: gray!important;
    * {
      color: gray!important;
    }
  ` : `
  `};
`;

export const ArrOpen = styled(possible.span).attrs({ children: '[' }) <{ $unchanged?: boolean, $hideUnchanged?: boolean }>`
  &:hover {
    background-color: rgba(255,255,255,0.2);
  }
  ${unchangedOverride};
`;

export const ArrClose = styled(possible.span).attrs({ children: ']' }) <{ $unchanged?: boolean, $hideUnchanged?: boolean }>`
  ${unchangedOverride};
`;

export const Colon = styled(possible.span).attrs({ children: ':' })`
  padding-right: 4px;
`;

export const Key = styled(possible.span)`
`;

export const ObjEmpty = styled(possible.span).attrs({ children: '{...}' })``;

export const ArrEmpty = styled(possible.span).attrs({ children: '[...]' })``;

export const Value = styled(possible.span)`
  padding-left: 16px;
  display: block;
`;

export const ArrElement = styled(possible.span)`
  display: block;
`;

export const Row = styled(possible.span) <{ $unchanged?: boolean, $hideUnchanged?: boolean }>`
  display: flex;
  ${unchangedOverride};
`;

export const ObjOpen = styled(possible.span).attrs({ children: '{' })`
  cursor: pointer;
  &:hover > * {
    background-color: rgba(255,255,255,0.2);
  }
`;

export const Prim = styled(possible.span)<{ $unchanged?: boolean, $hideUnchanged?: boolean }>`
  ${unchangedOverride};
`;

export const ActionTypeOpen = styled(possible.span)`
  cursor: pointer;
  &:hover > * {
    background-color: rgba(255,255,255,0.2);
  }
`;

export const ActionTypeClose = styled(possible.span)`
`;

export const ActionTypeClosed = styled(possible.span)`
  cursor: pointer;
`;

export const ObjClose = styled(possible.span).attrs({ children: '}' })`
`;

export const Comma = styled(possible.span).attrs({ children: ',' })`
`;

export const RowContracted = styled(Row)`
  cursor: pointer;
  &:hover > * {
    background-color: rgba(255,255,255,0.2);
  }
`;

export const RowUnchanged = styled(Row)`
  color: gray;
  * {
    color: gray;
  }
`;

export const RowEmpty = styled(Row)`
`;