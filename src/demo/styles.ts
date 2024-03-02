import styled from "styled-components";
import { possible } from "../html";

export const Container = styled(possible.div)`
  display: flex;
  align-items: start;
  gap: 8px;
  padding: 8px;
`;

const SimplyButton = styled(possible.button)`
  padding: 4px;
  border: 1px solid grey;
`;

export const AddButton = styled(SimplyButton)`
`;

export const PatchButton = styled(SimplyButton)`
`

export const ToggleButton = styled(SimplyButton)`
`;

export const NestedButton = styled(SimplyButton)`
`;