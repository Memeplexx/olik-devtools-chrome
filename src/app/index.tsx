import { ClearButton, ClearIcon, DevtoolsPanel, EditorPanel, Error, ItemContent, ItemHead, ItemHeading, ItemWrapper, Items, ItemsWrapper, ResizablePanel, ResizeHandle, ResizeHandleInner, ResizeIcon, ResizeIconPath, ShowUnchangedToggle, ToggleOffIcon, ToggleOnIcon, TreePanel } from './styles';
import { PanelGroup } from 'react-resizable-panels';
import { useInputs } from './inputs';
import { Frag } from '../html/frag';
import { useOutputs } from './outputs';
import { DemoWrapper } from '../demo/demo-wrapper';


export const App = () => {
  const inputs = useInputs();
  const events = useOutputs(inputs);
  return (
    <>
      {!chrome.runtime && <DemoWrapper />}
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
                    onQueryChanged={events.onQueryChanged}
                  />
                  <PanelGroup
                    direction="vertical"
                    children={
                      <>
                        <ResizablePanel
                          maxSize={75}
                          children={
                            <TreePanel
                              ref={inputs.treeRef}
                              state={inputs.storeState!}
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
                                    title="Hide ineffective actions"
                                    onClick={events.onClickShowHiddenArgs}
                                    children={inputs.hideIneffectiveActions ? <ToggleOnIcon /> : <ToggleOffIcon />}
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
                        <ItemsWrapper
                          maxSize={75}
                          id="itemsWrapper"
                          children={
                            <Items
                              tabIndex={0}
                              children={
                                <>
                                  {inputs.itemsForView.map(itemWrapper => (
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
                                              onMouseEnter={events.onMouseEnterItem(item.id)}
                                              onMouseLeave={events.onMouseLeaveItem}
                                              onClick={events.onClickItem(item.id)}
                                              isSelected={item.id === inputs.selectedId}
                                              dangerouslySetInnerHTML={{ __html: item.typeFormatted }}
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
