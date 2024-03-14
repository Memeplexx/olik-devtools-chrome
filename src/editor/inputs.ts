import { useEffect, useRef, useState } from "react";
import { editor } from 'monaco-editor';
import { EditorHookArgs, EditorProps } from "./constants";
import * as olikTypeDefsText from '../../node_modules/olik/dist/type.d.ts?raw';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

const olikTypeDefsAsString = olikTypeDefsText.default.replace(/\n|\r/g, "");

const lineHeight = 18;

export const useInputs = (props: EditorProps) => {
  const hookArgs = useHooksInitializer(props);
  useInitializeTextEditor(hookArgs);
  useAddTypescriptSupportToEditor();
  useUpdateTypeDefinitions(hookArgs);
  usePreventCertainEditorActions(hookArgs);
  useLimitEditorScrolling(hookArgs);
  return {
    ...hookArgs,
  }
}

export const useHooksInitializer = (props: EditorProps) => {
  const [initialized, setInitialized] = useState(false);
  const divEl = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  return {
    divEl,
    editorRef,
    initialized,
    setInitialized,
    ...props,
  };
}

const useAddTypescriptSupportToEditor = () => {
  useEffect(() => {
    self.MonacoEnvironment = {
      getWorker: () => new tsWorker(),
    };
  }, [])
}

const useUpdateTypeDefinitions = (args: EditorHookArgs) => {
  const editor = args.editorRef.current;
  const [typeDef, setTypeDef] = useState<string>('');
  useEffect(() => {
    setTypeDef(generateTypeDefinition(args.state!).replace(/\n|\r/g, ""));
  }, [args.state]);
  useEffect(() => {
    if (!editor) { return; }
    const typeDefString = olikTypeDefsAsString + `; const store: Store<${typeDef}>;`;
    editor.setValue([typeDefString, 'store.'].join('\n'));
  }, [editor, typeDef, args.initialized]);
}

const usePreventCertainEditorActions = (args: EditorHookArgs) => {
  const editorRef = args.editorRef.current;
  const queryChangedRef = useRef(args.onQueryChanged);
  useEffect(() => {
    if (!editorRef) { return; }
    editorRef.onDidChangeModelContent(() => {
      const value = editorRef.getValue();
      const lines = value.split('\n')!;
      if (value.trim() === '') {
        // const typeDefString = olikTypeDefsAsString + `; const store: Store<${typeDef}>;`;
        // editorRef.setValue([typeDefString, 'store.'].join('\n'));
      } else if (!lines[1].startsWith('store.')) {
        editorRef.setValue([lines[0], 'store.'].join('\n'));
        editorRef.setPosition({ lineNumber: 2, column: value.length + 1 });
      } else if (lines.length > 2) {
        editorRef.setValue([lines[0], lines[1]].join('\n'));
      } else {
        const lastLine = editorRef.getModel()!.getLineContent(2);
        queryChangedRef.current(lastLine.substring('store.'.length));
      }
    })
  }, [editorRef])
}

const useInitializeTextEditor = (args: EditorHookArgs) => {
  const divEl = args.divEl.current;
  const editorRef = args.editorRef;
  const setInitialized = useRef(args.setInitialized);
  useEffect(() => {
    if (!divEl || !!editorRef.current) { return; }
    editor.defineTheme('olik-editor-theme', {
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
    editorRef.current = editor.create(divEl, {
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
    setInitialized.current(true);
    editorRef.current.setScrollPosition({ scrollTop: lineHeight });
  }, [divEl, editorRef])
}


const generateTypeDefinition = (obj: Record<string, unknown>) => {
  const collector = { str: `{\n` };
  recurseObject(collector, obj, 1);
  collector.str += '};\n';
  return collector.str;
}

const recurseObject = (collector: { str: string }, obj: Record<string, unknown>, level: number) => {
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

const useLimitEditorScrolling = (args: EditorHookArgs) => {
  const editor = args.editorRef.current!;
  useEffect(() => {
    if (!editor) { return; }
    const listener = editor.onDidScrollChange(() => {
      if (editor.getScrollTop() !== lineHeight) {
        editor.setScrollPosition({ scrollTop: lineHeight });
        editor.setPosition({ lineNumber: 2, column: editor.getValue().length + 1 });
      }
    });
    return () => listener.dispose()
  }, [editor])
}

