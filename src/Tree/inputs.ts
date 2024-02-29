import { useForwardedRef } from "../shared/functions";
import { TreeProps } from "./constants";

export const useInputs = (props: TreeProps, ref: React.ForwardedRef<HTMLPreElement>) => {
  const containerRef = useForwardedRef<HTMLPreElement>(ref);
  if (props.selected) {
    return {
      data: props.selected,
      containerRef,
    };
  }
  return {
    containerRef,
    data: beautifyJson(props.state),
  }
}

const beautifyJson = (object: unknown) => {
  if (!object) { return ''; }
  return JSON.stringify(object, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}
