import { Fragment, ReactNode } from "react"

export const Frag = (props: { if?: boolean, children?: ReactNode }) => {
  return props.if === false ? null : <Fragment children={props.children} />
}