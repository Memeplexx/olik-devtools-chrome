import styled from "styled-components/macro";
import { possible } from "../html";


export const Str = styled.span`
  color: green;
`;

export const Num = styled.span`
  color: darkorange;
`;

export const Boo = styled.span`
  color: lightblue;
`;

export const Nul = styled.span`
  color: magenta;
`;

export const Und = styled.span`
`;

export const Dat = styled.span`
  color: beige;
`;

export const Arr = styled.span`
`;

export const Obj = styled.span`
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

export const ArrOpen = styled.span.attrs({ children: '[' }) <{ $unchanged?: boolean, $hideUnchanged?: boolean }>`
  &:hover {
    background-color: rgba(255,255,255,0.2);
  }
  ${unchangedOverride};
`;

export const ArrClose = styled.span.attrs({ children: ']' }) <{ $unchanged?: boolean, $hideUnchanged?: boolean }>`
  ${unchangedOverride};
`;

export const Colon = styled(possible.span).attrs({ children: ':' })`
  padding-right: 4px;
`;

export const Key = styled(possible.span)`
`;

export const ObjEmpty = styled.span.attrs({ children: '{...}' })``;

export const ArrEmpty = styled.span.attrs({ children: '[...]' })``;

export const Value = styled.span`
  padding-left: 16px;
  display: block;
`;

export const ArrElement = styled.span`
  display: block;
`;

export const Row = styled(possible.span) <{ $unchanged?: boolean, $hideUnchanged?: boolean }>`
  display: flex;
  ${unchangedOverride};
`;

export const ObjOpen = styled.span.attrs({ children: '{' })`
  cursor: pointer;
  &:hover > * {
    background-color: rgba(255,255,255,0.2);
  }
`;

export const Prim = styled.span<{ $unchanged?: boolean, $hideUnchanged?: boolean }>`
  ${unchangedOverride};
`;

export const ActionTypeOpen = styled.span`
  cursor: pointer;
  &:hover > * {
    background-color: rgba(255,255,255,0.2);
  }
`;

export const ActionTypeClose = styled.span`
`;

export const ActionTypeClosed = styled.span`
  cursor: pointer;
`;

export const ObjClose = styled.span.attrs({ children: '}' })`
`;

export const Comma = styled.span.attrs({ children: ',' })`
`;

export const RowContracted = styled(Row)`
  cursor: pointer;
  &:hover > * {
    background-color: rgba(255,255,255,0.2);
  }
`;

export const RowEmpty = styled(Row)`
  color: gray;
  * {
    color: gray;
  }
`;