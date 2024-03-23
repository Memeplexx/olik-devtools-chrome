import styled, { css } from "styled-components";
import { possible } from "../html";
import { Position } from "./consts";

export const PopupOptions = styled(possible.span)<{ $position: Position }>`
  position: absolute;
  top: 0;
  background-color: #FFF;
  color: #000;
  z-index: 1;
  flex-direction: column;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
  ${p => (pos => {
    if (pos === 'right') return css`left: 100%`;
    if (pos === 'above') return css`bottom: 100%`;
    if (pos === 'left') return css`right: 100%`;
    if (pos === 'below') return css`top: 100%`;
  })(p.$position)};
`;
export const PopupOption = styled(possible.span)<{ $selected?: boolean }>`
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  display: flex;
  gap: 8px;
  white-space: nowrap;
  :hover {
    background-color: rgba(0,0,0,0.1);
  }
  ${p => p.$selected && css`
    background-color: rgba(0,0,0,0.1);
    :hover {
      background-color: rgba(0,0,0,0.2);
    }
  `}
`;
