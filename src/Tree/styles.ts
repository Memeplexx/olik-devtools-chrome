import styled from "styled-components";
import { Div, Pre } from "../html";

export const ScrollPane = styled(Div)`
  overflow: auto;
`;

export const JsonWrapper = styled(Pre)`
  font-family: 'Source Code Pro', monospace;
  .string { color: green; }
  .number { color: darkorange; }
  .boolean { color: blue; }
  .null { color: magenta; }
  .key { color: red; }
`;
