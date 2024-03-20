import { ForwardedRef, forwardRef } from "react";
import { FaCopy, FaEdit, FaTrash } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { IconType } from "react-icons/lib";
import { Frag } from "../html/frag";
import { CompactInput } from "../input";
import { fixKey, is, silentlyApplyStateAction } from "../shared/functions";
import { RecurseArgs, RenderNodeArgs, RenderedNodeHandle, TreeProps } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { KeyNode, Node, PopupOption, PopupOptions } from "./styles";


export const Tree = (
  props: TreeProps
): JSX.Element => {
  if (props.stateIdToPathMap.size === 0) {
    return <></>;
  }
  const recurse = ({ outerKey, val, childNodeRef }: RecurseArgs): JSX.Element => {
    if (is.array(val)) {
      return (
        <>
          {val.map((item, index) => {
            return (
              <RenderedNode
                key={props.stateIdToPathMap.get(`${outerKey}.${index}`)}
                {...props}
                recurse={recurse}
                keyConcat={`${outerKey}.${index}`}
                index={index}
                item={item}
                isLast={index === val.length - 1}
                isTopLevel={false}
                isArrayElement={true}
                ref={childNodeRef}
              />
            );
          })}
        </>
      );
    } else if (is.record(val)) {
      return (
        <>
          {Object.keys(val).sort((a, b) => a.localeCompare(b)).map((key, index, arr) => {
            return (
              <RenderedNode
                {...props}
                key={props.stateIdToPathMap.get(key === '' ? key.toString() : `${outerKey.toString()}.${key.toString()}`)}
                recurse={recurse}
                keyConcat={key === '' ? key.toString() : `${outerKey.toString()}.${key.toString()}`}
                index={index}
                item={val[key]}
                isLast={index === arr.length - 1}
                isTopLevel={key === ''}
                objectKey={key}
                ref={childNodeRef}
              />
            )
          })}
        </>
      );
    } else if (is.scalar(val)) {
      return (
        <RenderedNode
          {...props}
          recurse={recurse}
          keyConcat={outerKey}
          index={0}
          item={val}
          isLast={true}
          isTopLevel={true}
          ref={childNodeRef}
        />
      );
    } else {
      throw new Error(`unhandled type: ${val === undefined ? 'undefined' : val!.toString()}`);
    }
  };
  return recurse({val: is.recordOrArray(props.state) ? { '': props.state } : props.state, outerKey: '', childNodeRef: { current: null }});
}

export const RenderedNode = forwardRef(function RenderedNode(
  props: RenderNodeArgs,
  forwardedRef: ForwardedRef<RenderedNodeHandle>
) {
  const inputs = useInputs(props, forwardedRef);
  const outputs = useOutputs(props, inputs);
  const content = (
    <>
      <Node
        $type={inputs.nodeType}
        showIf={!inputs.isContracted && !inputs.isEmpty && !inputs.isHidden}
        $unchanged={inputs.isUnchanged}
        $block={!inputs.isPrimitive}
        $indent={!inputs.isPrimitive}
        $relative
        onMouseOver={outputs.onMouseOverValueNode}
        onMouseOut={outputs.onMouseOutValueNode}
        children={
          is.recordOrArray(props.item) ? props.recurse({ val: props.item, outerKey: props.keyConcat, childNodeRef: inputs.childNodeRef }) : !props.store ? inputs.nodeEl : (
            <>
              <CompactInput
                ref={inputs.valNodeRef}
                onClick={outputs.handleValueClick}
                data-key={props.keyConcat}
                value={props.item === null ? 'null' : props.item === undefined ? '' : is.date(props.item) ? props.item.toISOString() : props.item.toString()}
                onChange={function onChangeInputNode(e) {
                  silentlyApplyStateAction(props.store!, [...fixKey(props.keyConcat).split('.'), `$set(${e.toString()})`]);
                }}
              />
              <Popup
                showIf={!!props.isArrayElement && inputs.showArrayOptions}
                children={[
                  {
                    onClick: outputs.onClickCopy,
                    icon: FaCopy,
                    text: 'copy node'
                  },
                  {
                    onClick: outputs.onClickDeleteArrayElement,
                    icon: FaTrash,
                    text: 'delete node'
                  },
                ]}
              />
            </>
          )
        }
      />
      <Node
        $type={inputs.nodeType}
        children={is.array(props.item) ? ']' : '}'}
        $unchanged={inputs.isUnchanged}
        showIf={!inputs.isHidden && !inputs.isPrimitive}
      />
      <Node
        $type='parenthesis'
        children=')'
        showIf={inputs.showActionType}
        $unchanged={inputs.isUnchanged}
      />
    </>
  );
  return (
    <Frag
      key={props.index}
      children={
        <>
          <Node
            $clickable
            $relative
            onClick={outputs.handleNodeClick(props.keyConcat)}
            onMouseOver={outputs.onMouseOverRootNode}
            onMouseOut={outputs.onMouseOutRootNode}
            children={
              <>
                <Node
                  $type='actionType'
                  children={props.actionType}
                  showIf={inputs.showActionType}
                  $unchanged={inputs.isUnchanged}
                />
                <Node
                  $type='parenthesis'
                  children='('
                  showIf={inputs.showActionType}
                  $unchanged={inputs.isUnchanged}
                />
                {inputs.hasObjectKey && !props.isTopLevel && !inputs.isHidden && <KeyNode
                  data-key={props.keyConcat}
                  ref={inputs.keyNodeRef}
                  readOnly={!props.store || !inputs.editObjectKey}
                  value={props.objectKey?.toString() || ''}
                  $unchanged={inputs.isUnchanged}
                  onChange={outputs.onKeyChange}
                  onFocus={outputs.onFocusObjectKey}
                />}
                <Node
                  $type='colon'
                  children=':'
                  $unchanged={inputs.isUnchanged}
                  showIf={inputs.hasObjectKey && !props.isTopLevel && !inputs.isHidden}
                />
                <Node
                  $type={inputs.nodeType}
                  children={is.array(props.item) ? '[' : '{'}
                  $unchanged={inputs.isUnchanged}
                  showIf={!inputs.isHidden && !inputs.isPrimitive}
                />
                <Node
                  $type={inputs.nodeType}
                  children='...'
                  showIf={inputs.isContracted && !inputs.isHidden}
                  $unchanged={inputs.isUnchanged}
                />
                {inputs.isContracted && content}
                <Popup
                  showIf={inputs.showOptions}
                  children={[
                    {
                      onClick: outputs.onClickEditKey,
                      icon: FaEdit,
                      text: 'edit object key',
                      showIf: !props.isTopLevel
                    },
                    {
                      onClick: outputs.onClickCopy,
                      icon: FaCopy,
                      text: 'copy node'
                    },
                    {
                      onClick: outputs.onClickDelete,
                      icon: FaTrash,
                      text: 'delete node',
                      showIf: !props.isTopLevel
                    },
                    {
                      onClick: outputs.onClickAddToArray,
                      icon: IoMdAdd,
                      text: 'add array element',
                      showIf: is.array(props.item)
                    },
                    {
                      onClick: outputs.onClickAddToObject,
                      icon: IoMdAdd,
                      text: 'add to object',
                      showIf: is.record(props.item)
                    }
                  ]}
                />
              </>
            }
          />
          {!inputs.isContracted && content}
          <Node
            $type='comma'
            children=','
            showIf={!props.isLast && !inputs.isHidden}
            $unchanged={inputs.isUnchanged}
          />
        </>
      }
    />
  )
});

const Popup = (props: { children: { onClick: () => void, icon: IconType, text: string, showIf?: boolean }[], showIf?: boolean }) => {
  return (
    <PopupOptions
      showIf={props.showIf}
      children={
        props.children.map(prop => (
          <PopupOption
            key={prop.text}
            showIf={prop.showIf}
            onClick={e => {
              e.stopPropagation();
              prop.onClick()
            }}
            children={
              <>
                <prop.icon />
                {prop.text}
              </>
            }
          />
        ))
      }
    />
  )
}
