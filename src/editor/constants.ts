import { useHooksInitializer } from './hooks';


export type EditorProps = {
  state: Record<string, unknown> | null,
}

export type EditorHookArgs = ReturnType<typeof useHooksInitializer>
