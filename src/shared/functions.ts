import React from "react";

export const usePropsWithoutFunctions = <P extends Record<string, unknown>>(props: P) => {
  return React.useRef(() => {
    return (Object.keys(props) as Array<keyof P>)
      .filter(key => typeof (props[key]) !== 'function')
      .reduce((prev, curr) => ({ ...prev, [curr]: props[curr] }), {} as {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key in keyof P as P[key] extends (...args: any[]) => unknown ? never : key]: P[key]
      });
  }).current;
}
