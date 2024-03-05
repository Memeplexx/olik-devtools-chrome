import styled from "styled-components";
import { possible } from "../html";

export const Container = styled(possible.div)`
  display: flex;
  align-items: start;
  gap: 8px;
  padding: 8px;
  background-color: #dfdfdf;
	min-width: 300px;
`;

export const SimpleButton = styled(possible.button)`
  padding: 4px;
  border: 1px solid grey;
`;
