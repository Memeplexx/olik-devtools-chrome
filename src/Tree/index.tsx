import { MouseEvent } from "react";
import { Frag } from "../html/frag";
import { is } from "../shared/functions";
import { TreeProps } from "./constants";
import { Node } from "./styles";



export const getStateAsJsx = (
  props: TreeProps
): JSX.Element => {
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
            isTopLevel: false
          }))}
        </>
      );
    } else if (is.nonArrayObject(val)) {
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
            key
          }))}
        </>
      );
    } else if (is.possibleBrandedPrimitive(val)) {
      return renderNode({
        ...props,
        recurse,
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
  }: TreeProps & {
    recurse: (val: unknown, outerKey: string) => JSX.Element,
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
  const isUnchanged = unchanged.includes(keyConcat);
  const isContracted = contractedKeys.includes(keyConcat);
  const isEmpty = is.array(item) ? !item.length : is.nonArrayObject(item) ? !Object.keys(item).length : false;
  const isHidden = isUnchanged && hideUnchanged;
  const showActionType = isTopLevel && !!actionType;
  const handleNodeClick = (key: string) => (event: MouseEvent) => {
    event.stopPropagation();
    onClickNodeKey(key);
  }
  const nodeType
    = is.array(item) ? 'array'
      : is.nonArrayObject(item) ? 'object'
        : is.number(item) ? `number`
          : is.string(item) ? `string`
            : is.boolean(item) ? `boolean`
              : is.date(item) ? `date`
                : is.null(item) ? `null`
                  : is.undefined(item) ? `undefined`
                    : `object`;
  const nodeContent
    = is.number(item) ? item
      : is.string(item) ? `"${item}"`
        : is.boolean(item) ? item.toString()
          : is.date(item) ? item.toISOString()
            : is.null(item) ? 'null'
              : is.undefined(item) ? ''
                : recurse(item, keyConcat);
  const content = (
    <>
      <Node
        $type={nodeType}
        children={nodeContent}
        showIf={!isContracted && !isEmpty && !isHidden}
        $unchanged={isUnchanged}
        $block={!itemIsPrimitive}
        $indent={!itemIsPrimitive}
      />
      <Node
        $type={nodeType}
        children={is.array(item) ? ']' : '}'}
        $unchanged={isUnchanged}
        showIf={!isHidden && !itemIsPrimitive}
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
                  showIf={isObject && !isTopLevel && !isHidden}
                />
                <Node
                  $type='colon'
                  children=':'
                  $unchanged={isUnchanged}
                  showIf={isObject && !isTopLevel && !isHidden}
                />
                <Node
                  $type={nodeType}
                  children={is.array(item) ? '[' : '{'}
                  $unchanged={isUnchanged}
                  showIf={!isHidden && !itemIsPrimitive}
                />
                <Node
                  $type={nodeType}
                  children='...'
                  showIf={isContracted && !isHidden}
                  $unchanged={isUnchanged}
                />
                {isContracted && content}
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
