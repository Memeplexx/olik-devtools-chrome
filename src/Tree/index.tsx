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
          {val.map((ss, index) => {
            const isTopLevel = false;
            const keyConcat = isTopLevel ? index.toString() : `${outerKey}.${index}`;
            const possibleComma = index === val.length - 1 ? <></> : <Comma />;
            const unchanged = props.unchanged.includes(keyConcat);
            return (
              <ArrElement
                key={index}
                children={
                  is.array(ss) ? (
                    <>
                      <RowUnchanged
                        showIf={isTopLevel && !!props.actionType && props.hideUnchanged && unchanged}
                        children={`${props.actionType!}([])`}
                      />
                      <RowContracted
                        $unchanged={unchanged}
                        $hideUnchanged={props.hideUnchanged}
                        showIf={props.contractedKeys.includes(keyConcat)}
                        onClick={onClickNodeKey(keyConcat)}
                        children={
                          <>
                            <ArrEmpty />
                            {possibleComma}
                          </>
                        }
                      />
                      <RowEmpty
                        showIf={isTopLevel && !!props.actionType && !props.contractedKeys.includes(keyConcat) && !ss.length}
                        children={`${props.actionType!}([])`}
                      />
                      <ArrEmpty
                        showIf={!isTopLevel && !props.actionType && !props.contractedKeys.includes(keyConcat) && !ss.length}
                      />
                      <Frag
                        showIf={!props.contractedKeys.includes(keyConcat) && !!ss.length}
                        children={
                          <>
                            <ArrOpen
                              $unchanged={unchanged}
                              $hideUnchanged={props.hideUnchanged}
                              onClick={onClickNodeKey(keyConcat)}
                            />
                            <Value children={recurse(ss, keyConcat)} />
                            <ArrClose
                              $unchanged={unchanged}
                              $hideUnchanged={props.hideUnchanged}
                            />
                            {possibleComma}
                          </>
                        }
                      />
                    </>

                  ) : is.nonArrayObject(ss) ? (
                    <>
                      <RowUnchanged
                        showIf={isTopLevel && !!props.actionType && props.hideUnchanged && unchanged}
                        children={`${props.actionType!}({})`}
                      />
                      <RowContracted
                        $unchanged={unchanged}
                        $hideUnchanged={props.hideUnchanged}
                        showIf={props.contractedKeys.includes(keyConcat)}
                        onClick={onClickNodeKey(keyConcat)}
                        children={
                          <>
                            <ObjEmpty />
                            {possibleComma}
                          </>
                        }
                      />
                      <RowEmpty
                        showIf={isTopLevel && !!props.actionType && !props.contractedKeys.includes(keyConcat) && !Object.keys(ss).length}
                        children={`${props.actionType!}({})`}
                      />
                      <ObjEmpty
                        showIf={!isTopLevel && !props.actionType && !props.contractedKeys.includes(keyConcat) && !Object.keys(ss).length}
                      />
                      <Frag
                        showIf={!props.contractedKeys.includes(keyConcat) && !!Object.keys(ss).length}
                        children={
                          <>
                            <Row
                              $unchanged={unchanged}
                              $hideUnchanged={props.hideUnchanged}
                              onClick={onClickNodeKey(keyConcat)}
                              children={<ObjOpen />}
                            />
                            <Value children={recurse(ss, keyConcat)} />
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
                          {recurse(ss, keyConcat)}
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
            const ss = val[key];
            return (
              <Fragment
                key={index}
                children={
                  is.array(ss) ? (
                    <Arr
                      children={
                        <>
                          <RowUnchanged
                            showIf={isTopLevel && !!props.actionType && props.hideUnchanged && unchanged}
                            children={`${props.actionType!}([])`}
                          />
                          <RowContracted
                            $unchanged={unchanged}
                            $hideUnchanged={props.hideUnchanged}
                            showIf={props.contractedKeys.includes(keyConcat)}
                            onClick={onClickNodeKey(keyConcat)}
                            children={
                              <>
                                <Key showIf={!isTopLevel} children={key.toString()} />
                                <Colon showIf={!isTopLevel} />
                                {(isTopLevel && props.actionType) ? <ActionTypeOpen children={`${props.actionType}([...])`} /> : <ArrEmpty />}
                              </>
                            }
                          />
                          <RowEmpty
                            showIf={isTopLevel && !!props.actionType && !props.contractedKeys.includes(keyConcat) && !ss.length}
                            children={`${props.actionType!}([])`}
                          />
                          <ArrEmpty
                            showIf={!isTopLevel && !props.actionType && !props.contractedKeys.includes(keyConcat) && !ss.length}
                          />
                          <Frag
                            showIf={!props.contractedKeys.includes(keyConcat) && !!ss.length}
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
                                      {(isTopLevel && props.actionType) ? <ActionTypeOpen children={`${props.actionType}([`} /> : <ArrOpen />}
                                    </>
                                  }
                                />
                                <Value children={recurse(ss, keyConcat)} />
                                <Row
                                  $unchanged={unchanged}
                                  $hideUnchanged={props.hideUnchanged}
                                  children={
                                    <>
                                      {(isTopLevel && props.actionType) ? <ActionTypeClose children='])' /> : <ArrClose />}
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
                  ) : is.nonArrayObject(ss) ? (
                    <Obj
                      children={
                        <>
                          <RowUnchanged
                            showIf={isTopLevel && !!props.actionType && props.hideUnchanged && unchanged}
                            children={`${props.actionType!}({})`}
                          />
                          <RowContracted
                            $unchanged={unchanged}
                            $hideUnchanged={props.hideUnchanged}
                            showIf={props.contractedKeys.includes(keyConcat)}
                            onClick={onClickNodeKey(keyConcat)}
                            children={
                              <>
                                <Key showIf={!isTopLevel} children={key.toString()} />
                                <Colon showIf={!isTopLevel} />
                                {(isTopLevel && props.actionType) ? <ActionTypeClosed children={`${props.actionType}({...})`} /> : <ObjEmpty />}
                                {possibleComma}
                              </>
                            }
                          />
                          <RowEmpty
                            showIf={isTopLevel && !!props.actionType && !props.contractedKeys.includes(keyConcat) && !Object.keys(ss).length}
                            children={`${props.actionType!}({})`}
                          />
                          <ObjEmpty
                            showIf={!isTopLevel && !props.actionType && !props.contractedKeys.includes(keyConcat) && !Object.keys(ss).length}
                          />
                          <Frag
                            showIf={!props.contractedKeys.includes(keyConcat) && !!Object.keys(ss).length}
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
                                      {(isTopLevel && props.actionType) ? <ActionTypeOpen children={`${props.actionType}({`} /> : <ObjOpen />}
                                    </>
                                  }
                                />
                                <Value children={recurse(val[key], keyConcat)} />
                                <Row
                                  $unchanged={unchanged}
                                  $hideUnchanged={props.hideUnchanged}
                                  children={
                                    <>
                                      {(isTopLevel && props.actionType) ? <ActionTypeClose children='})' /> : <ObjClose />}
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
