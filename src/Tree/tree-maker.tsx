import { Fragment, MouseEvent } from "react";
import { Frag } from "../html/frag";
import { is } from "../shared/functions";
import { ActionTypeClose, ActionTypeClosed, ActionTypeOpen, Arr, ArrClose, ArrElement, ArrEmpty, ArrOpen, Boo, Colon, Comma, Dat, Prim, Key, Nul, Num, Obj, ObjClose, ObjEmpty, ObjOpen, Row, RowContracted, Str, Und, Value } from "./styles";



export const getStateAsJsx = (props: { state: unknown, onClickNodeKey: (key: string) => void, contractedKeys: string[], actionType?: string, unchanged: string[] }): JSX.Element => {
  const onClickNodeKey = (key: string) => (event: MouseEvent) => {
    event.stopPropagation();
    props.onClickNodeKey(key);
  }
  const recurse = <S extends Record<string, unknown> | unknown>(val: S, outerKey: string): JSX.Element => {
    const isTopLevel = outerKey === '';
    const primitive = (el: JSX.Element) => {
      const element = (
        <Prim
          $unchanged={props.unchanged.includes(outerKey)}
          children={el}
        />
      );
      return (isTopLevel && props.actionType) ? (
        <Prim
          $unchanged={props.unchanged.includes(outerKey)}
          children={
            <>
              <span children={`${props.actionType}(`} />
              {element}
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
      return primitive(<Dat children={val.toString()} />);
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
                      <RowContracted
                        $unchanged={unchanged}
                        showIf={props.contractedKeys.includes(keyConcat)}
                        onClick={onClickNodeKey(keyConcat)}
                        children={
                          <>
                            <ArrEmpty />
                            {possibleComma}
                          </>
                        }
                      />
                      <Frag
                        showIf={!props.contractedKeys.includes(keyConcat)}
                        children={
                          <>
                            <ArrOpen $unchanged={unchanged} onClick={onClickNodeKey(keyConcat)} />
                            <Value children={recurse(ss, keyConcat)} />
                            <ArrClose $unchanged={unchanged} />
                            {possibleComma}
                          </>
                        }
                      />
                    </>

                  ) : is.nonArrayObject(ss) ? (
                    <>
                      <RowContracted
                        $unchanged={unchanged}
                        showIf={props.contractedKeys.includes(keyConcat)}
                        onClick={onClickNodeKey(keyConcat)}
                        children={
                          <>
                            <ObjEmpty />
                            {possibleComma}
                          </>
                        }
                      />
                      <Frag
                        showIf={!props.contractedKeys.includes(keyConcat)}
                        children={
                          <>
                            <Row
                              $unchanged={unchanged}
                              onClick={onClickNodeKey(keyConcat)}
                              children={<ObjOpen />}
                            />
                            <Value children={recurse(ss, keyConcat)} />
                            <Row
                              $unchanged={unchanged}
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
            return (
              <Fragment
                key={index}
                children={
                  is.array(val[key]) ? (
                    <Arr
                      children={
                        <>
                          <RowContracted
                            $unchanged={unchanged}
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
                          <Frag
                            showIf={!props.contractedKeys.includes(keyConcat)}
                            children={
                              <>
                                <Row
                                  $unchanged={unchanged}
                                  onClick={onClickNodeKey(keyConcat)}
                                  children={
                                    <>
                                      <Key showIf={!isTopLevel} children={key.toString()} />
                                      <Colon showIf={!isTopLevel} />
                                      {(isTopLevel && props.actionType) ? <ActionTypeOpen children={`${props.actionType}([`} /> : <ArrOpen />}
                                    </>
                                  }
                                />
                                <Value children={recurse(val[key], keyConcat)} />
                                <Row
                                  $unchanged={unchanged}
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
                  ) : is.nonArrayObject(val[key]) ? (
                    <Obj
                      children={
                        <>
                          <RowContracted
                            $unchanged={unchanged}
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
                          <Frag
                            showIf={!props.contractedKeys.includes(keyConcat)}
                            children={
                              <>
                                <Row
                                  $unchanged={unchanged}
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
  return recurse( is.objectOrArray(props.state) ? { '': props.state } : props.state, '');
}
