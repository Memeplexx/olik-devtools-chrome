import { MouseEvent } from "react";
import { Frag } from "../html/frag";
import { decisionMap, fixKey, is, silentlyApplyStateAction } from "../shared/functions";
import { CompactInput } from "./compact-input";
import { NodeType, RenderNodeArgs, TreeProps } from "./constants";
import { OptionsWrapper } from "./options";
import { useOutputs } from "./outputs";
import { KeyNode, Node } from "./styles";


export const Tree = (
  props: TreeProps
): JSX.Element => {
  const outputs = useOutputs(props);
  const recurse = <S extends Record<string, unknown> | unknown>(val: S, outerKey: string): JSX.Element => {
    if (is.array(val)) {
      return (
        <>
          {val.map((item, index) => renderNode({
            ...props,
            recurse,
            keyConcat: `${outerKey}.${index}`,
            index,
            item,
            isLast: index === val.length - 1,
            isTopLevel: false,
            outputs,
          }))}
        </>
      );
    } else if (is.record(val)) {
      return (
        <>
          {Object.keys(val).map((key, index, arr) => renderNode({
            ...props,
            recurse,
            keyConcat: key === '' ? key.toString() : `${outerKey.toString()}.${key.toString()}`,
            index,
            item: val[key],
            isLast: index === arr.length - 1,
            isTopLevel: key === '',
            key,
            outputs,
          }))}
        </>
      );
    } else if (is.scalar(val)) {
      return renderNode({
        ...props,
        recurse,
        keyConcat: ``,
        index: 0,
        item: val,
        isLast: true,
        isTopLevel: true,
        outputs,
      });
    } else {
      throw new Error(`unhandled type: ${val === undefined ? 'undefined' : val!.toString()}`);
    }
  };
  return recurse(is.recordOrArray(props.state) ? { '': props.state } : props.state, '');
}

const renderNode = (
  {
    unchanged,
    contractedKeys,
    recurse,
    keyConcat,
    index,
    item,
    isLast,
    isTopLevel,
    key,
    actionType,
    hideUnchanged,
    onClickNodeKey,
    store,
    outputs,
  }: RenderNodeArgs
) => {
  const isPrimitive = !is.array(item) && !is.record(item);
  const hasObjectKey = key !== undefined;
  const isUnchanged = unchanged.includes(keyConcat);
  const isContracted = contractedKeys.includes(keyConcat);
  const isEmpty = is.array(item) ? !item.length : is.record(item) ? !Object.keys(item).length : false;
  const isHidden = isUnchanged && hideUnchanged;
  const showActionType = isTopLevel && !!actionType;
  const handleNodeClick = (key: string) => (event: MouseEvent) => {
    event.stopPropagation();
    onClickNodeKey(key);
  }
  const nodeType = decisionMap([
    [() => is.array(item), 'array'],
    [() => is.record(item), 'object'],
    [() => is.number(item), 'number'],
    [() => is.string(item), 'string'],
    [() => is.boolean(item), 'boolean'],
    [() => is.date(item), 'date'],
    [() => is.null(item), 'null'],
    [() => is.undefined(item), 'undefined'],
  ]) as NodeType;
  const nodeEl = decisionMap([
    [() => is.null(item), () => 'null'],
    [() => is.undefined(item), () => ''],
    [() => is.number(item), () => (item as number).toString()],
    [() => is.string(item), () => `"${(item as string).toString()}"`],
    [() => is.date(item), () => (item as Date).toISOString()],
    [() => true, () => item],
  ])() as JSX.Element;
  const content = (
    <>
      <Node
        $type={nodeType}
        showIf={!isContracted && !isEmpty && !isHidden}
        $unchanged={isUnchanged}
        $block={!isPrimitive}
        $indent={!isPrimitive}
        children={
          is.recordOrArray(item) ? recurse(item, keyConcat) : !store ? nodeEl : (
            <CompactInput
              value={item === null ? 'null' : item === undefined ? '' : is.date(item) ? item.toISOString() : item.toString()}
              revertOnBlur={true}
              onChange={function onChangeInputNode(e) {
                silentlyApplyStateAction(store, [...fixKey(keyConcat).split('.'), `$set(${e.toString()})`]);
              }}
            />
          )
        }
      />
      <Node
        $type={nodeType}
        children={is.array(item) ? ']' : '}'}
        $unchanged={isUnchanged}
        showIf={!isHidden && !isPrimitive}
      />
      <Node
        $type='parenthesis'
        children=')'
        showIf={showActionType}
        $unchanged={isUnchanged}
      />
    </>
  );
  return (
    <Frag
      key={index}
      children={
        <>
          <Node
            $clickable={true}
            onClick={handleNodeClick(keyConcat)}
            children={
              <>
                <Node
                  $type='actionType'
                  children={actionType}
                  showIf={showActionType}
                  $unchanged={isUnchanged}
                />
                <Node
                  $type='parenthesis'
                  children='('
                  showIf={showActionType}
                  $unchanged={isUnchanged}
                />
                {hasObjectKey && !isTopLevel && !isHidden && <KeyNode
                  disabled={!store}
                  value={key?.toString() || ''}
                  $unchanged={isUnchanged}
                  // showIf={hasObjectKey && !isTopLevel && !isHidden}
                />}
                <Node
                  $type='colon'
                  children=':'
                  $unchanged={isUnchanged}
                  showIf={hasObjectKey && !isTopLevel && !isHidden}
                />
                <Node
                  $type={nodeType}
                  children={is.array(item) ? '[' : '{'}
                  $unchanged={isUnchanged}
                  showIf={!isHidden && !isPrimitive}
                />
                <Node
                  $type={nodeType}
                  children='...'
                  showIf={isContracted && !isHidden}
                  $unchanged={isUnchanged}
                />
                {isContracted && content}
                <OptionsWrapper
                  onCopy={outputs.onClickCopy(item)}
                  onDelete={outputs.onClickDelete(keyConcat)}
                  onAddToArray={outputs.onClickAddToArray(keyConcat)}
                  onAddToObject={outputs.onClickAddToObject(keyConcat)}
                  onEditKey={outputs.onClickEditKey(keyConcat)}
                  state={item}
                />
              </>
            }
          />
          {!isContracted && content}
          <Node
            $type='comma'
            children=','
            showIf={!isLast && !isHidden}
            $unchanged={isUnchanged}
          />
        </>
      }
    />
  )
}
