import { MouseEvent } from "react";
import { Frag } from "../html/frag";
import { dateToISOLikeButLocal, is, silentlyApplyStateAction } from "../shared/functions";
import { TreeProps } from "./constants";
import { Node } from "./styles";
import './date-picker';
import { DatePicker } from "./date-picker";
import { CompactInput } from "./compact-input";


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
            key
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
  const nodeType
    = is.array(item) ? 'array'
      : is.record(item) ? 'object'
        : is.number(item) ? `number`
          : is.string(item) ? `string`
            : is.boolean(item) ? `boolean`
              : is.date(item) ? `date`
                : is.null(item) ? `null`
                  : is.undefined(item) ? `undefined`
                    : `object`;
  const nodeContent
    = is.number(item) ? textNode(item, keyConcat, store, 'number')
      : is.string(item) ? textNode(item, keyConcat, store, 'text')
        : is.boolean(item) ? booleanNode(item, keyConcat, store)
          : is.date(item) ? dateNode(item, keyConcat, store)
            : is.null(item) ? textNode(item, keyConcat, store, 'text')
              : is.undefined(item) ? ''
                : recurse(item, keyConcat);
  const content = (
    <>
      <Node
        $type={nodeType}
        children={nodeContent}
        showIf={!isContracted && !isEmpty && !isHidden}
        $unchanged={isUnchanged}
        $block={!isPrimitive}
        $indent={!isPrimitive}
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

const textNode = <Type extends string | number | null>(item: Type, key: string, store: TreeProps['store'], type: 'text' | 'number') => {
  if (!store) { return item === null ? 'null' : type === 'text' ? `"${item}"` : item; }
  return (
    <CompactInput
      value={item ?? 'null'}
      type={type}
      onChange={function onChangeInputNode(e) {
        const keyRev = key.split('.').filter(e => !!e).map(e => !isNaN(e as unknown as number) ? `$at(${e})` : e).join('.');
        silentlyApplyStateAction(store, `${keyRev}.$set(${e})`);
      }} 
    />
  )
}

const dateNode = (item: Date, key: string, store: TreeProps['store']) => {
  if (!store) { return dateToISOLikeButLocal(item); }
  return (
    <DatePicker
      value={item}
      onChange={function onChangeDateNode(e) {
        silentlyApplyStateAction(store, `${key.substring(1)}.$set(${dateToISOLikeButLocal(e)})`);
      }} 
    />
  )
}

const booleanNode = (item: boolean, key: string, store: TreeProps['store']) => {
  if (!store) { return item.toString(); }
  return (
    <select
      value={item.toString()}
      onChange={e => silentlyApplyStateAction(store, `${key.substring(1)}.$set(${e.target.value})`)}
      children={
        <>
          <option value='true' children='true' />
          <option value='false' children='false' />
        </>
      }
    />
  )
}

