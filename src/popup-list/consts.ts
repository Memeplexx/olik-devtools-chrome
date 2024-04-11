import { ReactNode } from "react";
import { IconType } from "react-icons"


export type Position = 'right' | 'below' | 'above' | 'left';

export type PopupOptionProps = {
  onClick: () => unknown,
  icon?: IconType,
  text: string,
  if?: boolean,
  selected?: boolean,
}

export type PopupListProps = {
  children: ReactNode,
  if?: boolean
  position: Position,
}