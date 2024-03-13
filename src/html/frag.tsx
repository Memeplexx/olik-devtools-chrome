import { Fragment, ReactNode } from "react"

export const Frag = ({ showIf, children }: { showIf?: boolean, children?: ReactNode }) => {
  return showIf === false ? null : <Fragment children={children} />
}