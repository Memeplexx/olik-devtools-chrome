import { RecursiveRecord } from "olik";

export interface TreeProps {
  state: RecursiveRecord | null,
  query: string,
  selectedState: RecursiveRecord | null,
  className?: string,
}
