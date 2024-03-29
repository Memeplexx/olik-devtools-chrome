import { FaCopy, FaEdit, FaTrash } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { PopupList } from "../popup-list";
import { is } from "../shared/functions";
import { RecurseArgs, RenderNodeArgs, TreeProps } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { ActionType, BraceNode, ChildNode, Colon, CommaNode, Ellipses, KeyNode, ParentNode, ParenthesisNode, ValueNode, Wrapper } from "./styles";
import { ReactNode } from "react";


export const Tree = (
  props: TreeProps
): ReactNode => {
  const recurse = ({ outerKey, val }: RecurseArgs): ReactNode => {
    if (is.array(val)) {
      return val.map((item, index) => (
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
    }
    if (is.record(val)) {
      return Object.keys(val).map((key, index, arr) => (
        <RenderedNode
          {...props}
          key={index.toString()}
          recurse={recurse}
          keyConcat={key === '' ? key.toString() : `${outerKey}.${key}`}
          index={index}
          item={val[key]}
          isLast={index === arr.length - 1}
          isTopLevel={key === ''}
          objectKey={key}
        />
      ));
    }
    if (is.scalar(val)) {
      return (
        <RenderedNode
          {...props}
          recurse={recurse}
          keyConcat={outerKey}
          index={0}
          item={val}
          isLast={true}
          isTopLevel={true}
        />
      );
    }
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
        $wrappingTextArea={inputs.isShowingTextArea}
        $type={inputs.nodeType}
        showIf={!inputs.isContracted && !inputs.isEmpty && !inputs.isHidden}
        $unchanged={inputs.isUnchanged}
        onMouseOver={outputs.onMouseOverValueNode}
        onMouseOut={outputs.onMouseOutValueNode}
        children={
          is.recordOrArray(props.item) ? props.recurse({ val: props.item, outerKey: props.keyConcat }) : !props.store ? inputs.nodeEl : (
            <ValueNode
              $type={inputs.nodeType}
              data-key={props.keyConcat}
              value={inputs.value}
              onChange={outputs.onChangeValue}
              allowQuotesToBeShown={true}
              allowTypeSelectorPopup={true}
              allowTextArea={true}
              type={inputs.type}
              onClick={outputs.onClickValueNode}
              onChangeType={outputs.onChangeValueType}
              onChangeCommit={outputs.onChangeCommitValue}
              onChangeInputElement={outputs.onChangeInputElement}
              additionalOptions={(!props.isArrayElement || !inputs.showArrayOptions) ? [] : [
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
          )
        }
      />
      <BraceNode
        $type={inputs.nodeType}
        children={is.array(props.item) ? ']' : '}'}
        $unchanged={inputs.isUnchanged}
        showIf={!inputs.isHidden && !inputs.isPrimitive}
      />
      <ParenthesisNode
        children=')'
        showIf={inputs.showActionType}
        $unchanged={inputs.isUnchanged}
      />
    </>
  );
  return (
    <Wrapper
      $wrappingTextArea={inputs.isShowingTextArea}
      key={props.index}
      children={
        <>
          <ParentNode
            onClick={outputs.onClickParentNode(props.keyConcat)}
            onMouseOver={outputs.onMouseOverRootNode}
            onMouseOut={outputs.onMouseOutRootNode}
            children={
              <>
                <ActionType
                  children={props.actionType}
                  showIf={inputs.showActionType}
                  $unchanged={inputs.isUnchanged}
                />
                <ParenthesisNode
                  children='('
                  showIf={inputs.showActionType}
                  $unchanged={inputs.isUnchanged}
                />
                <KeyNode
                  showIf={inputs.hasObjectKey && !props.isTopLevel && !inputs.isHidden}
                  data-key={props.keyConcat}
                  ref={inputs.keyNodeRef}
                  readOnly={!props.store || !inputs.isEditingObjectKey}
                  value={inputs.key}
                  $unchanged={inputs.isUnchanged}
                  onChange={outputs.onChangeKey}
                  onChangeCommit={outputs.onChangeCommitObjectKey}
                  onFocus={outputs.onFocusObjectKey}
                  onBlur={outputs.onBlurObjectKey}
                  allowTypeSelectorPopup={false}
                  allowQuotesToBeShown={false}
                  type='string'
                />
                <Colon
                  children=':'
                  $unchanged={inputs.isUnchanged}
                  showIf={inputs.hasObjectKey && !props.isTopLevel && !inputs.isHidden}
                />
                <BraceNode
                  $type={inputs.nodeType}
                  children={is.array(props.item) ? '[' : '{'}
                  $unchanged={inputs.isUnchanged}
                  showIf={!inputs.isHidden && !inputs.isPrimitive}
                />
                <Ellipses
                  $type={inputs.nodeType}
                  children='...'
                  showIf={inputs.isContracted && !inputs.isHidden}
                  $unchanged={inputs.isUnchanged}
                />
                {inputs.isContracted && content}
                <PopupList
                  showIf={inputs.showOptions}
                  position='right'
                  children={[
                    {
                      onClick: outputs.onClickEditKey,
                      icon: FaEdit,
                      text: 'edit object key',
                      showIf: inputs.hasObjectKey && !props.isTopLevel && !inputs.isHidden
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
          <CommaNode
            children=','
            showIf={!props.isLast && !inputs.isHidden && !inputs.isShowingTextArea}
            $unchanged={inputs.isUnchanged}
          />
        </>
      }
    />
  )
}
