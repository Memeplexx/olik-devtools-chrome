import styled from "styled-components";
import { Editor } from "../editor";
import { Demo } from "../demo";
import { Tree } from "../tree";
import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { CiCircleRemove } from 'react-icons/ci';

export const ClearButton = styled.button`
	position: absolute;
	top: 0px;
	right: 0px;
	width: 20px;
	height: 20px;
	display: flex;
	cursor: pointer;
	border-radius: 50%;
	:hover {
		background-color: rgba(255,255,255,0.2);
	}
`;

export const ClearIcon = styled(CiCircleRemove)`
  flex: 1;
  height: auto;
`;

export const Items = styled.div`
	z-index: 1;
	display: flex;
	flex-direction: column;
	font-family: 'Source Code Pro', monospace;
	font-weight: 100;
	outline: none;
`;

export const Item = styled.div`
`;

export const ItemContent = styled.div<{ isLast: boolean, isSelected: boolean }>`
	padding: 4px 8px;
	margin-bottom: ${p => p.isLast ? '5px' : '0px'};
	border-left: 3px solid rgba(255,255,255,0.4);
	background-color: ${p => p.isSelected ? 'white!important' : 'transparent'};
	color: ${p => p.isSelected ? 'black' : ''};
	cursor: pointer;
	white-space: nowrap;
	&:hover {
		background-color: black;
	}
	.action {
		color: #00aaff;
	}
`;

export const DemoApp = styled(Demo)`
	background-color: #dfdfdf;
	min-width: 300px;
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
	overflow-x: auto;
`;

export const TreePanel = styled(Tree)`
	flex: 1;
`;

export const ResizeHandle = styled(PanelResizeHandle)`
  position: relative;
  outline: none;
  background-color: rgba(255, 255, 255, 0.05);
	&:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	&[data-resize-handle-active] {
		background-color: rgba(255, 255, 255, 0.2);
	}
	display: flex;
	height: 20px;
`;

export const ResizeHandleInner = styled.div`
	flex: 1;
	position: absolute;
	transition: all - color 0.2s linear;
	position: relative;
	display: flex;
`;

export const ResizeIcon = styled.svg`
	height: 15px;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`;

export const ResizeIconPath = styled.path`
`;

export const ResizablePanel = styled(Panel)`
	overflow: auto!important;
	display: flex;
  flex-direction: column-reverse;
`;

export const ItemsWrapper = styled(Panel)`
	overflow-y:auto!important;
	overflow-x: auto!important;
	display:flex;
	flex-direction:column-reverse;
`;