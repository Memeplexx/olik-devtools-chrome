import { RecursiveRecord } from 'olik';
import { useHooksInitializer } from './hooks';


export type EditorProps = {
  state: RecursiveRecord | null,
}

export type EditorHookArgs = ReturnType<typeof useHooksInitializer>
