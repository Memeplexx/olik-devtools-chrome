import React from "react";
import * as monaco from 'monaco-editor';
import { EditorHookArgs, EditorProps } from "./constants";
import * as olikTypeDefsText from '../../node_modules/olik/dist/type.d.ts?raw';
import { RecursiveRecord, updateFunctions } from "olik";
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

const olikTypeDefsAsString = olikTypeDefsText.default.replace(/\n|\r/g, "");

const lineHeight = 18;

export const useHooks = (props: EditorProps) => {
  const divEl = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const runErrorChecker = useErrorChecker();
  const hookArgs = { divEl, editorRef, runErrorChecker, ...props };
  useMonacoTextEditor(hookArgs);
  addTypescriptSupportToEditor();
  useEditorValueSetter(hookArgs);
  useEditorChangeListener(hookArgs);
  useEditLimiter(hookArgs);
  return {
    divEl
  }
}

const addTypescriptSupportToEditor = () => {
  self.MonacoEnvironment = {
    getWorker: () => new tsWorker(),
  };
}

const useEditorValueSetter = ({ editorRef, state }: EditorHookArgs) => {
  const propsStateRef = React.useRef(state);
  if (state && state !== propsStateRef.current) {
    propsStateRef.current = state;
    editorRef.current?.setValue([
      olikTypeDefsAsString + `; const store: Store<${generateTypeDefinition(state).replace(/\n|\r/g, "")}>;`,
      'store.',
    ].join('\n'));
  }
}

const useEditorChangeListener = ({ editorRef, onChange, runErrorChecker }: EditorHookArgs) => {
  React.useEffect(() => {
    const subscription = editorRef.current!.onDidChangeModelContent(() => {
      const value = editorRef.current!.getValue();
      const lines = value.split('\n')!;
      if (lines.length >= 3) { // user must have pressed enter
        const lastSeg = lines[1].split('.').reverse()[0];
        const arg = lastSeg.match(/\(([^)]*)\)/)?.[1];
        const containsParenthesis = arg !== null && arg !== undefined;
        if (containsParenthesis) {
          const functionName = lastSeg.split('(')[0];
          if (updateFunctions.includes(functionName)) {
            runErrorChecker().then(hasErrors => {
              if (hasErrors) {
                editorRef.current!.setValue(lines.slice(0, 2).join('\n'));
                editorRef.current!.setPosition({ lineNumber: 2, column: editorRef.current!.getValue().length + 1 });
              } else {
                onChange(lines[1] + '\n'); // make sure that the state is updated
                const lineSplit = lines[1].split('.');
                lineSplit.pop();
                const newValue = [lines[0], lineSplit.join('.')].join('\n');
                setTimeout(() => {
                  editorRef.current!.setValue(newValue);
                  editorRef.current!.setPosition({ lineNumber: 2, column: editorRef.current!.getValue().length + 1 });
                });
              }
            }).catch(() => {
              console.log('error running error checker');
            })
            return;
          }
        }
        editorRef.current!.setValue(lines.slice(0, 2).join('\n'));
      } else {
        setTimeout(() => onChange(lines[1]));
      }
    });
    return () => subscription.dispose();
  }, [editorRef, onChange, runErrorChecker]);
}

const useMonacoTextEditor = ({ divEl, editorRef }: EditorHookArgs) => {
  React.useEffect(() => {
    if (!divEl.current || !!editorRef.current) { return; }


    monaco.editor.defineTheme('olik-editor-theme', {
      base: 'vs-dark',
      inherit: false,
      rules: [       
        { token: 'green', background: 'FF0000', foreground: '00FF00', fontStyle: 'italic'},
        { token: 'red', foreground: 'FF0000' , fontStyle: 'bold underline'},
        // { background: '000000' },
        // { foreground: 'FFFFFF' }
      ],
      colors: {
        'editor.foreground': '#FFFFFF',
        'editor.background': '#00000000',
      }
    });

    editorRef.current = monaco.editor.create(divEl.current, {
      language: 'typescript',
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
    return () => {
      editorRef.current?.dispose();
      editorRef.current = null;
    }
  }, [divEl, editorRef])
}


const generateTypeDefinition = (obj: RecursiveRecord) => {
  const collector = { str: `{\n` };
  recurseObject(collector, obj, 1);
  collector.str += '};\n';
  return collector.str;
}

const recurseObject = (collector: { str: string }, obj: RecursiveRecord, level: number) => {
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

const useEditLimiter = ({ editorRef }: EditorHookArgs) => {
  React.useEffect(() => {
    const subscription = editorRef.current!.onDidScrollChange(() => {
      if (editorRef.current!.getScrollTop() !== lineHeight) {
        editorRef.current!.setScrollPosition({ scrollTop: lineHeight });
        editorRef.current!.setPosition({ lineNumber: 2, column: editorRef.current!.getValue().length + 1 });
      }
    });
    return () => subscription.dispose();
  }, [editorRef]);
}

const useErrorChecker = () => {
  return React.useCallback(() => {
    return new Promise<boolean>(resolve => {
      const sub = monaco.editor.onDidChangeMarkers(([uri]) => {
        const markers = monaco.editor.getModelMarkers({ resource: uri })
        const hasErrors = !!markers.filter(e => e.startLineNumber === 2).length;
        sub.dispose();
        resolve(hasErrors);
      })
    })
  }, []);
}
