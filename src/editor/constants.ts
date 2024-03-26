import { editor } from "monaco-editor"
import { useLocalState } from "./inputs";

export type Props = {
  state: Record<string, unknown> | null,
  onChange: (query: string) => void,
  onEnter: (query: string) => void,
}

export const editorRefOptions: editor.IStandaloneEditorConstructionOptions = {
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
}

export const editorTheme: editor.IStandaloneThemeData = {
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
}

export type State = ReturnType<typeof useLocalState>;
