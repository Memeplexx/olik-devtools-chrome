import { ForwardedRef, MouseEvent, RefObject, forwardRef } from "react";
import { FaCopy, FaEdit, FaTrash } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { Frag } from "../html/frag";
import { fixKey, is, silentlyApplyStateAction } from "../shared/functions";
import { CompactInput } from "../input";
import { RenderNodeArgs, RenderedNodeHandle, TreeProps } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { KeyNode, Node, PopupOption, PopupOptions } from "./styles";
import { IconType } from "react-icons/lib";


export const Tree = (
  props: TreeProps
): JSX.Element => {
  const recurse = <S extends Record<string, unknown> | unknown>(val: S, outerKey: string, ref: RefObject<RenderedNodeHandle>, focusValueNode: () => unknown): JSX.Element => {
    if (is.array(val)) {
      return (
        <>
          {val.map((item, index) => (
            <RenderedNode
              // key={index.toString()}
              key={JSON.stringify(item)}
              {...props}
              recurse={recurse}
              keyConcat={`${outerKey}.${index}`}
              index={index}
              item={item}
              isLast={index === val.length - 1}
              isTopLevel={false}
              ref={ref}
              focusValueNode={focusValueNode}
              isArrayElement={true}
            />
          ))}
        </>
      );
    } else if (is.record(val)) {
      return (
        <>
          {Object.keys(val).map((key, index, arr) => {
            return (
              <RenderedNode
                {...props}
                key={key.toString()}
                recurse={recurse}
                keyConcat={key === '' ? key.toString() : `${outerKey.toString()}.${key.toString()}`}
                index={index}
                item={val[key]}
                isLast={index === arr.length - 1}
                isTopLevel={key === ''}
                objectKey={key}
                ref={ref}
                focusValueNode={focusValueNode}
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
          ref={ref}
          focusValueNode={focusValueNode}
        />
      );
    } else {
      throw new Error(`unhandled type: ${val === undefined ? 'undefined' : val!.toString()}`);
    }
  };
  return recurse(is.recordOrArray(props.state) ? { '': props.state } : props.state, '', { current: null }, () => null);
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
        style={{ position: 'relative' }}
        onMouseOver={outputs.onMouseOverValueNode}
        onMouseOut={outputs.onMouseOutValueNode}
        children={
          is.recordOrArray(props.item) ? props.recurse(props.item, props.keyConcat, inputs.childNodeRef, outputs.onFocusValueNode) : !props.store ? inputs.nodeEl : (
            <>
              <CompactInput
                ref={inputs.valNodeRef}
                onClick={outputs.handleValueClick}
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
            style={{ position: 'relative' }}
            ref={inputs.nodeRef}
            $clickable={true}
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
                  ref={inputs.keyNodeRef}
                  readOnly={!props.store || !inputs.editObjectKey}
                  value={props.objectKey?.toString() || ''}
                  $unchanged={inputs.isUnchanged}
                  onChange={outputs.onKeyChange}
                // showIf={hasObjectKey && !isTopLevel && !isHidden}
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
                      showIf: is.record(props.item)
                    },
                    {
                      onClick: outputs.onClickCopy,
                      icon: FaCopy,
                      text: 'copy node'
                    },
                    {
                      onClick: outputs.onClickDelete,
                      icon: FaTrash,
                      text: 'delete node'
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

const Popup = (props: { children: { onClick: (e: MouseEvent<HTMLSpanElement>) => void, icon: IconType, text: string, showIf?: boolean }[], showIf?: boolean }) => {
  return (
    <PopupOptions
      showIf={props.showIf}
      children={
        props.children.map(prop => (
          <PopupOption
            key={prop.text}
            showIf={prop.showIf}
            onClick={prop.onClick}
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
