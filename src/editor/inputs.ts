import { IDisposable, editor } from 'monaco-editor';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useRef } from "react";
import * as olikTypeDefsText from '../../node_modules/olik/dist/type.d.ts?raw';
import { is, useRecord } from "../shared/functions";
import { EditorProps, State, editorRefOptions, editorTheme } from "./constants";

const olikTypeDefsAsString = olikTypeDefsText.default.replace(/\n|\r/g, "");

const lineHeight = 18;

export const useInputs = (props: EditorProps) => {
  const localState = useLocalState();
  instantiateEditor(props, localState);
  respondToEditorScrollChanges(localState);
  respondToEditorTextChanges(props, localState);
  respondToEditorEnterKeyup(props, localState);
  useStateChangeResponder(props, localState);
  return localState;
}

export const useLocalState = () => {
  const record = useRecord({
    defaultEditorValue: '',
    onDidScrollChange: null as null | IDisposable,
    onDidChangeModelContent: null as null | IDisposable,
    onKeyUp: null as null | IDisposable,
  });
  return {
    ...record,
    divEl: useRef<HTMLDivElement>(null),
    editorRef: useRef<editor.IStandaloneCodeEditor | null>(null),
  };
}

const instantiateEditor = (props: EditorProps, state: State) => {
  if (!state.divEl.current || state.editorRef.current || !props.state) { return; }
  self.MonacoEnvironment = { getWorker: () => new tsWorker() };
  editor.defineTheme('olik-editor-theme', editorTheme);
  state.editorRef.current = editor.create(state.divEl.current, editorRefOptions);
  state.editorRef.current.setScrollPosition({ scrollTop: lineHeight });
  const defaultEditorValue = reGenerateTypeDefinitions(props, state);
  state.editorRef.current.setValue(defaultEditorValue);
}

const reGenerateTypeDefinitions = (props: EditorProps, state: State) => {
  const recurse = (val: unknown): string => {
    if (is.primitive(val)) {
      return `"${typeof val}"`;
    } else if (is.date(val)) {
      return '"Date"';
    } else if (is.null(val)) {
      return '"null"';
    } else if (is.record(val)) {
      return `{${Object.keys(val).map(key => `"${key}": ${recurse(val[key])}`).join(',')}}`;
    } else if (is.array(val)) {
      return `[${val.length ? recurse(val[0]) : ''}]`;
    } else {
      throw new Error(`Unhandled type: ${val === undefined ? 'undefined' : val!.toString()}`);
    }
  }
  const typeDef = recurse(props.state);
  // console.log(JSON.stringify(JSON.parse(typeDef), null, 2)); // un-comment to debug
  const defaultEditorValue = [olikTypeDefsAsString + `; const store: Store<${typeDef.replace(/"/g, '')}>;`, 'store.'].join('\n');
  state.setState({ defaultEditorValue })
  return defaultEditorValue;
}

const respondToEditorScrollChanges = (state: State) => {
  if (!state.editorRef.current || state.onDidScrollChange) { return; }
  const onDidScrollChange = state.editorRef.current.onDidScrollChange(() => {
    if (state.editorRef.current!.getScrollTop() === lineHeight) { return; }
    state.editorRef.current!.setScrollPosition({ scrollTop: lineHeight });
    state.editorRef.current!.setPosition({ lineNumber: 2, column: state.editorRef.current!.getValue().length + 1 });
  })
  state.setState({ onDidScrollChange });
}

const respondToEditorTextChanges = (props: EditorProps, state: State) => {
  if (!state.editorRef.current || state.onDidChangeModelContent) { return; }
  const onDidChangeModelContent = state.editorRef.current.onDidChangeModelContent(() => {
    const lines = state.editorRef.current!.getValue().split('\n')!;
    if (lines.length === 1 || lines.length > 2 || !lines[1].startsWith('store.')) {
      state.editorRef.current!.setValue(state.defaultEditorValue);
    } else {
      const lastLine = state.editorRef.current!.getModel()!.getLineContent(2);
      props.onChange(lastLine.substring('store.'.length));
    }
  });
  state.setState({ onDidChangeModelContent });
}

const respondToEditorEnterKeyup = (props: EditorProps, state: State) => {
  if (!state.editorRef.current || state.onKeyUp) { return; }
  const onKeyUp = state.editorRef.current.onKeyDown((e) => {
    if (e.code !== 'Enter') { return; }
    e.preventDefault();
    const hasError = editor.getModelMarkers({}).some(e => e.startLineNumber === 2);
    if (hasError) { return; }
    const lastLine = state.editorRef.current!.getModel()!.getLineContent(2);
    props.onEnter(lastLine.substring('store.'.length));
  });
  state.setState({ onKeyUp });
}

const useStateChangeResponder = (props: EditorProps, state: State) => {
  const previousStateRef = useRef(props.state);
  if (!props.state) { return; }
  if (props.state !== previousStateRef.current) {
    const defaultEditorValue = reGenerateTypeDefinitions(props, state);
    setTimeout(() => state.editorRef.current!.setValue(defaultEditorValue));
    previousStateRef.current = props.state;
  }
}
