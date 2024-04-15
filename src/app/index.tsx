import { PanelGroup } from 'react-resizable-panels';
import { Frag } from '../html/frag';
import { IconOption, PopupList } from '../popup-list';
import { FragmentProps } from './constants';
import { useInputs } from './inputs';
import { useOutputs } from './outputs';
import { ClearIcon, DemoPanel, DevtoolsPanel, EditorPanel, Error, HeaderDown, HeaderUp, ItemContent, ItemHead, ItemHeading, ItemJsx, ItemTime, ItemWrapper, Items, ItemsWrapper, MenuButton, MenuIcon, ResizablePanel, ResizeHandle, ResizeHandleInner, ResizeIcon, StatePanel, TimeIcon, ToggleOffIcon, ToggleOnIcon } from './styles';

export const App = () => {
  const inputs = useInputs();
  const outputs = useOutputs(inputs);
  const fragmentProps = { inputs, outputs };
  return (
    <>
      <DemoPanel
        if={!chrome.runtime}
      />
      <DevtoolsPanel
        children={
          <>
            <Error
              if={!!inputs.error}
              children={inputs.error}
            />
            <Frag
              if={!inputs.error}
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
                        <CurrentStateFragment
                          {...fragmentProps}
                        />
                        <ResizerFragment
                          {...fragmentProps}
                        />
                        <ListItemsFragment
                          {...fragmentProps}
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

const CurrentStateFragment = ({ inputs }: FragmentProps) => (
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
);

const ResizerFragment = ({ inputs, outputs }: FragmentProps) => (
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
                    if={inputs.showOptions}
                    position='left'
                    children={
                      <>
                        <IconOption
                          icon={inputs.hideUnchanged ? ToggleOnIcon : ToggleOffIcon}
                          text='Hide ineffective updates'
                          onClick={outputs.onClickHideIneffectiveActions}
                        />
                        <IconOption
                          icon={inputs.displayInline ? ToggleOnIcon : ToggleOffIcon}
                          text='Display inline'
                          onClick={outputs.onClickDisplayInline}
                        />
                        <IconOption
                          icon={ClearIcon}
                          text='Clear'
                          onClick={outputs.onClickClear}
                        />
                        <IconOption
                          icon={inputs.hideHeaders ? HeaderDown : HeaderUp}
                          text='Hide trace headers'
                          onClick={outputs.onClickHideHeaders}
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
    }
  />
);

const ListItemsFragment = ({ inputs, outputs }: FragmentProps) => (
  <ItemsWrapper
    minSize={0}
    children={
      <Items
        tabIndex={0}
        children={inputs.itemsGrouped.map(itemGroup => (
          <ItemWrapper
            key={itemGroup.id}
            children={
              <>
                <ItemHeading
                  if={!inputs.hideHeaders}
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
                          onClickNodeKey={outputs.onClickNodeKey(item.id)}
                          hideUnchanged={inputs.hideUnchanged}
                          displayInline={inputs.displayInline}
                        />
                        <ItemTime
                          children={
                            <>
                              <TimeIcon />
                              {item.time}
                            </>
                          }
                        />
                      </>
                    }
                  />
                ))}
              </>
            }
          />
        ))}
      />
    }
  />
);
