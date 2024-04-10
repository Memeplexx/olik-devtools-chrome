import styled, { css } from "styled-components/macro";
import { Editor } from "../editor";
import { State } from "../state";
import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { CiCircleRemove } from 'react-icons/ci';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { possible } from "../html";
import { DemoWrapper } from "../demo/demo-wrapper";
import { IoMdMore } from "react-icons/io";
import { Tree } from "../tree";
import { LiaArrowsAltVSolid } from "react-icons/lia";



export const MenuButton = styled.button`
	position: absolute;
	right: 0;
	width: 20px;
	height: 20px;
	display: flex;
	cursor: pointer;
	border-radius: 50%;
	:hover {
		background-color: rgba(255,255,255,0.2);
	}
`;

export const ToggleOffIcon = styled(BsToggleOff)`
	width: auto;
	height: auto;
`;

export const ToggleOnIcon = styled(BsToggleOn)`
	width: auto;
	height: auto;
`;

export const ClearIcon = styled(CiCircleRemove)`
  flex: 1;
  height: auto;
`;

export const MenuIcon = styled(IoMdMore)`
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

export const ItemWrapper = styled.div`
  padding-left: 3px solid rgba(255,255,255,0.4);
  margin-bottom: 6px;
`;

export const ItemHeading = styled.div<{ $headerExpanded: boolean, $eventCount: number }>`
	color: white;
	transition: all 0.2s;
	max-height: ${p => p.$headerExpanded ? `${p.$eventCount * 15}px` : '15px'};
	padding: 0 4px;
	overflow: hidden;
	background-color: rgba(255,255,255,0.1);
	cursor: pointer;
	:hover {
		background-color: rgba(255,255,255,0.4);
	}
`;

export const ItemHead = styled.div`
  white-space: nowrap;
`;

export const ItemContent = styled.div<{ $isSelected?: boolean }>`
	${p => p.$isSelected ? css`filter: invert(1)` : ''};
	background-color: rgb(28, 28, 28);
	cursor: pointer;
  margin-left: 4px;
	position: relative;
	padding: 4px;
	&:hover {
		background-color: black;
	}
`;

export const ItemJsx = styled(Tree)`
	white-space: nowrap;
`;

export const ItemTime = styled.div`
	color: white;
	position: absolute;
	right: 0;
	top: 0;
	padding: 2px;
	background: #9d9d9d;
	width: 60px;
	text-align: end;
	border-bottom-left-radius: 8px;
	background-color: rgba(255,255,255,0.1);
`;

export const EditorPanel = styled(Editor)`
	height: 18px;
`;

export const DevtoolsPanel = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: rgb(28 28 28);
	overflow-x: auto;
	min-width: 300px;
`;

export const Error = styled(possible.div)`
	color: red;
	font-size: 14px;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const StatePanel = styled(State)`
	flex: 1;
`;

export const ResizeHandle = styled(PanelResizeHandle)`
	color: white;
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

export const ResizeIcon = styled(LiaArrowsAltVSolid)`
	height: 15px;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
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

export const DemoPanel = styled(possible.element(DemoWrapper))`
	max-width: 50vw;
`;