import { Fragment, MouseEvent } from "react";
import { Frag } from "../html/frag";
import { is } from "../shared/functions";
import { ActionTypeClose, ActionTypeClosed, ActionTypeOpen, Arr, ArrClose, ArrElement, ArrEmpty, ArrOpen, Boo, Colon, Comma, Dat, Highlightable, Key, Nul, Num, Obj, ObjClose, ObjEmpty, ObjOpen, Row, RowContracted, Str, Und, Value } from "./styles";



export const getStateAsJsx = (props: { state: unknown, onClickNodeKey: (key: string) => void, contractedKeys: string[], actionType?: string, highlights: string[] }): JSX.Element => {
  const onClickNodeKey = (key: string) => (event: MouseEvent) => {
    event.stopPropagation();
    props.onClickNodeKey(key);
  }
  const recurse = <S extends Record<string, unknown> | unknown>(val: S, outerKey: string): JSX.Element => {
    const isTopLevel = outerKey === '';
    const thing = (el: JSX.Element) => {
      const element = (
        <Highlightable
          $highlight={props.highlights.includes(outerKey)}
          children={el}
        />
      );
      return (isTopLevel && props.actionType) ? (
        <ActionTypeOpen
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
      return thing(<Und />);
    } else if (is.null(val)) {
      return thing(<Nul children='null' />);
    } else if (is.string(val)) {
      return thing(<Str children={`"${val}"`} />);
    } else if (is.number(val)) {
      return thing(<Num children={val.toString()} />);
    } else if (is.boolean(val)) {
      return thing(<Boo children={val.toString()} />);
    } else if (is.date(val)) {
      return thing(<Dat children={val.toString()} />);
    } else if (is.array(val)) {
      return (
        <>
          {val.map((ss, index) => {
            const isTopLevel = false; /////////
            const keyConcat = isTopLevel ? index.toString() : `${outerKey}.${index}`;
            const possibleComma = index === val.length - 1 ? <></> : <Comma />;
            return (
              <ArrElement
                key={index}
                children={
                  is.array(ss) ? (
                    <>
                      <RowContracted
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
                            <ArrOpen onClick={onClickNodeKey(keyConcat)} />
                            <Value children={recurse(ss, keyConcat)} />
                            <ArrClose />
                            {possibleComma}
                          </>
                        }
                      />
                    </>

                  ) : is.nonArrayObject(ss) ? (
                    <>
                      <RowContracted
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
                              onClick={onClickNodeKey(keyConcat)}
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
    } else if (is.nonArrayObject(val)) {
      const objectKeys = Object.keys(val) as Array<keyof S>;
      return (
        <>
          {objectKeys.map((key, index) => {
            const isTopLevel = key === ''; /////////
            const keyConcat = isTopLevel ? key.toString() : `${outerKey.toString()}.${key.toString()}`;
            const possibleComma = index === objectKeys.length - 1 ? <></> : <Comma />;
            return (
              <Fragment
                key={index}
                children={
                  is.array(val[key]) ? (
                    <Arr
                      children={
                        <>
                          <RowContracted
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
