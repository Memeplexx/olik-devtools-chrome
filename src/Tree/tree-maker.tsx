import { Fragment } from "react";
import { Arr, ArrElement, Boolean, CloseArray, CloseObject, Colon, Comma, Dat, Key, Null, Number, Obj, OpenArray, OpenObject, Row, String, Value } from "./styles";


const isNonArrayObject = (val: unknown): val is Record<string, unknown> => {
  return typeof (val) === 'object' && val !== null && !Array.isArray(val);
}

const isArray = (val: unknown): val is Array<unknown> => {
  return Array.isArray(val);
}

export const useStateAsJsx = (props: { state: unknown }): JSX.Element => {
  const onClickObjectKey = () => {

  }
  const recurse = <S extends Record<string, unknown> | unknown>(val: S): JSX.Element => {
    if (val === undefined) {
      throw new Error();
    }
    if (isArray(val)) {
      return (
        <>
          {val.map((ss, index) => {
            const possibleComma = index === val.length - 1 ? <></> : <Comma />;
            return (
              <ArrElement
                key={index}
                children={
                  Array.isArray(ss) ? (
                    <>
                      <OpenArray />
                      <Value children={recurse(ss)} />
                      <CloseArray />
                      {possibleComma}
                    </>
                  ) : (typeof (ss) === 'object' && ss !== null) ? (
                    <>
                      <Row
                        children={<OpenObject />}
                      />
                      <Value
                        children={recurse(ss)}
                      />
                      <Row
                        children={
                          <>
                            <CloseObject />
                            {possibleComma}
                          </>
                        }
                      />
                    </>
                  ) : (
                    <Row
                      children={
                        <>
                          {recurse(ss)}
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
            const possibleComma = index === objectKeys.length - 1 ? <></> : <Comma />;
            return (
              <Fragment
                key={index}
                children={
                  Array.isArray(val[key]) ? (
                    <Arr
                      children={
                        <>
                          <Row
                            children={
                              <>
                                <Key children={key.toString()} />
                                <Colon />
                                <OpenArray />
                              </>
                            }
                          />
                          <Value
                            children={recurse(val[key])}
                          />
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
                  ) : (typeof (val[key]) === 'object' && val[key] !== null) ? (
                    <Obj
                      children={
                        <>
                          <Row
                            children={
                              <>
                                <Key children={key.toString()} onClick={() => onClickObjectKey()} />
                                <Colon />
                                <OpenObject />
                                <div>...</div>
                              </>
                            }
                          />
                          <Value
                            children={recurse(val[key])}
                          />
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
                  ) : (
                    <Row
                      children={
                        <>
                          <Key children={key.toString()} />
                          <Colon />
                          {recurse(val[key])}
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
  if (isArray(props.state)) {
    return (
      <Arr
        children={
          <>
            <OpenArray />
            <Value
              children={recurse(props.state)}
            />
            <CloseArray />
          </>
        }
      />
    )
  } else if (isNonArrayObject(props.state)) {
    return (
      <Obj
        children={
          <>
            <Row
              children={<OpenObject />}
            />
            <Value
              children={recurse(props.state)}
            />
            <Row
              children={<CloseObject />}
            />
          </>
        }
      />
    )
  } else {
    return renderPrimitive(props.state);
  }
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