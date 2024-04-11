import { ReactNode } from "react";
import { FaCopy, FaEdit, FaTrash } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { IconOption, PopupList } from "../popup-list";
import { is } from "../shared/functions";
import { RecurseArgs, RenderNodeArgs, TreeProps } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { ActionType, BraceNode, ChildNode, Colon, CommaNode, Ellipses, KeyNode, ParentNode, ParenthesisNode, ValueNode, Wrapper } from "./styles";


export const Tree = (
  props: TreeProps
): ReactNode => {
  const recurse = ({ outerKey, val }: RecurseArgs): ReactNode => {
    if (is.array(val)) return val.map((item, index) => (
      <RenderedNode
        key={index.toString()}
        {...props}
        recurse={recurse}
        keyConcat={`${outerKey}.${index}`}
        index={index}
        item={item}
        isLast={index === val.length - 1}
        isTopLevel={false}
        isArrayElement={true}
      />
    ));
    if (is.record(val)) return Object.keys(val).map((key, index, arr) => (
      <RenderedNode
        {...props}
        key={key}
        recurse={recurse}
        keyConcat={key === '' ? key.toString() : `${outerKey}.${key}`}
        index={index}
        item={val[key]}
        isLast={index === arr.length - 1}
        isTopLevel={key === ''}
        objectKey={key}
        isArrayElement={false}
      />
    ));
    if (is.scalar(val)) return (
      <RenderedNode
        {...props}
        recurse={recurse}
        keyConcat={outerKey}
        index={0}
        item={val}
        isLast={true}
        isTopLevel={true}
        isArrayElement={false}
      />
    );
  };
  return recurse({ val: is.recordOrArray(props.state) ? { '': props.state } : props.state, outerKey: '' });
}

export const RenderedNode = function RenderedNode(
  props: RenderNodeArgs,
) {
  const inputs = useInputs(props);
  const outputs = useOutputs(props, inputs);
  const content = (
    <>
      <ChildNode
        if={!inputs.isContracted && !inputs.isEmpty && !inputs.isHidden}
        onMouseOver={outputs.onMouseOverValueNode}
        onMouseOut={outputs.onMouseOutValueNode}
        data-key={props.keyConcat}
        {...inputs.styles}
        children={is.recordOrArray(props.item) ? props.recurse({ val: props.item, outerKey: props.keyConcat }) : !props.onChangeState ? inputs.nodeEl : (
          <ValueNode
            {...inputs.styles}
            data-key-input={props.keyConcat}
            value={inputs.value}
            onChange={outputs.onChangeValue}
            allowQuotesToBeShown={true}
            allowTypeSelectorPopup={true}
            allowTextArea={true}
            valueType={inputs.type}
            onClick={outputs.onClickValueNode}
            onChangeValueType={outputs.onChangeValueType}
            onChangeCommit={outputs.onChangeCommitValue}
            onChangeInputElement={outputs.onChangeInputElement}
            isChanged={inputs.isChanged}
            onHidePopup={outputs.onHideOptions}
            additionalOptions={!props.isArrayElement ? null : (
              <>
                <IconOption
                  onClick={outputs.onClickCopy}
                  icon={FaCopy}
                  text='copy node'
                />
                <IconOption
                  onClick={outputs.onClickRemoveFromArray}
                  icon={FaTrash}
                  text='remove array element'
                />
              </>
            )}
          />
        )}
      />
      <BraceNode
        if={!inputs.isHidden && !inputs.isPrimitive}
        children={is.array(props.item) ? ']' : '}'}
        {...inputs.styles}
      />
      <ParenthesisNode
        if={inputs.showActionType}
        children=')'
        {...inputs.styles}
      />
    </>
  );
  return (
    <Wrapper
      {...inputs.styles}
      key={props.index}
      data-key={props.keyConcat}
      children={
        <>
          <ParentNode
            {...inputs.styles}
            onClick={outputs.onClickParentNode(props.keyConcat)}
            onMouseOver={outputs.onMouseOverRootNode}
            onMouseOut={outputs.onMouseOutRootNode}
            children={
              <>
                <ActionType
                  if={inputs.showActionType}
                  {...inputs.styles}
                  children={props.actionType}
                />
                <ParenthesisNode
                  if={inputs.showActionType}
                  {...inputs.styles}
                  children='('
                />
                <KeyNode
                  if={inputs.hasObjectKey && !props.isTopLevel && !inputs.isHidden}
                  {...inputs.styles}
                  data-key-input={props.keyConcat}
                  ref={inputs.keyNodeRef}
                  readOnly={!props.onChangeState || !inputs.isEditingObjectKey}
                  value={inputs.key}
                  isChanged={inputs.isChanged}
                  onChange={outputs.onChangeKey}
                  onChangeCommit={outputs.onChangeCommitObjectKey}
                  onFocus={outputs.onFocusObjectKey}
                  onBlur={outputs.onBlurObjectKey}
                  allowTypeSelectorPopup={false}
                  allowQuotesToBeShown={false}
                  onHidePopup={outputs.onHideOptions}
                  valueType='string'
                />
                <Colon
                  if={inputs.hasObjectKey && !props.isTopLevel && !inputs.isHidden}
                  children=':'
                  {...inputs.styles}
                />
                <BraceNode
                  if={!inputs.isHidden && !inputs.isPrimitive}
                  children={is.array(props.item) ? '[' : '{'}
                  {...inputs.styles}
                />
                <Ellipses
                  if={inputs.isContracted && !inputs.isHidden}
                  children='...'
                  {...inputs.styles}
                />
                {inputs.isContracted && content}
                <PopupList
                  if={inputs.showOptions}
                  position='right'
                  children={
                    <>
                      <IconOption
                        if={inputs.hasObjectKey && !props.isTopLevel && !inputs.isHidden}
                        onClick={outputs.onClickEditKey}
                        icon={FaEdit}
                        text='edit object key'
                      />
                      <IconOption
                        onClick={outputs.onClickCopy}
                        icon={FaCopy}
                        text='copy node'
                      />
                      <IconOption
                        if={!props.isTopLevel && !props.isArrayElement}
                        onClick={outputs.onClickDelete}
                        icon={FaTrash}
                        text='delete node'
                      />
                      <IconOption
                        if={is.array(props.item)}
                        onClick={outputs.onClickAddToArray}
                        icon={IoMdAdd}
                        text='add array element'
                      />
                      <IconOption
                        if={!props.isTopLevel && !!props.isArrayElement}
                        onClick={outputs.onClickRemoveFromArray}
                        icon={FaTrash}
                        text='remove array element'
                      />
                      <IconOption
                        if={is.record(props.item)}
                        onClick={outputs.onClickAddToObject}
                        icon={IoMdAdd}
                        text='add to object'
                      />
                    </>
                  }
                />
              </>
            }
          />
          {!inputs.isContracted && content}
          <CommaNode
            if={!props.isLast && !inputs.isHidden && !inputs.isShowingTextArea}
            children=','
            {...inputs.styles}
          />
        </>
      }
    />
  )
}
