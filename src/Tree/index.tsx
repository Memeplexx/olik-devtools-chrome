import { Fragment, MouseEvent } from "react";
import { Frag } from "../html/frag";
import { is } from "../shared/functions";
import { ActionTypeClose, ActionTypeClosed, ActionTypeOpen, Arr, ArrClose, ArrElement, ArrEmpty, ArrOpen, Boo, Colon, Comma, Dat, Prim, Key, Nul, Num, Obj, ObjClose, ObjEmpty, ObjOpen, Row, RowContracted, Str, Und, Value, RowUnchanged, RowEmpty } from "./styles";
import { TreeProps } from "./constants";



export const getStateAsJsx = (
  props: TreeProps
): JSX.Element => {
  const onClickNodeKey = (key: string) => (event: MouseEvent) => {
    event.stopPropagation();
    props.onClickNodeKey(key);
  }
  const recurse = <S extends Record<string, unknown> | unknown>(val: S, outerKey: string): JSX.Element => {
    const isTopLevel = outerKey === '';
    const unchanged = props.unchanged.includes(outerKey);
    const primitive = (el: JSX.Element) => {
      const element = (
        <Prim
          $unchanged={unchanged}
          children={el}
        />
      );
      return (isTopLevel && props.actionType) ? (
        <Prim
          $unchanged={unchanged}
          children={
            <>
              <span children={`${props.actionType}(`} />
              {props.hideUnchanged && unchanged ? '' : element}
              <span children=')' />
            </>
          }
        />
      ) : (
        element
      );
    }
    if (is.undefined(val)) {
      return primitive(<Und />);
    } else if (is.null(val)) {
      return primitive(<Nul children='null' />);
    } else if (is.string(val)) {
      return primitive(<Str children={`"${val}"`} />);
    } else if (is.number(val)) {
      return primitive(<Num children={val.toString()} />);
    } else if (is.boolean(val)) {
      return primitive(<Boo children={val.toString()} />);
    } else if (is.date(val)) {
      return primitive(<Dat children={val.toISOString()} />);
    } else if (is.array(val)) {
      return (
        <>
          {val.map((item, index) => {
            const isTopLevel = false;
            const keyConcat = isTopLevel ? index.toString() : `${outerKey}.${index}`;
            const possibleComma = index === val.length - 1 ? <></> : <Comma />;
            const unchanged = props.unchanged.includes(keyConcat);
            const itemIsArray = is.array(item);
            const itemIsNonArrayObject = is.nonArrayObject(item);
            const isContracted = props.contractedKeys.includes(keyConcat);
            const hasValues = itemIsArray ? !!item.length : itemIsNonArrayObject ? !!Object.keys(item).length : false;
            const topLevelActionType = isTopLevel && !!props.actionType;
            return (
              <ArrElement
                key={index}
                children={
                  itemIsArray ? (
                    <>
                      <RowUnchanged
                        showIf={topLevelActionType && props.hideUnchanged && unchanged}
                        children={`${props.actionType!}([])`}
                      />
                      <RowContracted
                        $unchanged={unchanged}
                        $hideUnchanged={props.hideUnchanged}
                        showIf={isContracted}
                        onClick={onClickNodeKey(keyConcat)}
                        children={
                          <>
                            <ArrEmpty />
                            {possibleComma}
                          </>
                        }
                      />
                      <RowEmpty
                        showIf={topLevelActionType && !isContracted && !hasValues}
                        children={`${props.actionType!}([])`}
                      />
                      <ArrEmpty
                        showIf={!isTopLevel && !props.actionType && !isContracted && !hasValues}
                      />
                      <Row
                        showIf={!hasValues && !props.hideUnchanged}
                        $unchanged={unchanged}
                        children='[]'
                      />
                      <Frag
                        showIf={!isContracted && hasValues}
                        children={
                          <>
                            <ArrOpen
                              $unchanged={unchanged}
                              $hideUnchanged={props.hideUnchanged}
                              onClick={onClickNodeKey(keyConcat)}
                            />
                            <Value children={recurse(item, keyConcat)} />
                            <ArrClose
                              $unchanged={unchanged}
                              $hideUnchanged={props.hideUnchanged}
                            />
                            {possibleComma}
                          </>
                        }
                      />
                    </>

                  ) : itemIsNonArrayObject ? (
                    <>
                      <RowUnchanged
                        showIf={topLevelActionType && props.hideUnchanged && unchanged}
                        children={`${props.actionType!}({})`}
                      />
                      <RowContracted
                        $unchanged={unchanged}
                        $hideUnchanged={props.hideUnchanged}
                        showIf={isContracted}
                        onClick={onClickNodeKey(keyConcat)}
                        children={
                          <>
                            <ObjEmpty />
                            {possibleComma}
                          </>
                        }
                      />
                      <RowEmpty
                        showIf={topLevelActionType && !isContracted && !hasValues}
                        children={`${props.actionType!}({})`}
                      />
                      <ObjEmpty
                        showIf={!isTopLevel && !props.actionType && !isContracted && !hasValues}
                      />
                      <Row
                        showIf={!hasValues && !props.hideUnchanged}
                        $unchanged={unchanged}
                        children='{}'
                      />
                      <Frag
                        showIf={!isContracted && hasValues}
                        children={
                          <>
                            <Row
                              $unchanged={unchanged}
                              $hideUnchanged={props.hideUnchanged}
                              onClick={onClickNodeKey(keyConcat)}
                              children={<ObjOpen />}
                            />
                            <Value children={recurse(item, keyConcat)} />
                            <Row
                              $unchanged={unchanged}
                              $hideUnchanged={props.hideUnchanged}
                              children={
                                <>
                                  <ObjClose />
                                  {possibleComma}
                                </>
                              }
                            />
                          </>
                        }
                      />
                    </>
                  ) : (
                    <Row
                      $unchanged={unchanged}
                      $hideUnchanged={props.hideUnchanged}
                      children={
                        <>
                          {recurse(item, keyConcat)}
                          {possibleComma}
                        </>
                      }
                    />
                  )
                }
              />
            )
          })}
        </>
      );
    } else if (is.nonArrayObject(val)) {
      const objectKeys = Object.keys(val) as Array<keyof S>;
      return (
        <>
          {objectKeys.map((key, index) => {
            const isTopLevel = key === '';
            const keyConcat = isTopLevel ? key.toString() : `${outerKey.toString()}.${key.toString()}`;
            const possibleComma = index === objectKeys.length - 1 ? <></> : <Comma />;
            const unchanged = props.unchanged.includes(keyConcat);
            const item = val[key];
            const itemIsArray = is.array(item);
            const itemIsNonArrayObject = is.nonArrayObject(item);
            const isContracted = props.contractedKeys.includes(keyConcat);
            const hasValues = itemIsArray ? !!item.length : itemIsNonArrayObject ? !!Object.keys(item).length : false;
            const topLevelActionType = isTopLevel && !!props.actionType;
            return (
              <Fragment
                key={index}
                children={
                  itemIsArray ? (
                    <Arr
                      children={
                        <>
                          <RowUnchanged
                            showIf={topLevelActionType && props.hideUnchanged && unchanged}
                            children={`${props.actionType!}([])`}
                          />
                          <RowContracted
                            $unchanged={unchanged}
                            $hideUnchanged={props.hideUnchanged}
                            showIf={isContracted}
                            onClick={onClickNodeKey(keyConcat)}
                            children={
                              <>
                                <Key showIf={!isTopLevel} children={key.toString()} />
                                <Colon showIf={!isTopLevel} />
                                <ActionTypeOpen showIf={topLevelActionType} children={`${props.actionType!}([...])`} />
                                <ArrEmpty showIf={!topLevelActionType} />
                              </>
                            }
                          />
                          <RowEmpty
                            showIf={topLevelActionType && !isContracted && !hasValues}
                            children={`${props.actionType!}([])`}
                          />
                          <ArrEmpty
                            showIf={!topLevelActionType && !isContracted && !hasValues}
                          />
                          <Row
                            showIf={!hasValues && !props.hideUnchanged}
                            $unchanged={unchanged}
                            children={
                              <>
                                <Key children={key.toString()} />
                                <Colon />
                                <Arr children='[]' />
                              </>
                            }
                          />
                          <Frag
                            showIf={!isContracted && hasValues}
                            children={
                              <>
                                <Row
                                  $unchanged={unchanged}
                                  $hideUnchanged={props.hideUnchanged}
                                  onClick={onClickNodeKey(keyConcat)}
                                  children={
                                    <>
                                      <Key showIf={!isTopLevel} children={key.toString()} />
                                      <Colon showIf={!isTopLevel} />
                                      <ActionTypeOpen showIf={topLevelActionType} children={`${props.actionType!}([`} />
                                      <ArrOpen showIf={!topLevelActionType} />
                                    </>
                                  }
                                />
                                <Value children={recurse(item, keyConcat)} />
                                <Row
                                  $unchanged={unchanged}
                                  $hideUnchanged={props.hideUnchanged}
                                  children={
                                    <>
                                      <ActionTypeClose showIf={topLevelActionType} children='])' />
                                      <ArrClose showIf={!topLevelActionType} />
                                      {possibleComma}
                                    </>
                                  }
                                />
                              </>
                            }
                          />
                        </>
                      }
                    />
                  ) : is.nonArrayObject(item) ? (
                    <Obj
                      children={
                        <>
                          <RowUnchanged
                            showIf={topLevelActionType && props.hideUnchanged && unchanged}
                            children={`${props.actionType!}({})`}
                          />
                          <RowContracted
                            $unchanged={unchanged}
                            $hideUnchanged={props.hideUnchanged}
                            showIf={isContracted}
                            onClick={onClickNodeKey(keyConcat)}
                            children={
                              <>
                                <Key showIf={!isTopLevel} children={key.toString()} />
                                <Colon showIf={!isTopLevel} />
                                <ActionTypeClosed showIf={topLevelActionType} children={`${props.actionType!}({...})`} />
                                <ObjEmpty showIf={!topLevelActionType} />
                                {possibleComma}
                              </>
                            }
                          />
                          <RowEmpty
                            showIf={topLevelActionType && !isContracted && !hasValues}
                            children={`${props.actionType!}({})`}
                          />
                          <ObjEmpty
                            showIf={!topLevelActionType && !isContracted && !hasValues}
                          />
                          <Row
                            showIf={!hasValues && !props.hideUnchanged}
                            $unchanged={unchanged}
                            children={
                              <>
                                <Key children={key.toString()} />
                                <Colon />
                                <Obj children='{}' />
                              </>
                            }
                          />
                          <Frag
                            showIf={!isContracted && hasValues}
                            children={
                              <>
                                <Row
                                  $unchanged={unchanged}
                                  $hideUnchanged={props.hideUnchanged}
                                  onClick={onClickNodeKey(keyConcat)}
                                  children={
                                    <>
                                      <Key showIf={!isTopLevel} children={key.toString()} />
                                      <Colon showIf={!isTopLevel} />
                                      <ActionTypeOpen showIf={topLevelActionType} children={`${props.actionType!}({`} />
                                      <ObjOpen showIf={!topLevelActionType} />
                                    </>
                                  }
                                />
                                <Value children={recurse(val[key], keyConcat)} />
                                <Row
                                  $unchanged={unchanged}
                                  $hideUnchanged={props.hideUnchanged}
                                  children={
                                    <>
                                      <ActionTypeClose showIf={topLevelActionType} children={`})`} />
                                      <ObjClose showIf={!topLevelActionType} />
                                      {possibleComma}
                                    </>
                                  }
                                />
                              </>
                            }
                          />
                        </>
                      }
                    />
                  ) : (
                    <Row
                      $unchanged={unchanged}
                      $hideUnchanged={props.hideUnchanged}
                      children={
                        <>
                          <Key children={key.toString()} />
                          <Colon />
                          {recurse(val[key], keyConcat)}
                          {possibleComma}
                        </>
                      }
                    />
                  )
                }
              />
            );
          })}
        </>
      );
    } else {
      throw new Error(`unhandled type: ${val === undefined ? 'undefined' : val!.toString()}`);
    }
  };
  return recurse(is.objectOrArray(props.state) ? { '': props.state } : props.state, '');
}
