import { useHooks } from './hooks';
import { useEvents } from './events';
import { ClearButton, ClearIcon, DemoApp, DevtoolsPanel, EditorPanel, Item, ItemContent, Items, ResizablePanel, ResizeHandle, ResizeHandleInner, ResizeIcon, ResizeIconPath, TreePanel } from './styles';
import { PanelGroup } from 'react-resizable-panels';


export const App = () => {
	const hooks = useHooks();
	const events = useEvents(hooks);
	return (
		<>
			<DemoApp
				showIf={!chrome.runtime}
			/>
			<DevtoolsPanel
				children={
					<>
						<EditorPanel
							query={hooks.query}
							state={hooks.state}
							onTextChanged={events.onEditorChange}
						/>
						<PanelGroup
							direction="vertical"
							children={
								<>
									<ResizablePanel
										maxSize={75}
										children={
											<TreePanel
												state={hooks.state}
												query={hooks.query}
												selected={hooks.selected}
												storeRef={hooks.storeRef}
											/>
										}
									/>
									<ResizeHandle
										children={
											<ResizeHandleInner
												children={
													<>
														<ResizeIcon
															viewBox="0 0 24 24"
															children={
																<ResizeIconPath
																	fill="currentColor"
																	d="M8,18H11V15H2V13H22V15H13V18H16L12,22L8,18M12,2L8,6H11V9H2V11H22V9H13V6H16L12,2Z"
																/>
															}
														/>
														<ClearButton
															children={<ClearIcon />}
															onClick={events.onClickClear}
														/>
													</>
												}
											/>
										}
									/>
									<ResizablePanel
										maxSize={75}
										children={
											<Items
												tabIndex={0}
												onKeyDown={events.onKeyDownItems}
												children={
													<>
														{hooks.items.map(item => (
															<Item
																key={item.id}
																onMouseEnter={events.onMouseEnterItem(item.id)}
																onMouseLeave={events.onMouseLeaveItem}
																onClick={events.onClickItem(item.id)}
																children={
																	<ItemContent
																		isSelected={item.id === hooks.selectedId}
																		isLast={item.last}
																		dangerouslySetInnerHTML={{ __html: item.typeFormatted }}
																	/>
																}
															/>
														))}
													</>
												}
											/>
										}
									/>
								</>
							}
						/>
					</>
				}
			/>
		</>
	);
};
