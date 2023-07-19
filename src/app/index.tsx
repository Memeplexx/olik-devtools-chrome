import { Demo } from '../demo';
import styled from 'styled-components';
import { Editor } from '../editor';
import { useHooks } from './hooks';
import { Tree } from '../Tree';
import { useEvents } from './events';


export const App = () => {
	const hooks = useHooks();
	const events = useEvents(hooks);
	return (
		<>
			{!chrome.runtime && <DemoApp />}
			<DevtoolsPanel>
				<EditorPanel
					query={hooks.query}
					state={hooks.state}
					onChange={events.onEditorChange}
				/>
				<TreePanel
					state={hooks.state}
					query={hooks.query}
					selectedState={hooks.selectedState}
				/>
				<Items>
					{hooks.items.map(item => (
						<Item
							key={item.id}
							onMouseEnter={events.onMouseEnterItem(item.id)}
							onMouseLeave={events.onMouseLeaveItem()}
						>
							{item.type}
						</Item>
					))}
				</Items>
			</DevtoolsPanel>
		</>
	);
};

const Items = styled.div`
	z-index: 1;
	display: flex;
	flex-direction: column;
	font-family: 'Source Code Pro', monospace;
	font-size: 12px;
	font-weight: 100;
`;

const Item = styled.div`
	padding: 4px 8px;
	cursor: pointer;
	white-space: nowrap;
	&:hover {
		background-color: black;
	}
`;

const DemoApp = styled(Demo)`
	flex: 1;
	background-color: #dfdfdf;
`;

const EditorPanel = styled(Editor)`
	height: 18px;
`;

const DevtoolsPanel = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 8px;
	background-color: rgb(28 28 28);
  color: white;
`;

const TreePanel = styled(Tree)`
	flex: 1;
`;