import { PanelGroup } from 'react-resizable-panels';
import { Frag } from '../html/frag';
import { PopupList } from '../popup-list';
import { useInputs } from './inputs';
import { useOutputs } from './outputs';
import { ClearIcon, DemoPanel, DevtoolsPanel, EditorPanel, Error, HeaderDown, HeaderUp, ItemContent, ItemHead, ItemHeading, ItemJsx, ItemTime, ItemWrapper, Items, ItemsWrapper, MenuButton, MenuIcon, ResizablePanel, ResizeHandle, ResizeHandleInner, ResizeIcon, StatePanel, ToggleOffIcon, ToggleOnIcon } from './styles';

export const App = () => {
  const inputs = useInputs();
  const outputs = useOutputs(inputs);
  return (
    <>
      <DemoPanel
        showIf={!chrome.runtime}
      />
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
                    state={inputs.fullState!}
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
                              state={inputs.fullState!}
                              changed={inputs.changed!}
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
                                  <ResizeIcon />
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
                                              text: 'Hide ineffective actions',
                                              onClick: outputs.onClickHideIneffectiveActions,
                                            },
                                            {
                                              icon: inputs.displayInline ? ToggleOnIcon : ToggleOffIcon,
                                              text: 'Display inline',
                                              onClick: outputs.onClickDisplayInline,
                                            },
                                            {
                                              icon: ClearIcon,
                                              text: 'Clear',
                                              onClick: outputs.onClickClear,
                                            },
                                            {
                                              icon: inputs.hideHeaders ? HeaderDown : HeaderUp,
                                              text: 'Hide trace headers',
                                              onClick: outputs.onClickHideHeaders,
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
                                inputs.itemsGrouped.map(itemGroup => (
                                  <ItemWrapper
                                    key={itemGroup.id}
                                    children={
                                      <>
                                        <ItemHeading
                                          showIf={!inputs.hideHeaders}
                                          $headerExpanded={!inputs.contractedHeaders.includes(itemGroup.id)}
                                          $eventCount={itemGroup.event.length}
                                          onClick={outputs.onClickHeader(itemGroup.id)}
                                          children={itemGroup.event.map((e, i) => (
                                            <ItemHead
                                              key={i}
                                              children={e}
                                            />
                                          ))}
                                        />
                                        {itemGroup.items.map(item => (
                                          <ItemContent
                                            id={item.id.toString()}
                                            key={item.id}
                                            onClick={outputs.onClickItem(item.id)}
                                            $isSelected={item.id === inputs.selectedId}
                                            children={
                                              <>
                                                <ItemJsx
                                                  changed={item.changed}
                                                  unchanged={item.unchanged}
                                                  actionType={item.actionType}
                                                  state={item.actionPayload}
                                                  contractedKeys={item.contractedKeys}
                                                  onClickNodeKey={outputs.onClickNodeKey}
                                                  hideUnchanged={inputs.hideUnchanged}
                                                  displayInline={inputs.displayInline}
                                                />
                                                <ItemTime
                                                  children={item.time}
                                                />
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
