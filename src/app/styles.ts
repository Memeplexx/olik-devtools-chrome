import styled from "styled-components";
import { Editor } from "../editor";
import { Demo } from "../demo";
import { Tree } from "../tree";
import { Panel, PanelResizeHandle } from "react-resizable-panels";

export const Items = styled.div`
	z-index: 1;
	display: flex;
	flex-direction: column;
	font-family: 'Source Code Pro', monospace;
	font-size: 12px;
	font-weight: 100;
`;

export const Item = styled.div`
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

export const DevtoolsPanel = styled.div`
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

export const ResizeHandle = styled(PanelResizeHandle)`
	flex: 0 0 1.5em;
  position: relative;
  outline: none;
  background-color: transparent;
	&[data-resize-handle-active] {
		background-color: rgba(255, 255, 255, 0.2);;
	}
`;

export const ResizeHandleInner = styled.div`
	position: absolute;
	top: 0.25em;
	bottom: 0.25em;
	left: 0.25em;
	right: 0.25em;
	border-radius: 0.25em;
	/* background-color: var(--background - color); */
	transition: all - color 0.2s linear;
`;

export const ResizeIcon = styled.svg`
	width: 1em;
  height: 1em;
  position: absolute;
  left: calc(50% - 0.5rem);
  top: calc(50% - 0.5rem);
`;

export const ResizeIconPath = styled.path``;

export const ResizablePanel = styled(Panel)`
	overflow: auto!important;
`;