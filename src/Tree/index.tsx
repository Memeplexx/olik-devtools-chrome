import { MouseEvent } from "react";
import { Frag } from "../html/frag";
import { is } from "../shared/functions";
import { TreeProps } from "./constants";
import { Node } from "./styles";



export const getStateAsJsx = (
  props: TreeProps
): JSX.Element => {
  const onClickNodeKey = (key: string) => (event: MouseEvent) => {
    event.stopPropagation();
    props.onClickNodeKey(key);
  }
  const recurse = <S extends Record<string, unknown> | unknown>(val: S, outerKey: string): JSX.Element => {
    if (is.array(val)) {
      return (
        <>
          {val.map((item, index) => renderNode({
            props,
            recurse,
            onClickNodeKey,
            keyConcat: `${outerKey}.${index}`,
            index,
            item,
            isLast: index === val.length - 1,
            isTopLevel: false
          }))}
        </>
      );
    } else if (is.nonArrayObject(val)) {
      return (
        <>
          {Object.keys(val).map((key, index, arr) => renderNode({
            props,
            recurse,
            onClickNodeKey,
            keyConcat: key === '' ? key.toString() : `${outerKey.toString()}.${key.toString()}`,
            index,
            item: val[key],
            isLast: index === arr.length - 1,
            isTopLevel: key === '',
            key
          }))}
        </>
      );
    } else if (is.possibleBrandedPrimitive(val)) {
      return renderNode({
        props,
        recurse,
        onClickNodeKey,
        keyConcat: ``,
        index: 0,
        item: val,
        isLast: true,
        isTopLevel: true,
      });
    } else {
      throw new Error(`unhandled type: ${val === undefined ? 'undefined' : val!.toString()}`);
    }
  };
  return recurse(is.objectOrArray(props.state) ? { '': props.state } : props.state, '');
}


const renderNode = (
  {
    props,
    recurse,
    onClickNodeKey,
    keyConcat,
    index,
    item,
    isLast,
    isTopLevel,
    key,
  }: {
    props: TreeProps,
    recurse: (val: unknown, outerKey: string) => JSX.Element,
    onClickNodeKey: (key: string) => (event: MouseEvent) => void,
    keyConcat: string,
    index: number,
    item: unknown,
    isLast: boolean,
    isTopLevel: boolean,
    key?: string,
  }
) => {
  const itemIsPrimitive = !is.array(item) && !is.nonArrayObject(item);
  const isObject = key !== undefined;
  const isUnchanged = props.unchanged.includes(keyConcat);
  const isContracted = props.contractedKeys.includes(keyConcat);
  const isEmpty = is.array(item) ? !item.length : is.nonArrayObject(item) ? !Object.keys(item).length : false;
  const hideUnchanged = isUnchanged && props.hideUnchanged;
  const showActionType = isTopLevel && !!props.actionType;
  const nodeType
    = is.array(item) ? 'array'
      : is.nonArrayObject(item) ? 'object'
        : is.number(item) ? `number`
          : is.string(item) ? `string`
            : is.boolean(item) ? `boolean`
              : is.date(item) ? `date`
                : is.null(item) ? `null`
                  : is.undefined(item) ? `undefined` : `object`;
  const nodeContent
    = is.number(item) ? item.toString()
      : is.string(item) ? `"${item}"`
        : is.boolean(item) ? item.toString()
          : is.date(item) ? item.toISOString()
            : is.null(item) ? 'null'
              : is.undefined(item) ? '' : recurse(item, keyConcat);
  return (
    <Frag
      key={index}
      children={
        <>
          <Node
            $type='actionType'
            children={props.actionType}
            showIf={showActionType}
            $unchanged={isUnchanged}
            $clickable={true}
            onClick={onClickNodeKey(keyConcat)}
          />
          <Node
            $type='parenthesis'
            children='('
            showIf={showActionType}
            $unchanged={isUnchanged}
            $clickable={true}
            onClick={onClickNodeKey(keyConcat)}
          />
          <Node
            $type='key'
            children={key}
            $unchanged={isUnchanged}
            showIf={isObject && !isTopLevel && !hideUnchanged}
            $clickable={true}
            onClick={onClickNodeKey(keyConcat)}
          />
          <Node
            $type='colon'
            children=':'
            $unchanged={isUnchanged}
            showIf={isObject && !isTopLevel && !hideUnchanged}
          />
          <Node
            $type={nodeType}
            children={is.array(item) ? '[' : '{'}
            $unchanged={isUnchanged}
            $clickable={true}
            onClick={onClickNodeKey(keyConcat)}
            showIf={!hideUnchanged && !itemIsPrimitive}
          />
          <Node
            $type={nodeType}
            children='...'
            showIf={isContracted && !hideUnchanged}
            $unchanged={isUnchanged}
            $clickable={true}
            onClick={onClickNodeKey(keyConcat)}
          />
          <Node
            $type={nodeType}
            children={nodeContent}
            showIf={!isContracted && !isEmpty && !hideUnchanged}
            $unchanged={isUnchanged}
            $block={!itemIsPrimitive}
            $indent={!itemIsPrimitive}
          />
          <Node
            $type={nodeType}
            children={is.array(item) ? ']' : '}'}
            $unchanged={isUnchanged}
            showIf={!hideUnchanged && !itemIsPrimitive}
          />
          <Node
            $type='parenthesis'
            children=')'
            showIf={showActionType}
            $unchanged={isUnchanged}
          />
          <Node
            $type='comma'
            children=','
            showIf={!isLast && !hideUnchanged}
            $unchanged={isUnchanged}
          />
        </>
      }
    />
  )
}
