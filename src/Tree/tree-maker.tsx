import { Fragment } from "react";
import { Arr, ArrElement, Boolean, ArrClose, ObjClose, Colon, Comma, Dat, ArrEmpty, ObjEmpty, Key, Nul, Num, Obj, ArrOpen, ObjOpen, Row, RowContracted, Str, Value } from "./styles";
import { Frag } from "../html/frag";


const isNonArrayObject = (val: unknown): val is Record<string, unknown> => {
  return typeof (val) === 'object' && val !== null && !Array.isArray(val);
}

const isArray = (val: unknown): val is Array<unknown> => {
  return Array.isArray(val);
}

export const getStateAsJsx = (props: { state: unknown, onClickNodeKey: (key: string) => void, contractedKeys: string[] }): JSX.Element => {
  const recurse = <S extends Record<string, unknown> | unknown>(val: S, outerKey: string): JSX.Element => {
    if (val === null) {
      return <Nul />;
    } else if (typeof (val) === 'string') {
      return <Str children={`"${val}"`} />;
    } else if (typeof (val) === 'number') {
      return <Num children={val.toString()} />;
    } else if (typeof (val) === 'boolean') {
      return <Boolean children={val.toString()} />;
    } else if (val instanceof Date) {
      return <Dat children={val.toString()} />;
    } else if (isArray(val)) {
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
                            <ArrEmpty />
                            {possibleComma}
                          </>
                        }
                      />
                      <Frag
                        showIf={!props.contractedKeys.includes(keyConcat)}
                        children={
                          <>
                            <ArrOpen onClick={() => props.onClickNodeKey(keyConcat)} />
                            <Value children={recurse(ss, keyConcat)} />
                            <ArrClose />
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
                              onClick={() => props.onClickNodeKey(keyConcat)}
                              children={<ObjOpen />}
                            />
                            <Value children={recurse(ss, keyConcat)} />
                            <Row
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
                                <ArrEmpty />
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
                                      <ArrOpen />
                                    </>
                                  }
                                />
                                <Value children={recurse(val[key], keyConcat)} />
                                <Row
                                  children={
                                    <>
                                      <ArrClose />
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
                                  onClick={() => props.onClickNodeKey(keyConcat)}
                                  children={
                                    <>
                                      <Key showIf={!!outerKey} children={key.toString()} />
                                      <Colon showIf={!!outerKey} />
                                      <ObjOpen />
                                    </>
                                  }
                                />
                                <Value children={recurse(val[key], keyConcat)} />
                                <Row
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
      throw new Error();
    }
  };
  return recurse(isArray(props.state) ? [ props.state ] : isNonArrayObject(props.state) ? { k: props.state } : props.state, '');
}
