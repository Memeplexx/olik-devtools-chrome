import { useRef, useState } from "react";
import { editor, IDisposable } from 'monaco-editor';
import { EditorProps, editorRefOptions, editorTheme } from "./constants";
import * as olikTypeDefsText from '../../node_modules/olik/dist/type.d.ts?raw';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { is } from "../shared/functions";

const olikTypeDefsAsString = olikTypeDefsText.default.replace(/\n|\r/g, "");

const lineHeight = 18;

export const useInputs = (props: EditorProps) => {
  const localState = useLocalState(props);
  instantiateEditor(localState);
  respondToEditorScrollChanges(localState);
  respondToEditorTextChanges(localState);
  return localState;
}

const useLocalState = (props: EditorProps) => {
  const [state, setState] = useState({
    defaultEditorValue: '',
    divEl: useRef<HTMLDivElement>(null),
    editorRef: useRef<editor.IStandaloneCodeEditor | null>(null),
    onDidScrollChange: null as null | IDisposable,
    onDidChangeModelContent: null as null | IDisposable,
  });
  return { ...state, setState, ...props };
}

const instantiateEditor = (arg: ReturnType<typeof useLocalState>) => {
  if (!arg.divEl.current || arg.editorRef.current || !arg.state) { return; }
  self.MonacoEnvironment = { getWorker: () => new tsWorker() };
  editor.defineTheme('olik-editor-theme', editorTheme);
  arg.editorRef.current = editor.create(arg.divEl.current, editorRefOptions);
  arg.editorRef.current.setScrollPosition({ scrollTop: lineHeight });
  const defaultEditorValue = reGenerateTypeDefinitions(arg);
  arg.editorRef.current.setValue(defaultEditorValue);
}

const reGenerateTypeDefinitions = (arg: ReturnType<typeof useLocalState>) => {
  const collector = { str: `{\n` };
  recurseObject(collector, arg.state!, 1);
  collector.str += '};\n';
  const defaultEditorValue = [olikTypeDefsAsString + `; const store: Store<${collector.str.replace(/\n|\r/g, "")}>;`, 'store.'].join('\n');
  arg.setState(s => ({ ...s, defaultEditorValue }));
  return defaultEditorValue;
}

const respondToEditorScrollChanges = (arg: ReturnType<typeof useLocalState>) => {
  if (!arg.editorRef.current || arg.onDidScrollChange) { return; }
  const onDidScrollChange = arg.editorRef.current.onDidScrollChange(() => {
    if (arg.editorRef.current!.getScrollTop() === lineHeight) { return; }
    arg.editorRef.current!.setScrollPosition({ scrollTop: lineHeight });
    arg.editorRef.current!.setPosition({ lineNumber: 2, column: arg.editorRef.current!.getValue().length + 1 });
  })
  arg.setState(s => ({
    ...s,
    onDidScrollChange
  }));
}

const respondToEditorTextChanges = (arg: ReturnType<typeof useLocalState>) => {
  if (!arg.editorRef.current || arg.onDidChangeModelContent) { return; }
  const onDidChangeModelContent = arg.editorRef.current.onDidChangeModelContent(() => {
    arg.setState(s => {
      const lines = arg.editorRef.current!.getValue().split('\n')!;
      if (lines.length === 1 || lines.length > 2 || !lines[1].startsWith('store.')) {
        arg.editorRef.current!.setValue(s.defaultEditorValue);
      } else {
        const lastLine = arg.editorRef.current!.getModel()!.getLineContent(2);
        arg.onChange(lastLine.substring('store.'.length));
      }
      return s;
    })
  });
  arg.setState(s => ({
    ...s,
    onDidChangeModelContent
  }));
}

const recurseObject = (collector: { str: string }, obj: Record<string, unknown>, level: number) => {
  if (!obj) { return; }
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    collector.str += '\t'.repeat(level);
    const typeofValue = typeof (value);
    if (is.primitive(value)) {
      collector.str += `${key}: ${typeofValue};\n`;
    } else if (is.null(value)) {
      collector.str += `${key}: null;\n`;
    } else if (is.array(value)) {
      if (value.length === 0) {
        collector.str += `${key}: Array<any>;\n`;
      } else if (is.primitive(value[0])) {
        collector.str += `${key}: Array<${typeof (value[0])}>;\n`;
      } else if (is.null(value[0])) {
        collector.str += `${key}: Array<null>;\n`;
      } else {
        const collectorInner = { str: '{\n' };
        recurseObject(collectorInner, value[0] as Record<string, unknown>, level + 1);
        collector.str += `${key}: Array<${collectorInner.str}${'\t'.repeat(level)}>;\n`;
      }
    } else if (typeof value === 'object') {
      const collectorInner = { str: '{\n' };
      recurseObject(collectorInner, value as Record<string, unknown>, level + 1);
      collector.str += `${key}: ${collectorInner.str}${'\t'.repeat(level)}};\n`;
    }
  });
}