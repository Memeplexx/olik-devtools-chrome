import { MouseEvent } from "react";
import { Frag } from "../html/frag";
import { is } from "../shared/functions";
import { NodeType, TreeProps } from "./constants";
import { Node } from "./styles";



export const getStateAsJsx = (
  props: TreeProps
): JSX.Element => {
  const onClickNodeKey = (key: string) => (event: MouseEvent) => {
    event.stopPropagation();
    props.onClickNodeKey(key);
  }
  const recurse = <S extends Record<string, unknown> | unknown>(val: S, outerKey: string): JSX.Element => {
    const unchanged = props.unchanged.includes(outerKey);
    const doRenderPrimitive = (type: NodeType, value?: string) => renderPrimitive({ props, unchanged, outerKey, el: <Node children={value} $type={type} /> });
    if (is.undefined(val)) {
      return doRenderPrimitive('undefined');
    } else if (is.null(val)) {
      return doRenderPrimitive('null', 'null');
    } else if (is.string(val)) {
      return doRenderPrimitive('string', `"${val}"`);
    } else if (is.number(val)) {
      return doRenderPrimitive('number', val.toString());
    } else if (is.boolean(val)) {
      return doRenderPrimitive('boolean', val.toString());
    } else if (is.date(val)) {
      return doRenderPrimitive('date', val.toISOString());
    } else if (is.array(val)) {
      return (
        <>
          {val.map((item, index) => {
            const notLast = index !== val.length - 1;
            const isTopLevel = false;
            return renderObjectOrArray({ props, recurse, onClickNodeKey, outerKey, index, item, notLast, isTopLevel });
          })}
        </>
      );
    } else if (is.nonArrayObject(val)) {
      const objectKeys = Object.keys(val);
      return (
        <>
          {objectKeys.map((key, index) => {
            const notLast = index !== objectKeys.length - 1
            const isTopLevel = key === '';
            const item = val[key];
            return renderObjectOrArray({ props, recurse, onClickNodeKey, outerKey, index, item, notLast, isTopLevel, key });
          })}
        </>
      );
    } else {
      throw new Error(`unhandled type: ${val === undefined ? 'undefined' : val!.toString()}`);
    }
  };
  return recurse(is.objectOrArray(props.state) ? { '': props.state } : props.state, '');
}


const renderObjectOrArray = (
  {
    props,
    recurse,
    onClickNodeKey,
    outerKey,
    index,
    item,
    notLast,
    isTopLevel,
    key,
  }: {
    props: TreeProps,
    recurse: (val: unknown, outerKey: string) => JSX.Element,
    onClickNodeKey: (key: string) => (event: MouseEvent) => void,
    outerKey: string,
    index: number,
    item: unknown,
    notLast: boolean,
    isTopLevel: boolean,
    key?: string,
  }
) => {
  const itemIsArray = is.array(item);
  const itemIsNonArrayObject = is.nonArrayObject(item);
  const isObject = key !== undefined;
  const keyConcat = isObject
    ? isTopLevel ? key.toString() : `${outerKey.toString()}.${key.toString()}`
    : isTopLevel ? index.toString() : `${outerKey}.${index}`;
  const isUnchanged = props.unchanged.includes(keyConcat);
  const isContracted = props.contractedKeys.includes(keyConcat);
  const isEmpty = itemIsArray ? !item.length : itemIsNonArrayObject ? !Object.keys(item).length : false;
  const hideUnchanged = isUnchanged && props.hideUnchanged;
  const showActionType = isTopLevel && !!props.actionType;
  return (
    <Frag
      key={index}
      children={
        (itemIsArray || itemIsNonArrayObject) ? (
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
              showIf={!hideUnchanged}
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
              children={recurse(item, keyConcat)}
              showIf={!isContracted && !isEmpty && !hideUnchanged}
              $unchanged={isUnchanged}
              $block={true}
              $indent={true}
            />
            <Node
              $type={itemIsArray ? `array` : `object`}
              children={itemIsArray ? `]` : `}`}
              $unchanged={isUnchanged}
              showIf={!hideUnchanged}
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
        ) : (
          <Node
            $block={true}
            $unchanged={isUnchanged}
            showIf={!(isUnchanged && props.hideUnchanged)}
            children={
              <>
                <Node
                  $type={`key`}
                  children={key}
                  showIf={isObject && !isTopLevel && !hideUnchanged}
                  $unchanged={isUnchanged}
                  $clickable={true}
                  onClick={onClickNodeKey(keyConcat)}
                />
                <Node
                  $type={`colon`}
                  children={`:`}
                  showIf={isObject && !isTopLevel && !hideUnchanged}
                  $unchanged={isUnchanged}
                />
                {recurse(item, keyConcat)}
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
    />
  )
}

const renderPrimitive = (
  {
    props,
    el,
    unchanged,
    outerKey
  }: {
    props: TreeProps,
    el: JSX.Element,
    unchanged: boolean,
    outerKey: string
  }
) => {
  const isTopLevel = outerKey === '';
  const isUnChangedAndHidden = unchanged && props.hideUnchanged;
  const element = (
    <Node
      $unchanged={unchanged}
      children={el}
    />
  );
  return (isTopLevel && props.actionType) ? (
    <Node
      $unchanged={unchanged}
      children={
        <>
          <Node
            children={props.actionType}
          />
          <Node
            $type={`parenthesis`}
            children={`(`}
          />
          <Frag
            showIf={!isUnChangedAndHidden}
            children={element}
          />
          <Node
            $type={`parenthesis`}
            children={`)`}
          />
        </>
      }
    />
  ) : (
    element
  );
}
