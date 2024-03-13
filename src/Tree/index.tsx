import { MouseEvent } from "react";
import { Frag } from "../html/frag";
import { is } from "../shared/functions";
import { Arr, Boo, Dat, Nul, Num, Obj, Con, Str, Und, Act, Key, Col, Par, Com, ArrObj } from "./styles";
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
    const isUnChangedAndHidden = unchanged && props.hideUnchanged;
    const primitive = (el: JSX.Element) => {
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
            const notLast = index !== val.length - 1;
            const unchanged = props.unchanged.includes(keyConcat);
            const itemIsArray = is.array(item);
            const itemIsNonArrayObject = is.nonArrayObject(item);
            const isContracted = props.contractedKeys.includes(keyConcat);
            const hasValues = itemIsArray ? !!item.length : itemIsNonArrayObject ? !!Object.keys(item).length : false;
            const topLevelActionType = isTopLevel && !!props.actionType;
            const isExpandedWithValues = !isContracted && hasValues;
            const isUnChangedAndHidden = unchanged && props.hideUnchanged;
            return (
              <Con
                key={index}
                $unchanged={unchanged}
                children={
                  (itemIsArray || itemIsNonArrayObject) ? (
                    <>
                      <Act
                        children={props.actionType}
                        showIf={topLevelActionType}
                        $unchanged={unchanged}
                        $clickable={true}
                        onClick={onClickNodeKey(keyConcat)}
                      />
                      <Par
                        children={`(`}
                        showIf={topLevelActionType}
                        $unchanged={unchanged}
                        $clickable={true}
                        onClick={onClickNodeKey(keyConcat)}
                      />
                      <ArrObj
                        children={itemIsArray ? `[` : `{`}
                        $type={itemIsArray ? 'array' : 'object'}
                        $unchanged={unchanged}
                        $clickable={true}
                        onClick={onClickNodeKey(keyConcat)}
                      />
                      <ArrObj
                        children={`...`}
                        $type={itemIsArray ? 'array' : 'object'}
                        showIf={isContracted}
                        $unchanged={unchanged}
                        $clickable={true}
                        onClick={onClickNodeKey(keyConcat)}
                      />
                      <Con
                        children={recurse(item, keyConcat)}
                        showIf={!isContracted}
                        $unchanged={unchanged}
                        $block={true}
                        $indent={true}
                      />
                      <ArrObj
                        children={itemIsArray ? `]` : `}`}
                        $type={itemIsArray ? 'array' : 'object'}
                        $unchanged={unchanged}
                      />
                      <Par
                        children={`)`}
                        showIf={topLevelActionType}
                        $unchanged={unchanged}
                      />
                      <Com
                        children={`,`}
                        showIf={notLast}
                      />
                    </>
                  ) : (
                    <Con
                      $block={true}
                      $unchanged={unchanged}
                      showIf={!isUnChangedAndHidden}
                      children={recurse(item, keyConcat)}
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
            const notLast = index !== objectKeys.length - 1;
            const unchanged = props.unchanged.includes(keyConcat);
            const item = val[key];
            const itemIsArray = is.array(item);
            const itemIsNonArrayObject = is.nonArrayObject(item);
            const isContracted = props.contractedKeys.includes(keyConcat);
            const hasValues = itemIsArray ? !!item.length : itemIsNonArrayObject ? !!Object.keys(item).length : false;
            const topLevelActionType = isTopLevel && !!props.actionType;
            const isExpandedWithValues = !isContracted && hasValues;
            const isUnChangedAndHidden = unchanged && props.hideUnchanged;
            return (
              <Frag
                key={index}
                children={
                  itemIsArray ? (
                    <>
                      <Con
                        showIf={topLevelActionType && isUnChangedAndHidden}
                        $unchanged={true}
                        children={
                          <>
                            <Act
                              children={props.actionType}
                            />
                            <Par
                              children={`(`}
                            />
                            <Arr
                              children={`[]`}
                            />
                            <Par
                              children={`)`}
                            />
                            <Com
                              showIf={notLast}
                              children={`,`}
                            />
                          </>
                        }
                      />
                      <Con
                        showIf={isContracted}
                        $unchanged={unchanged}
                        $clickable={true}
                        onClick={onClickNodeKey(keyConcat)}
                        children={
                          <>
                            <Key
                              showIf={!isTopLevel}
                              children={key.toString()}
                            />
                            <Col
                              showIf={!isTopLevel}
                              children={`:`}
                            />
                            <Act
                              showIf={topLevelActionType}
                              children={props.actionType}
                            />
                            <Par
                              showIf={topLevelActionType}
                              children={`(`}
                            />
                            <Arr
                              children={`[...]`}
                            />
                            <Par
                              showIf={topLevelActionType}
                              children={`)`}
                            />
                            <Com
                              showIf={notLast}
                              children={`,`}
                            />
                          </>
                        }
                      />
                      <Con
                        showIf={topLevelActionType && !isContracted && !hasValues}
                        $unchanged={unchanged}
                        children={
                          <>
                            <Act
                              children={props.actionType}
                            />
                            <Par
                              children={`(`}
                            />
                            <Arr
                              children={`[]`}
                            />
                            <Par
                              children={`)`}
                            />
                            <Com
                              showIf={notLast}
                              children={`,`}
                            />
                          </>
                        }
                      />
                      <Con
                        showIf={!topLevelActionType && !isContracted && !hasValues}
                        children={
                          <>
                            <Key
                              children={key.toString()}
                            />
                            <Col
                              children={`:`}
                            />
                            <Arr
                              children={`[]`}
                            />
                            <Com
                              showIf={notLast}
                              children={`,`}
                            />
                          </>
                        }
                      />
                      <Frag
                        showIf={isExpandedWithValues}
                        children={
                          <>
                            <Con
                              showIf={!isUnChangedAndHidden}
                              $unchanged={unchanged}
                              $clickable={true}
                              onClick={onClickNodeKey(keyConcat)}
                              children={
                                <>
                                  <Key
                                    showIf={!isTopLevel}
                                    children={key.toString()}
                                  />
                                  <Col
                                    showIf={!isTopLevel}
                                    children={`:`}
                                  />
                                  <Act
                                    showIf={topLevelActionType}
                                    children={props.actionType}
                                  />
                                  <Par
                                    showIf={topLevelActionType}
                                    children={`(`}
                                  />
                                  <Arr
                                    children={`[`}
                                  />
                                </>
                              }
                            />
                            <Con
                              $block={true}
                              $indent={true}
                              $unchanged={unchanged}
                              children={recurse(item, keyConcat)}
                            />
                            <Arr
                              $unchanged={unchanged}
                              showIf={!isUnChangedAndHidden}
                              children={`]`}
                            />
                            <Com
                              showIf={notLast}
                              children={`,`}
                            />
                          </>
                        }
                      />
                    </>
                  ) : is.nonArrayObject(item) ? (
                    <>
                      <Frag
                        showIf={topLevelActionType && isUnChangedAndHidden}
                        children={
                          <>
                            <Act children={props.actionType} />
                            <Par children={`(`} />
                            <Obj children={`{}`} />
                            <Par children={`)`} />
                          </>
                        }
                      />
                      <Con
                        showIf={isContracted}
                        $unchanged={unchanged}
                        $clickable={true}
                        onClick={onClickNodeKey(keyConcat)}
                        children={
                          <>
                            <Key
                              showIf={!isTopLevel}
                              children={`${key.toString()}: `}
                            />
                            <Act
                              showIf={topLevelActionType}
                              children={props.actionType}
                            />
                            <Par
                              showIf={topLevelActionType}
                              children={`(`}
                            />
                            <Obj
                              children={`{...}`}
                            />
                            <Par
                              showIf={topLevelActionType}
                              children={`)`}
                            />
                          </>
                        }
                      />
                      <Con
                        showIf={topLevelActionType && !isContracted && !hasValues}
                        $unchanged={unchanged}
                        children={
                          <>
                            <Act children={props.actionType} />
                            <Par children={`(`} />
                            <Obj children={`{}`} />
                            <Par children={`)`} />
                          </>
                        }
                      />
                      <Obj
                        showIf={!topLevelActionType && !isContracted && !hasValues}
                        children={`{...}`}
                      />
                      <Con
                        showIf={!hasValues && !props.hideUnchanged}
                        $unchanged={unchanged}
                        children={
                          <>
                            <Key children={key.toString()} />
                            <Col children={`:`} />
                            <Obj children={`{}`} />
                          </>
                        }
                      />
                      <Frag
                        showIf={isExpandedWithValues}
                        children={
                          <>
                            <Con
                              showIf={!isUnChangedAndHidden}
                              $unchanged={unchanged}
                              $clickable={true}
                              onClick={onClickNodeKey(keyConcat)}
                              children={
                                <>
                                  <Key
                                    showIf={!isTopLevel}
                                    children={key.toString()}
                                  />
                                  <Col
                                    showIf={!isTopLevel}
                                    children={`:`}
                                  />
                                  <Act
                                    showIf={topLevelActionType}
                                    children={props.actionType}
                                  />
                                  <Par
                                    showIf={topLevelActionType}
                                    children={`(`}
                                  />
                                  <Obj
                                    children={`{`}
                                  />
                                </>
                              }
                            />
                            <Con
                              $unchanged={unchanged}
                              $block={true}
                              $indent={true}
                              children={recurse(val[key], keyConcat)}
                            />
                            <Con
                              $unchanged={unchanged}
                              showIf={!isUnChangedAndHidden}
                              children={
                                <>
                                  <Obj
                                    children={`}`}
                                  />
                                  <Par
                                    showIf={topLevelActionType}
                                    children={`)`}
                                  />
                                </>
                              }
                            />
                          </>
                        }
                      />
                      <Com
                        showIf={notLast}
                        children={`,`}
                      />
                    </>
                  ) : (
                    <Con
                      $unchanged={unchanged}
                      showIf={!isUnChangedAndHidden}
                      children={
                        <>
                          <Key
                            children={key.toString()}
                          />
                          <Col
                            children={`:`}
                          />
                          {recurse(val[key], keyConcat)}
                          <Com
                            showIf={notLast}
                            children={`,`}
                          />
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


// const renderThing = <S extends Record<string, unknown> | unknown>(
//   props: TreeProps,
//   recurse: (val: S, outerKey: string) => JSX.Element,
//   onClickNodeKey: (key: string) => (event: MouseEvent) => void,
//   outerKey: string,
//   index: number,
//   val: S,
// ) => {
//   const isTopLevel = false;
//   const keyConcat = isTopLevel ? index.toString() : `${outerKey}.${index}`;
//   const notLast = index !== val.length - 1;
//   const unchanged = props.unchanged.includes(keyConcat);
//   const itemIsArray = is.array(item);
//   const itemIsNonArrayObject = is.nonArrayObject(item);
//   const isContracted = props.contractedKeys.includes(keyConcat);
//   const hasValues = itemIsArray ? !!item.length : itemIsNonArrayObject ? !!Object.keys(item).length : false;
//   const topLevelActionType = isTopLevel && !!props.actionType;
//   const isExpandedWithValues = !isContracted && hasValues;
//   const isUnChangedAndHidden = unchanged && props.hideUnchanged;
//   return (
//     <Con
//       key={index}
//       $unchanged={unchanged}
//       children={
//         (itemIsArray || itemIsNonArrayObject) ? (
//           <>
//             <Act
//               children={props.actionType}
//               showIf={topLevelActionType}
//               $unchanged={unchanged}
//               $clickable={true}
//               onClick={onClickNodeKey(keyConcat)}
//             />
//             <Par
//               children={`(`}
//               showIf={topLevelActionType}
//               $unchanged={unchanged}
//               $clickable={true}
//               onClick={onClickNodeKey(keyConcat)}
//             />
//             <ArrObj
//               children={itemIsArray ? `[` : `{`}
//               $type={itemIsArray ? 'array' : 'object'}
//               $unchanged={unchanged}
//               $clickable={true}
//               onClick={onClickNodeKey(keyConcat)}
//             />
//             <ArrObj
//               children={`...`}
//               $type={itemIsArray ? 'array' : 'object'}
//               showIf={isContracted}
//               $unchanged={unchanged}
//               $clickable={true}
//               onClick={onClickNodeKey(keyConcat)}
//             />
//             <Con
//               children={recurse(item, keyConcat)}
//               showIf={!isContracted}
//               $unchanged={unchanged}
//               $block={true}
//               $indent={true}
//             />
//             <ArrObj
//               children={itemIsArray ? `]` : `}`}
//               $type={itemIsArray ? 'array' : 'object'}
//               $unchanged={unchanged}
//             />
//             <Par
//               children={`)`}
//               showIf={topLevelActionType}
//               $unchanged={unchanged}
//             />
//             <Com
//               children={`,`}
//               showIf={notLast}
//             />
//           </>
//         ) : (
//           <Con
//             $block={true}
//             $unchanged={unchanged}
//             showIf={!isUnChangedAndHidden}
//             children={recurse(item, keyConcat)}
//           />
//         )
//       }
//     />
//   )
// }