import React from "react";
import { useForwardedRef } from "../shared/functions";
import { TreeProps } from "./constants";
import { useStateAsJsx } from "./tree-maker";
import { doReadState } from "../app/functions";

export const useInputs = (props: TreeProps, ref: React.ForwardedRef<HTMLDivElement>) => {
  const containerRef = useForwardedRef<HTMLDivElement>(ref);
  // const stateRev = props.query ? doReadState(props.query, props.state || {}) : props.state;
  // console.log(stateRev ?? props.state);
  // const newJsx = getStateAsJsx({ state: stateRev ?? props.state });

  const newJsx = tryReadState(props);


  return {
    containerRef,
    data: newJsx,
  }
}

const tryReadState = (props: { query: string, state: unknown }): JSX.Element => {
  try {
    const stateRev = doReadState(props.query, props.state || {});
    if (stateRev === undefined) {
      throw new Error();
    }
    return useStateAsJsx({ state: stateRev });
  } catch (e) {
    const segs = props.query.split('.').filter(e => !!e);
    segs.pop();
    if (segs.length === 0) {
      return useStateAsJsx({ state: props.state });
    } else {
      return tryReadState({ query: segs.join('.'), state: props.state });
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
