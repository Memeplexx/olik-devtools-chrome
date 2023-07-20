import styled from "styled-components";
import { Editor } from "../editor";
import { Demo } from "../demo";
import { Tree } from "../tree";
import { Div } from "../html";

export const Items = styled(Div)`
	z-index: 1;
	display: flex;
	flex-direction: column;
	font-family: 'Source Code Pro', monospace;
	font-size: 12px;
	font-weight: 100;
`;

export const Item = styled(Div)`
	padding: 4px 8px;
	cursor: pointer;
	white-space: nowrap;
	&:hover {
		background-color: black;
	}
`;

export const DemoApp = styled(Demo)`
	flex: 1;
	background-color: #dfdfdf;
`;

export const EditorPanel = styled(Editor)`
	height: 18px;
`;

export const DevtoolsPanel = styled(Div)`
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 8px;
	background-color: rgb(28 28 28);
  color: white;
`;

export const TreePanel = styled(Tree)`
	flex: 1;
`;