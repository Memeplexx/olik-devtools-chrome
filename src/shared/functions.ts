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

export const useForwardedRef = <T>(forwardedRef: React.ForwardedRef<T>) => {
  const basicRef = React.useRef<T | null>(null);
  const targetRef = React.useRef<T | null>(null)
  const refs = React.useMemo(() => [basicRef, forwardedRef], [forwardedRef]);
  React.useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return
      if (typeof ref === 'function') {
        ref(targetRef.current)
      } else {
        ref.current = targetRef.current
      }
    })
  }, [refs])
  return targetRef
}

const tabSize = 2;

export const getTreeHTML = ({ before, after, depth }: { before: unknown, after: unknown, depth: number }): string => {
	const tabbedBefore = ' '.repeat((depth - 1) * tabSize);
  const tabbedAfter = ' '.repeat(depth * tabSize);
	const className = JSON.stringify(before) === JSON.stringify(after) ? 'untouched' : 'touched';
	if (typeof after === 'string') {
		return `<span class="${className}">"${after}"</span>`;
	} else if (['number', 'boolean'].includes(typeof after)) {
		return `<span class="${className}">${(after as string | number | boolean).toString()}</span>`;
	} else if (after === null || after === undefined) {
		return `<span class="${className}">null</span>`;
	} else if (typeof(after) === 'object') {
		if (!Array.isArray(after)) {
			const beforeRecord = before === undefined ? {} : before as Record<string, unknown>;
			const afterRecord = after as Record<string, unknown>;
			const allKeys = Array.from(new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)]));
			return '{\n' + allKeys
				.map(key => {
          const className = JSON.stringify(beforeRecord[key]) === JSON.stringify(afterRecord[key]) ? 'untouched' : 'touched';
					return `${tabbedAfter}<span class="${className}">${key}: ${getTreeHTML({ before: beforeRecord[key], after: afterRecord[key], depth: depth + 1 })}</span>`;
				}).join(',\n') + `\n${tabbedBefore}}`;
		} else {
			const beforeArray = before === undefined ? [] : before as unknown[];
			const afterArray = after as unknown[];
			const allIndices = Array.from(new Set([...beforeArray.keys(), ...afterArray.keys()]));
			return `[\n` + allIndices
				.map(i => tabbedAfter + getTreeHTML({ before: beforeArray[i], after: afterArray[i], depth: depth + 1 }))
				.join(',\n') + `\n${tabbedBefore}]`;
		}
	} else {
		throw new Error();
	}
}

export const useRecord = <T extends object>(initializeState: T) => {
	const [state, oldSetState] = React.useState(initializeState);
	type NewSetStateAction<T> = Partial<T> | ((prevState: T) => Partial<T>);
	const set = (arg: NewSetStateAction<T>) => {
		if (typeof (arg) === 'function') {
			oldSetState(s => ({ ...s, ...arg(s) }));
		} else[
			oldSetState(s => ({ ...s, ...arg }))
		]
	}
	return { ...state, set } as const;
}