import { ClearButton, ClearIcon, DevtoolsPanel, EditorPanel, Error, ItemContent, ItemHead, ItemHeading, ItemJsx, ItemTime, ItemWrapper, Items, ItemsWrapper, ResizablePanel, ResizeHandle, ResizeHandleInner, ResizeIcon, ResizeIconPath, ShowUnchangedToggle, ToggleOffIcon, ToggleOnIcon, StatePanel, DemoPanel } from './styles';
import { PanelGroup } from 'react-resizable-panels';
import { useInputs } from './inputs';
import { Frag } from '../html/frag';
import { useOutputs } from './outputs';


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
                              storeRef={inputs.storeRef}
                              query={inputs.query}
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
                                  <ShowUnchangedToggle
                                    title="Hide ineffective updates"
                                    onClick={outputs.onClickHideIneffectiveActions}
                                    children={inputs.hideUnchanged ? <ToggleOnIcon /> : <ToggleOffIcon />}
                                  />
                                  <ClearButton
                                    children={<ClearIcon />}
                                    onClick={outputs.onClickClear}
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
                                <>
                                  {inputs.items.map(itemWrapper => (
                                    <ItemWrapper
                                      key={itemWrapper.id}
                                      children={
                                        <>
                                          <ItemHeading
                                            children={itemWrapper.event.map(e => (
                                              <ItemHead
                                                key={e}
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
        }
      />
    </>
  );
};
