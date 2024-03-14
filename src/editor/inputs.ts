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
  respondToEditorEnterKeyup(localState);
  return localState;
}

const useLocalState = (props: EditorProps) => {
  const [state, setState] = useState({
    defaultEditorValue: '',
    divEl: useRef<HTMLDivElement>(null),
    editorRef: useRef<editor.IStandaloneCodeEditor | null>(null),
    onDidScrollChange: null as null | IDisposable,
    onDidChangeModelContent: null as null | IDisposable,
    onKeyUp: null as null | IDisposable,
  });
  return { ...props, ...state, setState };
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
  const recurse = (val: unknown): string => {
    if (is.primitive(val)) {
      return `"${typeof val}"`;
    } else if (is.date(val)) {
      return '"Date"';
    } else if (is.null(val)) {
      return '"null"';
    } else if (is.nonArrayObject(val)) {
      return `{${Object.keys(val).map(key => `"${key}": ${recurse(val[key])}`).join(',')}}`;
    } else if (is.array(val)) {
      return `[${val.length ? recurse(val[0]) : ''}]`;
    } else {
      throw new Error(`Unhandled type: ${val === undefined ? 'undefined' : val!.toString()}`);
    }
  }
  const typeDef = recurse(arg.state!);
  // console.log(JSON.stringify(JSON.parse(typeDef), null, 2)); // un-comment to debug
  const defaultEditorValue = [olikTypeDefsAsString + `; const store: Store<${typeDef.replace(/"/g, '')}>;`, 'store.'].join('\n');
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
      const lines = s.editorRef.current!.getValue().split('\n')!;
      if (lines.length === 1 || lines.length > 2 || !lines[1].startsWith('store.')) {
        s.editorRef.current!.setValue(s.defaultEditorValue);
      } else {
        const lastLine = s.editorRef.current!.getModel()!.getLineContent(2);
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

const respondToEditorEnterKeyup = (arg: ReturnType<typeof useLocalState>) => {
  if (!arg.editorRef.current || arg.onKeyUp) { return; }
  const onKeyUp = arg.editorRef.current.onKeyDown((e) => {
    if (e.code !== 'Enter') { return; }
    e.preventDefault();
    const hasError = editor.getModelMarkers({}).some(e => e.startLineNumber === 2);
    if (hasError) { return; }
    const lastLine = arg.editorRef.current!.getModel()!.getLineContent(2);
    arg.onEnter(lastLine.substring('store.'.length));
    arg.setState(s => {
      s.editorRef.current!.setValue(s.defaultEditorValue);
      return s;
    });
  });
  arg.setState(s => ({
    ...s,
    onKeyUp
  }));
}
