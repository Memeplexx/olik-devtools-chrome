import React from "react";
import * as monaco from 'monaco-editor';
import { EditorHookArgs, EditorProps } from "./constants";
import * as olikTypeDefsText from '../../node_modules/olik/dist/type.d.ts?raw';
import { RecursiveRecord } from "olik";
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useOnInitDom } from "../shared/functions";

const olikTypeDefsAsString = olikTypeDefsText.default.replace(/\n|\r/g, "");

const lineHeight = 18;

export const useHooks = (props: EditorProps) => {
  const hookArgs = useHooksInitializer(props);
  useOnInitDom(() => {
    initializeTextEditor(hookArgs);
    addTypescriptSupportToEditor(hookArgs);
    updateTypeDefinitions(hookArgs);
    preventCertainEditorActions(hookArgs);
    limitEditorScrolling(hookArgs);
  })
  return {
    ...hookArgs,
  }
}

export const useHooksInitializer = (props: EditorProps) => {
  const divEl = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  return {
    divEl,
    editorRef,
    ...props,
  };
}

const addTypescriptSupportToEditor = (args: EditorHookArgs) => {
  if (!args.editorRef.current) { return; }
  self.MonacoEnvironment = {
    getWorker: () => new tsWorker(),
  };
}

const updateTypeDefinitions = (args: EditorHookArgs) => {
  if (!args.editorRef.current) { return; }
  const typeDefString = olikTypeDefsAsString + `; const store: Store<${generateTypeDefinition(args.state!).replace(/\n|\r/g, "")}>;`;
  args.editorRef.current?.setValue([typeDefString, 'store.'].join('\n'));
}

const preventCertainEditorActions = (args: EditorHookArgs) => {
  if (!args.editorRef.current) { return; }
  args.editorRef.current.onDidChangeModelContent(() => {
    const value = args.editorRef.current!.getValue();
    const lines = value.split('\n')!;
    if (!lines[1].startsWith('store.')) {
      args.editorRef.current!.setValue([lines[0], 'store.'].join('\n'));
      args.editorRef.current!.setPosition({ lineNumber: 2, column: value.length + 1 });
    }
  })
}

const initializeTextEditor = ({ divEl, editorRef }: EditorHookArgs) => {
  if (!divEl.current || !!editorRef.current) { return; }
  monaco.editor.defineTheme('olik-editor-theme', {
    base: 'vs-dark',
    inherit: false,
    rules: [
      { token: 'green', background: 'FF0000', foreground: '00FF00', fontStyle: 'italic' },
      { token: 'red', foreground: 'FF0000', fontStyle: 'bold underline' },
    ],
    colors: {
      'editor.foreground': '#FFFFFF',
      'editor.background': '#00000000',
    }
  });
  editorRef.current = monaco.editor.create(divEl.current, {
    language: 'typescript',
    fontSize: 11,
    minimap: {
      enabled: false
    },
    scrollbar: {
      vertical: 'hidden',
      handleMouseWheel: false,
      verticalSliderSize: 0,
      horizontal: 'hidden',
    },
    wordWrapOverride1: 'off',
    lineNumbers: 'off',
    glyphMargin: false,
    folding: false,
    // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    // theme: 'vs-dark',
    theme: 'olik-editor-theme',
  });
  editorRef.current.setScrollPosition({ scrollTop: lineHeight });
}


const generateTypeDefinition = (obj: RecursiveRecord) => {
  const collector = { str: `{\n` };
  recurseObject(collector, obj, 1);
  collector.str += '};\n';
  return collector.str;
}

const recurseObject = (collector: { str: string }, obj: RecursiveRecord, level: number) => {
  if (!obj) { return; }
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    collector.str += '\t'.repeat(level);
    const typeofValue = typeof (value);
    if (['boolean', 'number', 'string'].includes(typeofValue)) {
      collector.str += `${key}: ${typeofValue};\n`;
    } else if (value === null) {
      collector.str += `${key}: null;\n`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        collector.str += `${key}: Array<any>;\n`;
      } else if (['boolean', 'number', 'string'].includes(typeof value[0])) {
        collector.str += `${key}: Array<${typeof (value[0])}>;\n`;
      } else if (value[0] === null) {
        collector.str += `${key}: Array<null>;\n`;
      } else {
        const collectorInner = { str: '{\n' };
        recurseObject(collectorInner, value[0] as RecursiveRecord, level + 1);
        collector.str += `${key}: Array<${collectorInner.str}${'\t'.repeat(level)}>;\n`;
      }
    } else if (typeof value === 'object') {
      const collectorInner = { str: '{\n' };
      recurseObject(collectorInner, value, level + 1);
      collector.str += `${key}: ${collectorInner.str}${'\t'.repeat(level)}};\n`;
    }
  });
}

const limitEditorScrolling = ({ editorRef }: EditorHookArgs) => {
  editorRef.current!.onDidScrollChange(() => {
    if (editorRef.current!.getScrollTop() !== lineHeight) {
      editorRef.current!.setScrollPosition({ scrollTop: lineHeight });
      editorRef.current!.setPosition({ lineNumber: 2, column: editorRef.current!.getValue().length + 1 });
    }
  });
}

