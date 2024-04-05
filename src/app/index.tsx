import { PanelGroup } from 'react-resizable-panels';
import { Frag } from '../html/frag';
import { PopupList } from '../popup-list';
import { useInputs } from './inputs';
import { useOutputs } from './outputs';
import { ClearIcon, DemoPanel, DevtoolsPanel, EditorPanel, Error, ItemContent, ItemHead, ItemHeading, ItemJsx, ItemTime, ItemWrapper, Items, ItemsWrapper, MenuButton, MenuIcon, ResizablePanel, ResizeHandle, ResizeHandleInner, ResizeIcon, ResizeIconPath, StatePanel, ToggleOffIcon, ToggleOnIcon } from './styles';

export const App = () => {
  const inputs = useInputs();
  const outputs = useOutputs(inputs);
  const storeStateVersion = inputs.storeStateVersion as Record<string, unknown>;
  return (
    <>
      {!chrome.runtime && <DemoPanel />}
      <DevtoolsPanel
        children={
          <>
            <Error
              showIf={!!inputs.error}
              children={inputs.error}
            />
            <Frag
              showIf={!inputs.error}
              children={
                <>
                  <EditorPanel
                    state={inputs.storeState}
                    onChange={outputs.onEditorChange}
                    onEnter={outputs.onEditorEnter}
                  />
                  <PanelGroup
                    direction="vertical"
                    children={
                      <>
                        <ResizablePanel
                          minSize={0}
                          children={
                            <StatePanel
                              ref={inputs.treeRef}
                              state={storeStateVersion ?? inputs.storeState!}
                              changed={inputs.changed}
                              removed={inputs.removed}
                              added={inputs.added}
                              query={inputs.query}
                              store={inputs.storeRef.current!}
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
                                  {/* <ShowUnchangedToggle
                                    title="Hide ineffective updates"
                                    onClick={outputs.onClickHideIneffectiveActions}
                                    children={inputs.hideUnchanged ? <ToggleOnIcon /> : <ToggleOffIcon />}
                                  />
                                  <ClearButton
                                    children={<ClearIcon />}
                                    onClick={outputs.onClickClear}
                                  /> */}
                                  <MenuButton
                                    onClick={outputs.onClickToggleMenu}
                                    children={
                                      <>
                                        <MenuIcon />
                                        <PopupList
                                          position='left'
                                          showIf={inputs.showOptions}
                                          children={[
                                            {
                                              icon: inputs.hideUnchanged ? ToggleOnIcon : ToggleOffIcon,
                                              text: 'Hide ineffective updates',
                                              onClick: outputs.onClickHideIneffectiveActions,
                                            },
                                            {
                                              icon: ClearIcon,
                                              text: 'Clear',
                                              onClick: outputs.onClickClear,
                                            },
                                          ]}
                                        />
                                      </>
                                    }
                                  />
                                </>
                              }
                            />
                          }
                        />
                        <ItemsWrapper
                          minSize={0}
                          id="itemsWrapper"
                          children={
                            <Items
                              tabIndex={0}
                              children={
                                inputs.items.filter(i => i.visible).map(itemWrapper => (
                                  <ItemWrapper
                                    key={itemWrapper.id}
                                    children={
                                      <>
                                        <ItemHeading
                                          $headerExpanded={itemWrapper.headerExpanded}
                                          $eventCount={itemWrapper.event.length}
                                          onClick={outputs.onClickHeader(itemWrapper.id)}
                                          children={itemWrapper.event.map((e, i) => (
                                            <ItemHead
                                              key={i}
                                              children={e}
                                            />
                                          ))}
                                        />
                                        {itemWrapper.items.map(item => (
                                          <ItemContent
                                            id={item.id.toString()}
                                            key={item.id}
                                            onClick={outputs.onClickItem(item.id)}
                                            isSelected={item.id === inputs.selectedId}
                                            children={
                                              <>
                                                <ItemJsx children={inputs.hideUnchanged ? item.jsxPruned : item.jsx} />
                                                <ItemTime children={item.time} />
                                              </>
                                            }
                                          />
                                        ))}
                                      </>
                                    }
                                  />
                                ))
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
        }
      />
    </>
  );
};
