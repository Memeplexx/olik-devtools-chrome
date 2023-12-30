import styled from "styled-components";
import { Button, Div } from "../html";

export const Container = styled(Div)`
  display: flex;
  align-items: start;
  gap: 8px;
  padding: 8px;
`;

const SimplyButton = styled(Button)`
  padding: 4px;
  border: 1px solid grey;
`;

export const AddButton = styled(SimplyButton)`
`;

export const PatchButton = styled(SimplyButton)`
`

export const ToggleButton = styled(SimplyButton)`
`;