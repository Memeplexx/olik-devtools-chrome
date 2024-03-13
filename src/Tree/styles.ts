import styled, { css } from "styled-components/macro";
import { possible } from "../html";



const possiblyClickable = (props: { $clickable?: boolean }) => !props.$clickable ? css`` : css`
  cursor: pointer;
  &:hover {
    background-color: rgba(255,255,255,0.2);
  }
`;

const possiblyUnchanged = (props: { $unchanged?: boolean }) => !props.$unchanged ? css`` : css`
  color: gray!important;
  * {
    color: gray!important;
  }
`;

const possiblyIndented = (props: { $indent?: boolean }) => !props.$indent ? css`` : css`
  padding-left: 16px;
`;

const possiblyBlock = (props: { $block?: boolean }) => !props.$block ? css`` : css`
  display: block;
`;

const arrayOrObject = (props: { $type?: 'array' | 'object' }) => props.$type === 'array'
  ? css`
    color: red;
` : css`
    color: violet;
`;

const possibleProps = (props: { $clickable?: boolean, $unchanged?: boolean, $indent?: boolean, $block?: boolean, $type?: 'array' | 'object' }) => css`
  ${possiblyClickable(props)}
  ${possiblyUnchanged(props)}
  ${possiblyIndented(props)}
  ${possiblyBlock(props)}
  ${arrayOrObject(props)}
`;

/* String Value */
export const Str = styled(possible.span)`
  color: green;
`;

/* Number Value */
export const Num = styled(possible.span)`
  color: darkorange;
`;

/* Boolean Value */
export const Boo = styled(possible.span)`
  color: lightblue;
`;

/* Null Value */
export const Nul = styled(possible.span)`
  color: magenta;
`;

/* Undefined Value */
export const Und = styled(possible.span)`
`;

/* Date Value */
export const Dat = styled(possible.span)`
  color: deepskyblue;
`;

/* Array Value */
export const Arr = styled(possible.span)`
  color: red;
  ${possibleProps};
`;

/* Object */
export const Obj = styled(possible.span)`
  color: violet;
  ${possibleProps};
`;

export const ArrObj = styled(possible.span)`
  color: violet;
  ${possibleProps};
`;

/* Action */
export const Act = styled(possible.span)`
  color: #fff;
  ${possibleProps};
`;

/* Object Key */
export const Key = styled(possible.span)`
  color: #fff;
  ${possibleProps};
`;

/* Colon */
export const Col = styled(possible.span)`
  color: #fff;
  padding-right: 4px;
`;

/* Parenthesis */
export const Par = styled(possible.span)`
  color: #fff;
  ${possibleProps};
`;

/* Container */
export const Con = styled(possible.span)`
  ${possibleProps};
`;

/* Comma */
export const Com = styled(possible.span)`
  color: #fff;
  &:after {
    content: ' ';
    display: block;
  }
`;
