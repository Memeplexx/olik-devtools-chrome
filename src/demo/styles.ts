import styled from "styled-components/macro";
import { button, div } from "../html";

export const Container = styled(div)`
  display: flex;
  align-content: start;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background-color: #dfdfdf;
	min-width: 300px;
`;

export const SimpleButton = styled(button)`
  padding: 4px;
  border: 1px solid grey;
`;
