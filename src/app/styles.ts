import styled, { css } from "styled-components/macro";
import { Editor } from "../editor";
import { State } from "../state";
import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { CiCircleRemove } from 'react-icons/ci';
import { BsCopy, BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { Demo } from "../demo";
import { IoMdMore } from "react-icons/io";
import { Tree } from "../tree";
import { LiaArrowsAltVSolid } from "react-icons/lia";
import { LuArrowUpToLine } from "react-icons/lu";
import { LuArrowDownToLine } from "react-icons/lu";
import { TbClock } from "react-icons/tb";
import { div, element } from "../html";


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

export const HeaderUp = styled(LuArrowUpToLine)`
  flex: 1;
  height: auto;
`;

export const HeaderDown = styled(LuArrowDownToLine)`
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
	position: relative;
`;

export const TimeIcon = styled(TbClock)``;


export const ItemContent = styled.div<{ $isSelected?: boolean }>`
	${p => p.$isSelected ? css`filter: invert(1)` : ''};
	background-color: rgb(28, 28, 28);
	cursor: pointer;
	position: relative;
	padding: 0 8px;
	&:hover {
		background-color: black;
	}
`;

export const ItemJsx = styled(Tree)`
	white-space: nowrap;
`;

export const LeftBorder = styled.div<{ $isLast: boolean, $isHovered: boolean }>`
	position: absolute;
	bottom: ${p => p.$isLast ? '4px' : '0'};
	top: 0;
	left: 0;
	width: 4px;
	background-color: ${p => p.$isHovered ? '#FFF' : '#363636'};
`;

export const CopyButton = styled.button`
	color: #000;
	border-radius: 50%;
	padding: 4px;
	margin: -4px 0;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	:hover {
		background-color: #CCC;
	}
`;

export const CopyIcon = styled(BsCopy)`
`;

export const Tag = styled(div)`
	background-color: #000;
	color: #FFF;
	text-decoration: underline;
	font-weight: bold;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0px 4px;
  margin: 0 -4px;
	z-index: 2;
	:hover {
		${CopyButton} {
			opacity: 1;
		}
	}
`;

export const TagName = styled(div)`
	display: flex;
	align-items: center;
`;

export const ItemTime = styled.div`
	padding: 2px;
	background: #9d9d9d;
	width: 70px;
	text-align: end;
	display: flex;
	justify-content: space-between;
	background-color: transparent;
	z-index: 2;
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

export const Error = styled(div)`
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

export const DemoPanel = styled(element(Demo))`
	max-width: 50vw;
`;