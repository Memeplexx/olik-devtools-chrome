import * as monaco from 'monaco-editor'; 
import { RecursiveRecord } from 'olik';

export type EditorHookArgs = {
  divEl: React.RefObject<HTMLDivElement>,
  runErrorChecker: () => Promise<boolean>,
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
} & EditorProps;

export type EditorProps = {
  query: string,
  state: RecursiveRecord | null,
  onChange: (text: string) => void,
}