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

const tabSize = 2;

export const getTreeHTML = ({ before, after, depth }: { before: unknown, after: unknown, depth: number }): string => {
  const tabbed = ' '.repeat(depth + tabSize);
	if (['string', 'number', 'boolean'].includes(typeof after)) {
    const className = before === after ? 'untouched' : 'touched';
		return `<span class="${className}">${(after as string | number | boolean).toString()}</span>`;
	} else if (after === null || after === undefined) {
    const className = before === after ? 'untouched' : 'touched';
		return `<span class="${className}">null</span>`;
	} else if (typeof(after) === 'object') {
		if (!Array.isArray(after)) {
			const beforeRecord = before as Record<string, unknown>;
			const afterRecord = after as Record<string, unknown>;
			const allKeys = Array.from(new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)]));
			return '{\n' + allKeys
				.map(key => {
          const className = beforeRecord[key] === afterRecord[key] ? 'untouched' : 'touched';
					return `${tabbed}<span class="${className}">${key}: ${getTreeHTML({ before: beforeRecord[key], after: afterRecord[key], depth: depth + 1 })}</span>`;
				}).join(',\n') + '\n}';
		} else {
			const beforeArray = before === undefined ? [] : before as unknown[];
			const afterArray = after as unknown[];
			const allIndices = Array.from(new Set([...beforeArray.keys(), ...afterArray.keys()]));
			return '[\n' + allIndices
				.map(i => tabbed + getTreeHTML({ before: beforeArray[i], after: afterArray[i], depth: depth + 1 }))
				.join(',\n') + '\n]';
		}
	} else {
		throw new Error();
	}
}