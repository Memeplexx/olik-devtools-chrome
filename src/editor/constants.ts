import * as monaco from 'monaco-editor';

export type EditorHookArgs = {
  divEl: React.RefObject<HTMLDivElement>,
  runErrorChecker: () => Promise<boolean>,
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
} & EditorProps;

export type EditorProps = {
  state?: any,
  onChange: (text: string) => void,
}