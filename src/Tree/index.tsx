import { MouseEvent } from "react";
import { Frag } from "../html/frag";
import { is } from "../shared/functions";
import { Boo, Dat, Nul, Num, Con, Str, Und, Act, Key, Col, Par, Com, ArrObj } from "./styles";
import { TreeProps } from "./constants";



export const getStateAsJsx = (
  props: TreeProps
): JSX.Element => {
  const onClickNodeKey = (key: string) => (event: MouseEvent) => {
    event.stopPropagation();
    props.onClickNodeKey(key);
  }
  const recurse = <S extends Record<string, unknown> | unknown>(val: S, outerKey: string): JSX.Element => {
    const unchanged = props.unchanged.includes(outerKey);
    const remainingProps = { props, unchanged, outerKey };
    if (is.undefined(val)) {
      return primitive({ ...remainingProps, el: <Und /> });
    } else if (is.null(val)) {
      return primitive({ ...remainingProps, el: <Nul children='null' /> });
    } else if (is.string(val)) {
      return primitive({ ...remainingProps, el: <Str children={`"${val}"`} /> });
    } else if (is.number(val)) {
      return primitive({ ...remainingProps, el: <Num children={val.toString()} /> });
    } else if (is.boolean(val)) {
      return primitive({ ...remainingProps, el: <Boo children={val.toString()} /> });
    } else if (is.date(val)) {
      return primitive({ ...remainingProps, el: <Dat children={val.toISOString()} /> });
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
  return (
    <Frag
      key={index}
      children={
        (itemIsArray || itemIsNonArrayObject) ? (
          <>
            <Act
              children={props.actionType}
              showIf={isTopLevel && !!props.actionType}
              $unchanged={isUnchanged}
              $clickable={true}
              onClick={onClickNodeKey(keyConcat)}
            />
            <Par
              children={`(`}
              showIf={isTopLevel && !!props.actionType}
              $unchanged={isUnchanged}
              $clickable={true}
              onClick={onClickNodeKey(keyConcat)}
            />
            <Key
              children={key?.toString()}
              $unchanged={isUnchanged}
              showIf={isObject && !isTopLevel && !hideUnchanged}
              $clickable={true}
              onClick={onClickNodeKey(keyConcat)}
            />
            <Col
              children={`:`}
              $unchanged={isUnchanged}
              showIf={isObject && !isTopLevel && !hideUnchanged}
            />
            <ArrObj
              children={itemIsArray ? `[` : `{`}
              $type={itemIsArray ? 'array' : 'object'}
              $unchanged={isUnchanged}
              $clickable={true}
              onClick={onClickNodeKey(keyConcat)}
              showIf={!hideUnchanged}
            />
            <ArrObj
              children={`...`}
              $type={itemIsArray ? 'array' : 'object'}
              showIf={isContracted && !hideUnchanged}
              $unchanged={isUnchanged}
              $clickable={true}
              onClick={onClickNodeKey(keyConcat)}
            />
            <Con
              children={recurse(item, keyConcat)}
              showIf={!isContracted && !isEmpty && !hideUnchanged}
              $unchanged={isUnchanged}
              $block={true}
              $indent={true}
            />
            <ArrObj
              children={itemIsArray ? `]` : `}`}
              $type={itemIsArray ? 'array' : 'object'}
              $unchanged={isUnchanged}
              showIf={!hideUnchanged}
            />
            <Par
              children={`)`}
              showIf={isTopLevel && !!props.actionType}
              $unchanged={isUnchanged}
            />
            <Com
              children={`,`}
              showIf={notLast && !hideUnchanged}
              $unchanged={isUnchanged}
            />
          </>
        ) : (
          <Con
            $block={true}
            $unchanged={isUnchanged}
            showIf={!(isUnchanged && props.hideUnchanged)}
            children={
              <>
                <Key
                  children={key?.toString()}
                  showIf={isObject && !isTopLevel && !hideUnchanged}
                  $unchanged={isUnchanged}
                  $clickable={true}
                  onClick={onClickNodeKey(keyConcat)}
                />
                <Col
                  children={`:`}
                  showIf={isObject && !isTopLevel && !hideUnchanged}
                  $unchanged={isUnchanged}
                />
                {recurse(item, keyConcat)}
                <Com
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

const primitive = (
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
    <Con
      $unchanged={unchanged}
      children={el}
    />
  );
  return (isTopLevel && props.actionType) ? (
    <Con
      $unchanged={unchanged}
      children={
        <>
          <Act
            children={props.actionType}
          />
          <Par
            children={`(`}
          />
          <Frag
            showIf={!isUnChangedAndHidden}
            children={element}
          />
          <Par
            children={`)`}
          />
        </>
      }
    />
  ) : (
    element
  );
}
