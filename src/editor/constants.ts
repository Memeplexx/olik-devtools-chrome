import { useHooksInitializer } from './inputs';


export type EditorProps = {
  state: Record<string, unknown> | null,
  onQueryChanged: (query: string) => void,
}

export type EditorHookArgs = ReturnType<typeof useHooksInitializer>
