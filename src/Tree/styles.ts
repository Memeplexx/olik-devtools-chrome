import styled from "styled-components";
import { Pre } from "../html";


export const JsonWrapper = styled(Pre)`
  overflow: auto;
  font-family: 'Source Code Pro', monospace;
  .string { color: green; }
  .number { color: darkorange; }
  .boolean { color: blue; }
  .null { color: magenta; }
  .key { color: red; }
  .touched {
		color: #00b63d;
	}
	.untouched {
		color: #5d5d5d;
	}
`;
