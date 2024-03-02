import React from "react";
import { useForwardedRef } from "../shared/functions";
import { TreeProps } from "./constants";
import { getStateAsJsx } from "./tree-maker";
import { doReadState } from "../app/functions";

export const useInputs = (props: TreeProps, ref: React.ForwardedRef<HTMLDivElement>) => {
  const containerRef = useForwardedRef<HTMLDivElement>(ref);
  // const stateRev = props.query ? doReadState(props.query, props.state || {}) : props.state;
  // console.log(stateRev ?? props.state);
  // const newJsx = getStateAsJsx({ state: stateRev ?? props.state });

  const [contractedKeys, setContractedKeys] = React.useState(new Array<string>());
  const onClickNodeKey = (key: string) => {
    setContractedKeys(keys => {
      if (keys.includes(key)) {
        return keys.filter(k => k !== key);
      } else {
        return [...keys, key];
      }
    })
  }

  const newJsx = tryReadState({...props, contractedKeys, onClickNodeKey});

 

  return {
    containerRef,
    data: newJsx,
  }
}

const tryReadState = ({ state, contractedKeys, query, onClickNodeKey }: { query: string, contractedKeys: string[], state: unknown, onClickNodeKey: (k: string) => void }): JSX.Element => {
  try {
    const stateRev = doReadState(query, state || {});
    if (stateRev === undefined) {
      throw new Error();
    }
    return getStateAsJsx({ state: stateRev, onClickNodeKey, contractedKeys });
  } catch (e) {
    const segs = query.split('.').filter(e => !!e);
    segs.pop();
    if (segs.length === 0) {
      return getStateAsJsx({ state, onClickNodeKey, contractedKeys });
    } else {
      return tryReadState({ query: segs.join('.'), state, onClickNodeKey, contractedKeys });
    }
  }
};

// const beautifyJson = (object: unknown) => {
//   if (!object) { return ''; }
//   return JSON.stringify(object, null, 2)
//     .replace(/"([^"]+)":/g, '$1:')
//     .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
//     .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
//     let cls = 'number';
//     if (/^"/.test(match)) {
//       if (/:$/.test(match)) {
//         cls = 'key';
//       } else {
//         cls = 'string';
//       }
//     } else if (/true|false/.test(match)) {
//       cls = 'boolean';
//     } else if (/null/.test(match)) {
//       cls = 'null';
//     }
//     return '<span class="' + cls + '">' + match + '</span>';
//   });
// }
