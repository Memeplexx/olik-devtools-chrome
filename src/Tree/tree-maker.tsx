import { Fragment } from "react";
import { Arr, ArrElement, Boolean, CloseArray, CloseObject, Colon, Comma, Dat, EmptyArray, EmptyObject, Key, Null, Number, Obj, OpenArray, OpenObject, Row, RowContracted, String, Value } from "./styles";
import { Frag } from "../html";


const isNonArrayObject = (val: unknown): val is Record<string, unknown> => {
  return typeof (val) === 'object' && val !== null && !Array.isArray(val);
}

const isArray = (val: unknown): val is Array<unknown> => {
  return Array.isArray(val);
}

export const getStateAsJsx = (props: { state: unknown, onClickNodeKey: (key: string) => void, contractedKeys: string[] }): JSX.Element => {
  const recurse = <S extends Record<string, unknown> | unknown>(val: S, outerKey: string): JSX.Element => {
    if (val === undefined) {
      throw new Error();
    }
    if (isArray(val)) {
      return (
        <>
          {val.map((ss, index) => {
            const keyConcat = outerKey === '' ? index.toString() : `${outerKey}.${index}`;
            const possibleComma = index === val.length - 1 ? <></> : <Comma />;
            return (
              <ArrElement
                key={index}
                children={
                  isArray(ss) ? (
                    <>
                      <RowContracted
                        showIf={props.contractedKeys.includes(keyConcat)}
                        onClick={() => props.onClickNodeKey(keyConcat)}
                        children={
                          <>
                            <EmptyArray />
                            {possibleComma}
                          </>
                        }
                      />
                      <Frag
                        showIf={!props.contractedKeys.includes(keyConcat)}
                        children={
                          <>
                            <OpenArray onClick={() => props.onClickNodeKey(keyConcat)} />
                            <Value children={recurse(ss, keyConcat)} />
                            <CloseArray />
                            {possibleComma}
                          </>
                        }
                      />
                    </>

                  ) : isNonArrayObject(ss) ? (
                    <>
                      <RowContracted
                        showIf={props.contractedKeys.includes(keyConcat)}
                        onClick={() => props.onClickNodeKey(keyConcat)}
                        children={
                          <>
                            <EmptyObject />
                            {possibleComma}
                          </>
                        }
                      />
                      <Frag
                        showIf={!props.contractedKeys.includes(keyConcat)}
                        children={
                          <>
                            <Row
                              onClick={() => props.onClickNodeKey(keyConcat)}
                              children={<OpenObject />}
                            />
                            <Value children={recurse(ss, keyConcat)} />
                            <Row
                              children={
                                <>
                                  <CloseObject />
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
    } else if (isNonArrayObject(val)) {
      const objectKeys = Object.keys(val) as Array<keyof S>;
      return (
        <>
          {objectKeys.map((key, index) => {
            const keyConcat = outerKey === '' ? key.toString() : `${outerKey.toString()}.${key.toString()}`;
            const possibleComma = index === objectKeys.length - 1 ? <></> : <Comma />;
            return (
              <Fragment
                key={index}
                children={
                  isArray(val[key]) ? (
                    <Arr
                      children={
                        <>
                          <RowContracted
                            showIf={props.contractedKeys.includes(keyConcat)}
                            onClick={() => props.onClickNodeKey(keyConcat)}
                            children={
                              <>
                                <Key showIf={!!outerKey} children={key.toString()} />
                                <Colon showIf={!!outerKey} />
                                <EmptyArray />
                              </>
                            }
                          />
                          <Frag
                            showIf={!props.contractedKeys.includes(keyConcat)}
                            children={
                              <>
                                <Row
                                  onClick={() => props.onClickNodeKey(keyConcat)}
                                  children={
                                    <>
                                      <Key showIf={!!outerKey} children={key.toString()}/>
                                      <Colon showIf={!!outerKey} />
                                      <OpenArray />
                                    </>
                                  }
                                />
                                <Value children={recurse(val[key], keyConcat)} />
                                <Row
                                  children={
                                    <>
                                      <CloseArray />
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
                  ) : isNonArrayObject(val[key]) ? (
                    <Obj
                      children={
                        <>
                          <RowContracted
                            showIf={props.contractedKeys.includes(keyConcat)}
                            onClick={() => props.onClickNodeKey(keyConcat)}
                            children={
                              <>
                                <Key showIf={!!outerKey} children={key.toString()} />
                                <Colon showIf={!!outerKey} />
                                <EmptyObject />
                                {possibleComma}
                              </>
                            }
                          />
                          <Frag
                            showIf={!props.contractedKeys.includes(keyConcat)}
                            children={
                              <>
                                <Row
                                  onClick={() => props.onClickNodeKey(keyConcat)}
                                  children={
                                    <>
                                      <Key showIf={!!outerKey} children={key.toString()} />
                                      <Colon showIf={!!outerKey} />
                                      <OpenObject />
                                    </>
                                  }
                                />
                                <Value children={recurse(val[key], keyConcat)} />
                                <Row
                                  children={
                                    <>
                                      <CloseObject />
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
      return renderPrimitive(val);
    }
  };
  const sRev = isArray(props.state) ? [ props.state ] : isNonArrayObject(props.state) ? { k: props.state } : props.state;
  return recurse(sRev, '');
}

const renderPrimitive = <S extends Record<string, unknown> | unknown>(val: S): JSX.Element => {
  if (val === null) {
    return <Null />;
  } else if (typeof (val) === 'string') {
    return <String children={`"${val}"`} />;
  } else if (typeof (val) === 'number') {
    return <Number children={val.toString()} />;
  } else if (typeof (val) === 'boolean') {
    return <Boolean children={val.toString()} />;
  } else if (val instanceof Date) {
    return <Dat children={val.toString()} />;
  } else {
    throw new Error();
  }
}