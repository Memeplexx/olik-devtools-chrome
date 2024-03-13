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
          {val.map((item, index) => {
            const notLast = index !== val.length - 1;
            const isTopLevel = false;
            const keyConcat = isTopLevel ? index.toString() : `${outerKey}.${index}`;
            return renderNode({ props, recurse, onClickNodeKey, keyConcat, index, item, notLast, isTopLevel });
          })}
        </>
      );
    } else if (is.nonArrayObject(val)) {
      const objectKeys = Object.keys(val);
      return (
        <>
          {objectKeys.map((key, index) => {
            const notLast = index !== objectKeys.length - 1;
            const isTopLevel = key === '';
            const item = val[key];
            const keyConcat = isTopLevel ? key.toString() : `${outerKey.toString()}.${key.toString()}`;
            return renderNode({ props, recurse, onClickNodeKey, keyConcat, index, item, notLast, isTopLevel, key });
          })}
        </>
      );
    } else if (is.possibleBrandedPrimitive(val)) {
      const isTopLevel = outerKey === '';
      const keyConcat = isTopLevel ? `` : outerKey;
      return renderNode({ props, recurse, onClickNodeKey, keyConcat, index: 0, item: val, notLast: false, isTopLevel: true });
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
    notLast,
    isTopLevel,
    key,
  }: {
    props: TreeProps,
    recurse: (val: unknown, outerKey: string) => JSX.Element,
    onClickNodeKey: (key: string) => (event: MouseEvent) => void,
    keyConcat: string,
    index: number,
    item: unknown,
    notLast: boolean,
    isTopLevel: boolean,
    key?: string,
  }
) => {
  const itemIsArray = is.array(item);
  const itemIsNonArrayObject = is.nonArrayObject(item);
  const itemIsPrimitive = !itemIsArray && !itemIsNonArrayObject;
  const isObject = key !== undefined;
  const isUnchanged = props.unchanged.includes(keyConcat);
  const isContracted = props.contractedKeys.includes(keyConcat);
  const isEmpty = itemIsArray ? !item.length : itemIsNonArrayObject ? !Object.keys(item).length : false;
  const hideUnchanged = isUnchanged && props.hideUnchanged;
  const showActionType = isTopLevel && !!props.actionType;
  return (
    <Frag
      key={index}
      children={
        <>
          <Node
            $type={`actionType`}
            children={props.actionType}
            showIf={showActionType}
            $unchanged={isUnchanged}
            $clickable={true}
            onClick={onClickNodeKey(keyConcat)}
          />
          <Node
            $type={'parenthesis'}
            children={`(`}
            showIf={showActionType}
            $unchanged={isUnchanged}
            $clickable={true}
            onClick={onClickNodeKey(keyConcat)}
          />
          <Node
            $type={'key'}
            children={key}
            $unchanged={isUnchanged}
            showIf={isObject && !isTopLevel && !hideUnchanged}
            $clickable={true}
            onClick={onClickNodeKey(keyConcat)}
          />
          <Node
            $type={'colon'}
            children={`:`}
            $unchanged={isUnchanged}
            showIf={isObject && !isTopLevel && !hideUnchanged}
          />
          <Node
            $type={itemIsArray ? `array` : `object`}
            children={itemIsArray ? `[` : `{`}
            $unchanged={isUnchanged}
            $clickable={true}
            onClick={onClickNodeKey(keyConcat)}
            showIf={!hideUnchanged && !itemIsPrimitive}
          />
          <Node
            $type={itemIsArray ? `array` : `object`}
            children={`...`}
            showIf={isContracted && !hideUnchanged}
            $unchanged={isUnchanged}
            $clickable={true}
            onClick={onClickNodeKey(keyConcat)}
          />
          <Node
            $type={is.number(item) ? `number` : is.string(item) ? `string` : is.boolean(item) ? `boolean` : is.date(item) ? `date` : is.null(item) ? `null` : is.undefined(item) ? `undefined` : `object`}
            children={is.number(item) ? item.toString() : is.string(item) ? `"${item}"` : is.boolean(item) ? item.toString() : is.date(item) ? item.toISOString() : is.null(item) ? 'null' : is.undefined(item) ? 'undefined' : recurse(item, keyConcat)}
            showIf={!isContracted && !isEmpty && !hideUnchanged}
            $unchanged={isUnchanged}
            $block={!itemIsPrimitive}
            $indent={!itemIsPrimitive}
          />
          <Node
            $type={itemIsArray ? `array` : `object`}
            children={itemIsArray ? `]` : `}`}
            $unchanged={isUnchanged}
            showIf={!hideUnchanged && !itemIsPrimitive}
          />
          <Node
            $type={`parenthesis`}
            children={`)`}
            showIf={showActionType}
            $unchanged={isUnchanged}
          />
          <Node
            $type={`comma`}
            children={`,`}
            showIf={notLast && !hideUnchanged}
            $unchanged={isUnchanged}
          />
        </>
      }
    />
  )
}
