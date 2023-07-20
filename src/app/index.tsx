import { useHooks } from './hooks';
import { useEvents } from './events';
import { DemoApp, DevtoolsPanel, EditorPanel, Item, Items, TreePanel } from './styles';


export const App = () => {
	const hooks = useHooks();
	const events = useEvents(hooks);
	return (
		<>
			<DemoApp
				showIf={!chrome.runtime}
			/>
			<DevtoolsPanel
				inside={
					<>
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
						<Items
							inside={
								<>
									{hooks.items.map(item => (
										<Item
											key={item.id}
											onMouseEnter={events.onMouseEnterItem(item.id)}
											onMouseLeave={events.onMouseLeaveItem()}
											inside={item.type}
										/>
									))}
								</>
							}
						/>
					</>
				}
			/>
		</>
	);
};
