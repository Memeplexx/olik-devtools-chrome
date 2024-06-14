import { IDisposable, editor } from 'monaco-editor';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useRef } from "react";
import * as olikTypeDefsText from '../../node_modules/olik/dist/type.d.ts?raw';
import { useRecord } from "../shared/functions";
import { Props, State, editorRefOptions, editorTheme } from "./constants";
import { is } from '../shared/type-check';

const olikTypeDefsAsString = olikTypeDefsText.default.replace(/\n|\r/g, "");

const lineHeight = 18;

export const useInputs = (props: Props) => {
  const state = useLocalState();
  instantiateEditor(props, state);
  respondToEditorScrollChanges(state);
  respondToEditorTextChanges(props, state);
  respondToEditorEnterKeyup(props, state);
  useStateChangeResponder(props, state);
  return state;
}

export const useLocalState = () => useRecord({
  defaultEditorValue: '',
  onDidScrollChange: null as null | IDisposable,
  onDidChangeModelContent: null as null | IDisposable,
  onKeyUp: null as null | IDisposable,
  divEl: useRef<HTMLDivElement>(null),
  editorRef: useRef<editor.IStandaloneCodeEditor | null>(null),
});

const instantiateEditor = (props: Props, state: State) => {
  if (!state.divEl.current || state.editorRef.current || !props.state) { return; }
  self.MonacoEnvironment = { getWorker: () => new tsWorker() };
  editor.defineTheme('olik-editor-theme', editorTheme);
  state.editorRef.current = editor.create(state.divEl.current, editorRefOptions);
  state.editorRef.current.setScrollPosition({ scrollTop: lineHeight });
  state.editorRef.current.setValue(reGenerateTypeDefinitions(props, state));
}

const reGenerateTypeDefinitions = (props: Props, state: State) => {
  const recurse = (val: unknown): string => {
    if (is.primitive(val)) return `"${typeof val}"`;
    if (is.date(val)) return '"Date"';
    if (is.null(val)) return '"null"';
    if (is.record(val)) return `{${Object.keys(val).map(key => `"${key}": ${recurse(val[key])}`).join(',')}}`;
    if (is.array(val)) return `[${val.length ? recurse(val[0]) : ''}]`;
    throw new Error(`Unhandled type: ${val === undefined ? 'undefined' : val!.toString()}`);
  }
  const typeDef = recurse(props.state);
  // console.log(JSON.stringify(JSON.parse(typeDef), null, 2)); // un-comment to debug
  const defaultEditorValue = [olikTypeDefsAsString + `; const store: Store<${typeDef.replace(/"/g, '')}>;`, 'store.'].join('\n');
  state.set({ defaultEditorValue })
  return defaultEditorValue;
}

const respondToEditorScrollChanges = (state: State) => {
  if (!state.editorRef.current || state.onDidScrollChange) { return; }
  const onDidScrollChange = state.editorRef.current.onDidScrollChange(() => {
    if (state.editorRef.current!.getScrollTop() === lineHeight) { return; }
    state.editorRef.current!.setScrollPosition({ scrollTop: lineHeight });
    state.editorRef.current!.setPosition({ lineNumber: 2, column: state.editorRef.current!.getValue().length + 1 });
  })
  state.set({ onDidScrollChange });
}

const respondToEditorTextChanges = (props: Props, state: State) => {
  if (!state.editorRef.current || state.onDidChangeModelContent) { return; }
  const onDidChangeModelContent = state.editorRef.current.onDidChangeModelContent(() => {
    const lines = state.editorRef.current!.getValue().split('\n')!;
    if (lines.length === 1 || lines.length > 2 || !lines[1].startsWith('store.')) {
      state.editorRef.current!.setValue(state.defaultEditorValue);
    } else {
      const lastLine = getSecondLineContent(state);
      props.onChange(lastLine.substring('store.'.length));
    }
  });
  state.set({ onDidChangeModelContent });
}

const respondToEditorEnterKeyup = (props: Props, state: State) => {
  if (!state.editorRef.current || state.onKeyUp) { return; }
  const onKeyUp = state.editorRef.current.onKeyDown(e => {
    if (e.code !== 'Enter') return;
    e.preventDefault();
    const hasError = editor.getModelMarkers({}).some(e => e.startLineNumber === 2);
    if (hasError) { return; }
    const lastLine = state.editorRef.current!.getModel()!.getLineContent(2);
    props.onEnter(lastLine.substring('store.'.length));
  });
  state.set({ onKeyUp });
}

const useStateChangeResponder = (props: Props, state: State) => {
  const previousStateRef = useRef(props.state);
  if (!props.state) return;
  if (props.state === previousStateRef.current) return;
  if (getSecondLineContent(state) !== 'store.') return;
  const defaultEditorValue = reGenerateTypeDefinitions(props, state);
  setTimeout(() => state.editorRef.current!.setValue(defaultEditorValue));
  previousStateRef.current = props.state;
}

const getSecondLineContent = (state: State) => {
  if (!state.editorRef.current) return '';
  const model = state.editorRef.current.getModel()!;
  if (model.getLineCount() === 1) return '';
  return model.getLineContent(2);
}
