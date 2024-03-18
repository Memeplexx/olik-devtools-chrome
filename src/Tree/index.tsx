import { MouseEvent } from "react";
import { Frag } from "../html/frag";
import { decisionMap, fixKey, is, silentlyApplyStateAction } from "../shared/functions";
import { NodeType, RenderNodeArgs, TreeProps, Type } from "./constants";
import { BooleanNode, Node, PopupOption } from "./styles";
import { DatePicker } from "./date-picker";
import { CompactInput } from "./compact-input";
import { Options } from "./options";
import { BasicStore } from "../shared/types";
import { useOutputs } from "./outputs";
import { FaCopy } from "react-icons/fa";
import { MdAdd, MdDelete } from "react-icons/md";


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
    [() => is.null(item), () => textNode(item as null, keyConcat, store!, 'text')],
    [() => is.undefined(item), () => ''],
    [() => is.number(item), () => textNode(item as number, keyConcat, store!, 'number')],
    [() => is.string(item), () => textNode(item as string, keyConcat, store!, 'text')],
    [() => is.boolean(item), () => booleanNode(item as boolean, keyConcat, store!)],
    [() => is.date(item), () => dateNode(item as Date, keyConcat, store!)],
    [() => true, () => recurse(item, keyConcat)],
  ])();
  const content = (
    <>
      <Node
        $type={nodeType}
        showIf={!isContracted && !isEmpty && !isHidden}
        $unchanged={isUnchanged}
        $block={!isPrimitive}
        $indent={!isPrimitive}
        children={nodeEl}
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
                <Node
                  $type='key'
                  children={key}
                  $unchanged={isUnchanged}
                  showIf={hasObjectKey && !isTopLevel && !isHidden}
                />
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
                <Options
                  children={
                    <>
                      <PopupOption
                        onClick={outputs.onClickCopy(item)}
                        children={
                          <>
                            <FaCopy />
                            copy
                          </>
                        }
                      />
                      <PopupOption
                        onClick={outputs.onClickDelete(keyConcat)}
                        children={
                          <>
                            <MdDelete />
                            delete
                          </>
                        }
                      />
                      <PopupOption
                        showIf={is.array(item)}
                        onClick={outputs.onClickAdd(item, keyConcat)}
                        children={
                          <>
                            <MdAdd />
                            add
                          </>
                        }
                      />
                    </>
                  }
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

const textNode = <T extends string | number | null>(item: T, key: string, store: BasicStore, type: Type) => {
  return !store ? (item === null ? 'null' : type === 'text' ? `"${item}"` : item) : (
    <CompactInput
      value={item ?? 'null'}
      type={type}
      onChange={function onChangeInputNode(e) {
        silentlyApplyStateAction(store, [...fixKey(key).split('.'), `$set(${e})`]);
      }}
    />
  )
}

const dateNode = (item: Date, key: string, store: BasicStore) => {
  return !store ? item.toISOString() : (
    <DatePicker
      value={item}
      onChange={function onChangeDateNode(e) {
        silentlyApplyStateAction(store, [...fixKey(key).split('.'), `$set(${e.toISOString()})`]);
      }}
    />
  )
}

const booleanNode = (item: boolean, key: string, store: BasicStore) => {
  return !store ? item.toString() : (
    <BooleanNode
      children={item.toString()}
      onClick={function onClickBooleanNode() {
        silentlyApplyStateAction(store, [...fixKey(key).split('.'), `$set(${(!item).toString()})`]);
      }}
    />
  )
}

