import { FaCopy, FaEdit, FaTrash } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { Frag } from "../html/frag";
import { CompactInput } from "../input";
import { PopupList } from "../popup-list";
import { is } from "../shared/functions";
import { RecurseArgs, RenderNodeArgs, TreeProps } from "./constants";
import { useInputs } from "./inputs";
import { useOutputs } from "./outputs";
import { KeyNode, Node } from "./styles";


export const Tree = (
  props: TreeProps
): JSX.Element => {
  const recurse = ({ outerKey, val }: RecurseArgs): JSX.Element => {
    if (is.array(val)) {
      return (
        <>
          {val.map((item, index) => {
            return (
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
            );
          })}
        </>
      );
    } else if (is.record(val)) {
      return (
        <>
          {Object.keys(val).map((key, index, arr) => {
            return (
              <RenderedNode
                {...props}
                key={index.toString()}
                recurse={recurse}
                keyConcat={key === '' ? key.toString() : `${outerKey.toString()}.${key.toString()}`}
                index={index}
                item={val[key]}
                isLast={index === arr.length - 1}
                isTopLevel={key === ''}
                objectKey={key}
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
        />
      );
    } else {
      throw new Error(`unhandled type: ${val === undefined ? 'undefined' : val!.toString()}`);
    }
  };
  return recurse({val: is.recordOrArray(props.state) ? { '': props.state } : props.state, outerKey: ''});
}

export const RenderedNode = function RenderedNode(
  props: RenderNodeArgs,
) {
  const inputs = useInputs(props);
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
          is.recordOrArray(props.item) ? props.recurse({ val: props.item, outerKey: props.keyConcat }) : !props.store ? inputs.nodeEl : (
            <>
              <CompactInput
                onClick={outputs.handleValueClick}
                data-key={props.keyConcat}
                value={inputs.valueValue}
                onChange={outputs.onChangeValue}
                showQuotes={true}
                showPopup={true}
                type={inputs.valueType}
                onChangeType={outputs.onChangeValueType}
                onUpdate={outputs.onUpdateValue}
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
                  readOnly={!props.store || !inputs.isEditingObjectKey}
                  value={inputs.keyValue}
                  $unchanged={inputs.isUnchanged}
                  onUpdate={outputs.onKeyUpdate}
                  onFocus={outputs.onFocusObjectKey}
                  onBlur={outputs.onBlurObjectKey}
                  onChange={outputs.onChangeKey}
                  showPopup={false}
                  showQuotes={false}
                  type={'string'}
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
                <PopupList
                  showIf={inputs.showOptions}
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
}

