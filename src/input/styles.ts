import styled from "styled-components";

export const Input = styled.input<{ $initialized: boolean }>`
  display: ${p => p.$initialized ? 'inline' : 'none'};
  ${p => p.readOnly && `pointer-events: none;`}
  :focus {
    outline: 1px solid #add8e6;
  }
  :hover {
    background-color: rgba(255,255,255,0.1);
  }
  text-align: center;
`;